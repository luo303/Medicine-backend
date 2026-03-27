import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Inventory } from '@/entity/Inventory';
import { Repository } from 'typeorm';
import { WarehouseService } from '../../basic/warehouse/warehouse.service';

export function createInventoryTools(
  inventoryRepository: Repository<Inventory>,
  warehouseService: WarehouseService,
) {
  return [
    tool(
      async ({ drug_name, warehouse_id }) => {
        const queryBuilder =
          inventoryRepository.createQueryBuilder('inventory');
        queryBuilder.leftJoinAndSelect('inventory.drug', 'drug');

        if (drug_name) {
          queryBuilder.andWhere('drug.name LIKE :name', {
            name: `%${drug_name}%`,
          });
        }
        if (warehouse_id) {
          const warehouse = await warehouseService.findAll();
          const target = warehouse.find((w) => w.id === warehouse_id);
          if (target) {
            queryBuilder.andWhere('inventory.warehouse_code = :code', {
              code: target.code,
            });
          }
        }
        const inventories = await queryBuilder.getMany();
        return JSON.stringify(
          inventories.map((i: Inventory) => ({
            drug_name: i.drug?.name || i.drug_name,
            warehouse_name: i.warehouse_code,
            stock_quantity: i.quantity,
          })),
        );
      },
      {
        name: 'query_inventory',
        description: '查询药品库存信息',
        schema: z.object({
          drug_name: z.string().describe('药品名称'),
          warehouse_id: z.number().optional().describe('可选的仓库 ID'),
        }),
      },
    ),
  ];
}
