import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { createAgent } from 'langchain';
import { DrugService } from '../basic/drug/drug.service';
import { WarehouseService } from '../basic/warehouse/warehouse.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '@/entity/Inventory';
import { Repository } from 'typeorm';
import { createDrugTools } from './tools/drug.tools';
import { createWarehouseTools } from './tools/warehouse.tools';
import { createInventoryTools } from './tools/inventory.tools';
import { searchDocsTool } from './tools/searchDocTool';

@Injectable()
export class AiService implements OnModuleInit {
  public agent: any;

  constructor(
    private readonly drugService: DrugService,
    private readonly warehouseService: WarehouseService,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  onModuleInit() {
    this.init();
  }

  init() {
    // ✅ 严格按照用户提供的初始化方式，不添加多余配置
    const model = new ChatOllama({
      model: 'gpt-oss:120b-cloud',
      temperature: 0,
    });

    const tools = [
      ...createDrugTools(this.drugService),
      ...createWarehouseTools(this.warehouseService),
      ...createInventoryTools(this.inventoryRepository, this.warehouseService),
      searchDocsTool,
    ];

    // ✅ 严格按照用户提供的 Agent 创建方式
    this.agent = createAgent({
      model: model,
      tools: tools,
      systemPrompt: `你是专业的助手，回答必须基于搜索结果。`,
    });
  }
}
