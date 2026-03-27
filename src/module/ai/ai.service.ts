import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { createAgent } from 'langchain';
import { DrugService } from '../basic/drug/drug.service';
import { WarehouseService } from '../basic/warehouse/warehouse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '@/entity/Inventory';
import { Repository } from 'typeorm';
import { ChatResponse, ChatMessage, ToolUsage } from './tools/tool.types';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { createDrugTools } from './tools/drug.tools';
import { createWarehouseTools } from './tools/warehouse.tools';
import { createInventoryTools } from './tools/inventory.tools';
import { searchDocsTool } from './tools/searchDocTool';

/**
 * 定义 Agent 调用返回的状态结构
 */
interface AgentState {
  messages: BaseMessage[];
}

/**
 * 定义具有工具调用的消息接口
 */
interface MessageWithToolCalls extends BaseMessage {
  tool_calls?: Array<{
    name: string;
    args: Record<string, any>;
    id?: string;
  }>;
}

/**
 * 定义 Agent 接口以避免 any
 */
interface IAgent {
  invoke(input: { messages: BaseMessage[] }): Promise<AgentState>;
  stream(
    input: { messages: BaseMessage[] },
    options?: { streamMode?: string },
  ): Promise<AsyncIterable<[BaseMessage, any]>>;
}

@Injectable()
export class AiService implements OnModuleInit {
  private agent: IAgent | null = null;

  constructor(
    private readonly drugService: DrugService,
    private readonly warehouseService: WarehouseService,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  onModuleInit() {
    this.init();
  }

  init() {
    const model = new ChatOllama({
      model: 'gpt-oss:120b-cloud',
      temperature: 0,
    });

    const tools = [
      ...createDrugTools(this.drugService),
      ...createWarehouseTools(this.warehouseService),
      ...createInventoryTools(this.inventoryRepository, this.warehouseService),
      searchDocsTool,
    ];

    this.agent = createAgent({
      model: model,
      tools: tools,
      systemPrompt: `你是一个医药系统的智能助手，你的职责是帮助用户查询系统数据。

## 可用的工具
你可以通过调用以下工具来获取数据：
- query_drug_list: 查询药品目录列表
- query_warehouse_list: 查询仓库列表  
- query_inventory: 查询药品库存
- search_langchain_docs: 搜索 LangChain 文档来回答关于 LCEL、表达式语言的问题

## 重要规则
1. 当用户询问药品、仓库或库存相关问题时，你必须调用相应的工具来获取数据
2. 禁止编造数据，必须基于工具返回的真实结果来回答
3. 如果不确定用户指的是什么，可以先调用相关工具查看所有数据
4. 回答要简洁明了，直接展示查询结果`,
    }) as unknown as IAgent;
  }

  async chatWithData(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }
    const input = {
      messages: this.convertMessages(messages),
    };

    const result = await this.agent.invoke(input);
    const lastMessage = result.messages[result.messages.length - 1];

    // 提取使用的工具信息
    const usedTools: ToolUsage[] = [];
    for (const msg of result.messages) {
      const msgWithTools = msg as MessageWithToolCalls;
      if (msgWithTools.additional_kwargs?.tool_calls) {
        const toolCalls = msgWithTools.additional_kwargs.tool_calls as Array<{
          function?: { name?: string; arguments?: string };
        }>;
        for (const tc of toolCalls) {
          usedTools.push({
            name: tc.function?.name || '',
            args: JSON.parse(tc.function?.arguments || '{}') as Record<
              string,
              any
            >,
          });
        }
      }
      if (msgWithTools.tool_calls && Array.isArray(msgWithTools.tool_calls)) {
        for (const tc of msgWithTools.tool_calls) {
          usedTools.push({ name: tc.name, args: tc.args });
        }
      }
    }

    return {
      reply:
        typeof lastMessage.content === 'string'
          ? lastMessage.content
          : JSON.stringify(lastMessage.content),
      usedTools,
    };
  }

  /**
   * 返回流式对话结果
   */
  chatStreamWithToolCalling(messages: ChatMessage[]) {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }
    const input = {
      messages: this.convertMessages(messages),
    };

    const usedTools: ToolUsage[] = [];

    const stream = new ReadableStream({
      start: async (controller) => {
        try {
          if (!this.agent) return;
          const events = await this.agent.stream(input, {
            streamMode: 'messages',
          });
          for await (const [message] of events) {
            // 检查工具调用
            const msgWithTools = message as MessageWithToolCalls;
            if (
              msgWithTools.tool_calls &&
              Array.isArray(msgWithTools.tool_calls)
            ) {
              for (const tc of msgWithTools.tool_calls) {
                usedTools.push({ name: tc.name, args: tc.args });
              }
            }

            // 发送内容块（模拟 Zhipu 响应格式以保持 controller 兼容性）
            if (message.content && typeof message.content === 'string') {
              const chunk = {
                choices: [{ delta: { content: message.content } }],
              };
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`),
              );
            }
          }
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return { stream, usedTools };
  }

  private convertMessages(messages: ChatMessage[]): BaseMessage[] {
    return messages.map((m) => {
      if (m.role === 'user') return new HumanMessage(m.content);
      if (m.role === 'assistant') return new AIMessage(m.content);
      if (m.role === 'system') return new SystemMessage(m.content);
      if (m.role === 'tool')
        return new ToolMessage({
          content: m.content,
          tool_call_id: m.tool_call_id || '',
        });
      return new HumanMessage(m.content);
    });
  }
}
