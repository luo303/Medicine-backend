import { Controller, Post, Body, Res, HttpException } from '@nestjs/common';
import { AiService } from './ai.service';
import type { Response } from 'express';
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
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}
  @Post('chat/stream')
  async callZhipuAPI(
    @Body() body: { messages: { role: string; content: string }[] },
    @Res() res: Response, // Express的响应对象
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

      const aiStream = await this.aiService.callZhipuAPI(messages);

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

      // 更简洁的错误处理
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
}
