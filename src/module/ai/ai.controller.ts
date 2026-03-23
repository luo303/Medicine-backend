import { Controller, Post, Body, Res, HttpException } from '@nestjs/common';
import { AiService } from './ai.service';
import type { Response } from 'express';
import type { ChatResponse } from './tools';

interface ReadResult {
  done: boolean;
  value?: Uint8Array;
}

interface ZhipuAIResponse {
  choices?: Array<{
    delta?: {
      reasoning_content?: string;
      content?: string;
    };
  }>;
}

function ensureSystemMessage(
  messages: { role: string; content: string }[],
): { role: string; content: string }[] {
  if (!Array.isArray(messages)) return messages;
  if (messages.length > 0 && messages[0]?.role === 'system') return messages;
  const systemMessage = {
    role: 'system' as const,
    content: `你是一个医药系统的智能助手，你的职责是帮助用户查询系统数据。

## 可用的工具
你可以通过调用以下工具来获取数据：
- query_drug_list: 查询药品目录列表
- query_warehouse_list: 查询仓库列表  
- query_inventory: 查询药品库存

## 重要规则
1. 当用户询问药品、仓库或库存相关问题时，你必须调用相应的工具来获取数据
2. 禁止编造数据，必须基于工具返回的真实结果来回答
3. 如果不确定用户指的是什么，可以先调用相关工具查看所有数据
4. 回答要简洁明了，直接展示查询结果`,
  };
  return [systemMessage, ...messages];
}
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat/stream')
  async callZhipuAPI(
    @Body() body: { messages: { role: string; content: string }[] },
    @Res() res: Response,
  ) {
    const messages = body?.messages;

    try {
      if (!Array.isArray(messages)) {
        res.status(400).json({
          code: 400,
          data: null,
          message: 'messages 必须是数组',
        });
        return;
      }

      const enhancedMessages = ensureSystemMessage(messages);
      const { stream: aiStream, usedTools } =
        await this.aiService.chatStreamWithToolCalling(enhancedMessages);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = aiStream.getReader();
      let buffer = '';
      const decoder = new TextDecoder();

      while (true) {
        const readResult: ReadResult = await reader.read();
        const { done, value } = readResult;

        if (done) {
          if (usedTools.length > 0) {
            res.write('event: message\n');
            res.write(
              `data: ${JSON.stringify({ type: 'used_tools', usedTools })}\n\n`,
            );
          }
          res.write('event: message\n');
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          res.end();
          break;
        }

        if (!value) continue;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          const parsed = JSON.parse(data) as ZhipuAIResponse;
          const reasoning_content =
            parsed.choices?.[0]?.delta?.reasoning_content;
          if (reasoning_content) {
            res.write('event: message\n');
            res.write(
              `data: ${JSON.stringify({ type: 'reasoning_content', reasoning_content })}\n\n`,
            );
            continue;
          }

          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            res.write('event: message\n');

            res.write(
              `data: ${JSON.stringify({ type: 'content', content })}\n\n`,
            );
          }
        }
      }
    } catch (err) {
      if (res.headersSent) {
        res.end();
        return;
      }

      let status = 500;
      let message = 'AI 调用失败';

      if (err instanceof HttpException) {
        status = err.getStatus();
        const response = err.getResponse() as string;
        message = response;
      } else if (err instanceof Error) {
        message = err.message;
      }

      res.status(status).json({
        code: status,
        data: null,
        message,
      });
    }
  }

  @Post('chat/smart')
  async smartChat(
    @Body() body: { messages: { role: string; content: string }[] },
  ): Promise<{ code: number; data: ChatResponse; message: string }> {
    const messages = body?.messages;

    if (!Array.isArray(messages)) {
      throw new HttpException('messages 必须是数组', 400);
    }
    const enhancedMessages = ensureSystemMessage(messages);
    const result = await this.aiService.chatWithData(enhancedMessages);

    return {
      code: 200,
      data: result,
      message: 'success',
    };
  }
}
