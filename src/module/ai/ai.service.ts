import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}
  async callZhipuAPI(
    messages: { role: string; content: string }[],
    model = 'glm-4.7',
  ): Promise<ReadableStream> {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const apiKey = this.configService.get<string>('AI.ZHIPU_API_KEY');
    if (!apiKey) {
      throw new HttpException(
        'AI.ZHIPU_API_KEY 未配置',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 1.0,
          stream: true,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '调用上游失败';
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText) as {
        error: { code: string; message: string };
      };
      throw new HttpException(
        errorData?.error?.message || errorText,
        response.status,
      );
    }
    if (!response.body) {
      throw new HttpException(
        'Response body is null - streaming not supported',
        HttpStatus.BAD_GATEWAY,
      );
    }

    return response.body;
  }
}
