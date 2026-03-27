import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OllamaEmbeddings } from '@langchain/ollama';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
export const MakeRetriver = async () => {
  // 2. 准备文档和检索器
  console.log('正在加载文档...');
  const loader = new CheerioWebBaseLoader(
    'https://js.langchain.com/docs/expression_language/',
  );
  const docs = await loader.load();

  console.log('正在分割文档...');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  console.log('正在创建向量存储...');
  const embeddings = new OllamaEmbeddings({
    model: 'nomic-embed-text-v2-moe:latest',
    baseUrl: 'http://localhost:11434',
  });

  const vectorstore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings,
  );

  const retriever = vectorstore.asRetriever({ k: 3 });
  return retriever;
};
