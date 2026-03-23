import { AiService } from '../ai.service';
import { ConfigService } from '@nestjs/config';

describe('AiService（AI模块-工具调用）', () => {
  type FetchResponseLike = {
    ok: boolean;
    status: number;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
    body?: ReadableStream | null;
  };

  const createOkJsonResponse = (json: unknown): FetchResponseLike => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(json),
    text: () => Promise.resolve(JSON.stringify(json)),
  });

  const createOkStreamResponse = (body: ReadableStream): FetchResponseLike => ({
    ok: true,
    status: 200,
    body,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });

  const createConfigService = () =>
    ({
      get: (key: string) => {
        if (key === 'AI.ZHIPU_API_KEY') return 'test-key';
        if (key === 'AI.ZHIPU_MODEL') return 'glm-4-plus';
        return undefined;
      },
    }) as unknown as ConfigService;

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('chatWithData：能识别 tool_calls、执行工具并二次补全返回最终回答', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        createOkJsonResponse({
          choices: [
            {
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call_1',
                    function: { name: 'query_drug_list', arguments: '{}' },
                  },
                ],
              },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        createOkJsonResponse({
          choices: [
            {
              message: {
                role: 'assistant',
                content: '这里是药品列表',
              },
            },
          ],
        }),
      );

    const globalWithFetch = globalThis as unknown as { fetch: typeof fetch };
    globalWithFetch.fetch = fetchMock as unknown as typeof fetch;

    const aiService = new AiService(
      createConfigService(),
      {
        findAll: () =>
          Promise.resolve([
            {
              approval_no: 'A-001',
              name: '阿司匹林',
              specification: '100mg',
              is_prescription: false,
            },
          ]),
      } as any,
      { findAll: () => Promise.resolve([]) } as any,
      {} as any,
    );

    const result = await aiService.chatWithData([
      { role: 'user', content: '查询药品列表' },
    ]);

    expect(result.reply).toBe('这里是药品列表');
    expect(result.usedTools).toEqual([{ name: 'query_drug_list', args: {} }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('chatStreamWithToolCalling：有工具调用时，流式请求会带上 tool 消息', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        createOkJsonResponse({
          choices: [
            {
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [
                  {
                    id: 'call_1',
                    function: { name: 'query_drug_list', arguments: '{}' },
                  },
                ],
              },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(createOkStreamResponse(stream));

    const globalWithFetch = globalThis as unknown as { fetch: typeof fetch };
    globalWithFetch.fetch = fetchMock as unknown as typeof fetch;

    const aiService = new AiService(
      createConfigService(),
      { findAll: () => Promise.resolve([]) } as any,
      { findAll: () => Promise.resolve([]) } as any,
      {} as any,
    );

    const result = await aiService.chatStreamWithToolCalling([
      { role: 'user', content: '查询药品列表' },
    ]);

    expect(result.stream).toBe(stream);
    expect(result.usedTools).toEqual([{ name: 'query_drug_list', args: {} }]);

    const calls = fetchMock.mock.calls as unknown as Array<
      [string, RequestInit]
    >;
    const secondCallInit = calls[1][1];
    expect(typeof secondCallInit.body).toBe('string');
    const payload = JSON.parse(secondCallInit.body as string) as {
      stream: boolean;
      messages: Array<{ role: string }>;
    };
    expect(payload.stream).toBe(true);
    expect(payload.messages.some((m) => m.role === 'tool')).toBe(true);
  });
});
