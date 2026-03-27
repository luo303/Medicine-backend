import { Controller, Post, Body, Res, HttpException } from '@nestjs/common';
import { AiService } from './ai.service';
import type { Response } from 'express';
import { ChatMessage } from './tools';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat/stream')
  async chatStream(
    @Body() body: { messages: ChatMessage[] },
    @Res() res: Response,
  ) {
    const { messages } = body;

    try {
      if (!Array.isArray(messages)) {
        res.status(400).json({ code: 400, message: 'messages 必须是数组' });
        return;
      }

      // ✅ 这里的调用逻辑严格按照你提供的脚本实现
      const input = {
        messages: this.convertMessages(messages),
      };

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // ✅ 具体调用在 controller 实现
      const events = await this.aiService.agent.stream(input, {
        streamMode: 'messages',
      });

      for await (const [token, metadata] of events) {
        // ✅ 严格按照 [token, metadata] 结构输出
        const data = {
          node: metadata.langgraph_node,
          content: token.contentBlocks || token.content,
          tool_calls: token.tool_calls,
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err) {
      this.handleError(err, res);
    }
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

  private handleError(err: unknown, res: Response) {
    if (res.headersSent) {
      res.end();
      return;
    }
    let status = 500;
    let message = 'AI 调用失败';
    if (err instanceof HttpException) {
      status = err.getStatus();
      const response = err.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    res.status(status).json({ code: status, message });
  }
}
