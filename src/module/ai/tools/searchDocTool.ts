import { MakeRetriver } from './loader';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const searchDocsTool = tool(
  async ({ query }) => {
    console.log(`\n[工具调用] 正在搜索: "${query}"`);
    const retriever = await MakeRetriver();
    const results = await retriever.invoke(query);
    if (results.length === 0) return '未找到相关文档。';
    return results
      .map((doc, i) => `[文档${i + 1}]\n${doc.pageContent}`)
      .join('\n\n');
  },
  {
    name: 'search_langchain_docs',
    description: '搜索 LangChain 文档来回答关于 LCEL、表达式语言的问题',
    schema: z.object({ query: z.string() }),
  },
);
