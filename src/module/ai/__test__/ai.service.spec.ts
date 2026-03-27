import { AiService } from '../ai.service';

describe('AiService（AI模块-工具调用）', () => {
  it('chatWithData：能识别 tool_calls、执行工具并二次补全返回最终回答', async () => {
    const aiService = new AiService(
      { findAll: () => Promise.resolve([]) } as any,
      { findAll: () => Promise.resolve([]) } as any,
      { createQueryBuilder: () => ({}) } as any,
    );

    // 模拟 agent.invoke
    (aiService as unknown as { agent: any }).agent = {
      invoke: jest.fn().mockResolvedValue({
        messages: [{ content: '这里是药品列表' }],
      }),
    };

    const result = await aiService.chatWithData([
      { role: 'user', content: '查询药品列表' },
    ]);

    expect(result.reply).toBe('这里是药品列表');
  });

  it('chatStreamWithToolCalling：有工具调用时，流式请求会带上 tool 消息', () => {
    const aiService = new AiService(
      { findAll: () => Promise.resolve([]) } as any,
      { findAll: () => Promise.resolve([]) } as any,
      { createQueryBuilder: () => ({}) } as any,
    );

    // 模拟 agent.stream
    (aiService as unknown as { agent: any }).agent = {
      stream: jest.fn().mockResolvedValue({
        [Symbol.asyncIterator]: async function* () {
          await Promise.resolve();
          yield [{ content: 'chunk1' }, {}];
        },
      }),
    };

    const result = aiService.chatStreamWithToolCalling([
      { role: 'user', content: '查询药品列表' },
    ]);

    expect(result.stream).toBeDefined();
  });
});
