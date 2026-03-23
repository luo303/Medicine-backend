import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrugService } from '../basic/drug/drug.service';
import { WarehouseService } from '../basic/warehouse/warehouse.service';
import { Inventory } from '@/entity/Inventory';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ToolRegistry,
  ChatResponse,
  ToolCall,
  ToolResult,
  ChatMessage,
} from './tools';
import { createDrugTools } from './tools/drug.tools';
import { createWarehouseTools } from './tools/warehouse.tools';
import { createInventoryTools } from './tools/inventory.tools';

type ToolArgs = Record<string, unknown>;
type UsedTool = { name: string; args: ToolArgs };

type BasicMessage = { role: string; content: string };

type OutboundMessage = {
  role: string;
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
};

type ZhipuChatMessage = OutboundMessage & Pick<ChatMessage, 'role'>;

type ZhipuChatCompletionResult = {
  choices?: Array<{
    message?: ZhipuChatMessage;
  }>;
  error?: {
    code?: string;
    message?: string;
  };
};

@Injectable()
export class AiService {
  private toolRegistry: ToolRegistry;

  constructor(
    private configService: ConfigService,
    private drugService: DrugService,
    private warehouseService: WarehouseService,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {
    this.toolRegistry = new ToolRegistry();

    const drugTools = createDrugTools(this.drugService);
    const warehouseTools = createWarehouseTools(this.warehouseService);
    const inventoryTools = createInventoryTools(this.inventoryRepository);

    [...drugTools, ...warehouseTools, ...inventoryTools].forEach((tool) =>
      this.toolRegistry.register(tool),
    );
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('AI.ZHIPU_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'AI.ZHIPU_API_KEY 未配置',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return apiKey;
  }

  private getApiUrl(): string {
    return (
      this.configService.get<string>('AI.ZHIPU_BASE_URL') ||
      'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    );
  }

  private getModel(): string {
    return this.configService.get<string>('AI.ZHIPU_MODEL') || 'glm-4-plus';
  }

  private getTools() {
    return this.toolRegistry.getAll();
  }

  private async executeFunction(
    name: string,
    args: Record<string, any>,
  ): Promise<unknown> {
    return this.toolRegistry.execute(name, args);
  }

  private safeJsonParseObject(value: string): ToolArgs {
    if (!value || typeof value !== 'string') return {};
    const trimmed = value.trim();
    if (!trimmed) return {};
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as ToolArgs;
  }

  private normalizeAssistantMessage(
    message: ZhipuChatMessage,
  ): OutboundMessage {
    return {
      ...message,
      content: message.content ?? '',
    };
  }

  private async postChat(payload: Record<string, any>): Promise<{
    response: globalThis.Response;
    json?: ZhipuChatCompletionResult;
  }> {
    const apiKey = this.getApiKey();
    const url = this.getApiUrl();

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '调用上游失败';
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }

    if (payload.stream === true) {
      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpException(errorText || '上游返回异常', response.status);
      }
      return { response };
    }

    let json: ZhipuChatCompletionResult | undefined;
    try {
      json = (await response.json()) as ZhipuChatCompletionResult;
    } catch {
      const errorText = await response.text().catch(() => '');
      throw new HttpException(
        errorText || '上游响应不是合法 JSON',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!response.ok) {
      throw new HttpException(
        json?.error?.message || '上游返回异常',
        response.status,
      );
    }

    return { response, json };
  }

  private async createChatCompletion(
    messages: OutboundMessage[],
    options?: { temperature?: number; tools?: unknown[]; tool_choice?: string },
  ): Promise<ZhipuChatCompletionResult> {
    const model = this.getModel();
    const { json } = await this.postChat({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      stream: false,
      tools: options?.tools,
      tool_choice: options?.tool_choice,
    });
    if (!json) {
      throw new HttpException('AI 响应异常', HttpStatus.BAD_GATEWAY);
    }
    return json;
  }

  private async createChatStream(
    messages: OutboundMessage[],
    options?: { temperature?: number },
  ): Promise<ReadableStream> {
    const model = this.getModel();
    const { response } = await this.postChat({
      model,
      messages,
      temperature: options?.temperature ?? 1.0,
      stream: true,
    });

    if (!response.body) {
      throw new HttpException(
        'Response body is null - streaming not supported',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return response.body;
  }

  private async runToolCalls(toolCalls: ToolCall[]): Promise<{
    toolResults: ToolResult[];
    usedTools: UsedTool[];
  }> {
    const toolResults: ToolResult[] = [];
    const usedTools: UsedTool[] = [];

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      let functionArgs: ToolArgs = {};

      try {
        functionArgs = this.safeJsonParseObject(toolCall.function.arguments);
      } catch {
        toolResults.push({
          role: 'tool',
          content: JSON.stringify({ error: '工具参数不是合法 JSON' }),
          tool_call_id: toolCall.id,
        });
        usedTools.push({ name: functionName, args: {} });
        continue;
      }

      usedTools.push({ name: functionName, args: functionArgs });

      console.log(`\n🔧 调用工具：${functionName}`);
      console.log('参数:', JSON.stringify(functionArgs, null, 2));

      try {
        const toolOutput = await this.executeFunction(
          functionName,
          functionArgs as Record<string, any>,
        );
        console.log('✅ 工具执行成功');
        console.log('返回:', JSON.stringify(toolOutput, null, 2));

        toolResults.push({
          role: 'tool',
          content: JSON.stringify(toolOutput),
          tool_call_id: toolCall.id,
        });
      } catch (error: any) {
        console.log(
          '❌ 工具执行失败:',
          error instanceof Error ? error.message : String(error),
        );

        toolResults.push({
          role: 'tool',
          content: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
          tool_call_id: toolCall.id,
        });
      }
    }

    return { toolResults, usedTools };
  }

  async callZhipuAPI(messages: BasicMessage[]): Promise<ReadableStream> {
    return this.createChatStream(messages);
  }

  async chatStreamWithToolCalling(messages: BasicMessage[]): Promise<{
    stream: ReadableStream;
    usedTools: UsedTool[];
  }> {
    console.log('\n💬 AI 对话开始');
    console.log('用户消息:', messages[messages.length - 1]?.content);

    const first = await this.createChatCompletion(messages, {
      temperature: 0.7,
      tools: this.getTools(),
      tool_choice: 'auto',
    });

    const firstMessage = first.choices?.[0]?.message;
    if (!firstMessage) {
      throw new HttpException('AI 响应异常', HttpStatus.BAD_GATEWAY);
    }

    const toolCalls = firstMessage.tool_calls || [];
    if (toolCalls.length === 0) {
      console.log('📝 AI 直接回复，无需调用工具');
      const stream = await this.createChatStream(messages, {
        temperature: 1.0,
      });
      return { stream, usedTools: [] };
    }

    console.log(`🎯 AI 请求调用 ${toolCalls.length} 个工具`);
    const { toolResults, usedTools } = await this.runToolCalls(toolCalls);
    const enhancedMessages: OutboundMessage[] = [
      ...messages,
      this.normalizeAssistantMessage(firstMessage),
      ...toolResults,
    ];

    console.log('\n🔄 使用工具结果进行第二轮对话');
    const stream = await this.createChatStream(enhancedMessages, {
      temperature: 0.7,
    });

    return { stream, usedTools };
  }

  async chatWithData(messages: BasicMessage[]): Promise<ChatResponse> {
    console.log('\n💬 AI 对话开始（带数据查询）');
    console.log('用户消息:', messages[messages.length - 1]?.content);

    let conversation: OutboundMessage[] = messages;
    const usedTools: UsedTool[] = [];

    for (let round = 0; round < 3; round++) {
      console.log(`\n🔄 第 ${round + 1} 轮对话`);

      const result = await this.createChatCompletion(conversation, {
        temperature: 0.7,
        tools: this.getTools(),
        tool_choice: 'auto',
      });

      const message = result.choices?.[0]?.message;
      if (!message) {
        throw new HttpException('AI 响应异常', HttpStatus.BAD_GATEWAY);
      }

      const toolCalls = message.tool_calls || [];
      if (toolCalls.length === 0) {
        console.log('📝 AI 生成最终回复');
        console.log('回复内容:', message.content);
        return {
          reply: message.content || '抱歉，我无法回答这个问题',
          usedTools,
        };
      }

      console.log(`🎯 AI 请求调用 ${toolCalls.length} 个工具`);
      const { toolResults, usedTools: used } =
        await this.runToolCalls(toolCalls);
      usedTools.push(...used);
      conversation = [
        ...conversation,
        this.normalizeAssistantMessage(message),
        ...toolResults,
      ];
    }

    throw new HttpException('工具调用轮次过多', HttpStatus.BAD_GATEWAY);
  }
}
