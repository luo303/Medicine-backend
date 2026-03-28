import { AiService } from '../ai.service';
import { IAgent } from '../tools/tool.types';

describe('AiService', () => {
  it('应该正确初始化 Agent', () => {
    const aiService = new AiService(
      { findAll: () => Promise.resolve([]) } as any,
      { findAll: () => Promise.resolve([]) } as any,
      { createQueryBuilder: () => ({}) } as any,
    );

    aiService.init();
    expect(aiService.agent).toBeDefined();
  });

  it('Agent 应该支持 stream 调用', async () => {
    const aiService = new AiService(
      { findAll: () => Promise.resolve([]) } as any,
      { findAll: () => Promise.resolve([]) } as any,
      { createQueryBuilder: () => ({}) } as any,
    );

    const mockStream = jest.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        await Promise.resolve();
        yield [{ content: 'test content' }, { langgraph_node: 'agent' }];
      },
    });

    aiService.agent = {
      stream: mockStream,
    } as unknown as IAgent;

    const events = await aiService.agent.stream({ messages: [] });
    const results = [];
    for await (const event of events) {
      results.push(event);
    }

    expect(results[0][0].content).toBe('test content');
    expect(results[0][1].langgraph_node).toBe('agent');
  });
});
