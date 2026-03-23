import { ToolHandler } from './tool-registry';
import { Inventory } from '@/entity/Inventory';
import { Repository } from 'typeorm';

export function createInventoryTools(
  inventoryRepository: Repository<Inventory>,
): ToolHandler[] {
  return [
    {
      name: 'query_inventory',
      definition: {
        type: 'function' as const,
        function: {
          name: 'query_inventory',
          description: '查询药品库存信息',
          parameters: {
            type: 'object',
            properties: {
              drug_name: {
                type: 'string',
                description: '药品名称',
              },
              warehouse_id: {
                type: 'number',
                description: '可选的仓库 ID',
              },
            },
            required: ['drug_name'],
          },
        },
      },
      execute: async (args: Record<string, any>) => {
        const queryBuilder =
          inventoryRepository.createQueryBuilder('inventory');
        let hasWhere = false;

        if (args.drug_name) {
          const drugName = String(args.drug_name);
          const searchPattern = '%' + drugName + '%';
          queryBuilder
            .innerJoin('inventory.drug', 'drug')
            .where('drug.name LIKE :name', { name: searchPattern });
          hasWhere = true;
        }

        const warehouseIdRaw: unknown = args.warehouse_id;
        const warehouseId = Number(warehouseIdRaw);
        if (Number.isFinite(warehouseId) && warehouseId > 0) {
          queryBuilder.innerJoin('inventory.warehouse', 'warehouse');
          if (hasWhere) {
            queryBuilder.andWhere('warehouse.id = :id', {
              id: warehouseId,
            });
          } else {
            queryBuilder.where('warehouse.id = :id', { id: warehouseId });
            hasWhere = true;
          }
        }

        const inventories = await queryBuilder.getMany();
        return inventories.map((i: Inventory) => ({
          drug_name: i.drug?.name,
          warehouse_name: i.warehouse_code,
          stock_quantity: i.quantity,
        }));
      },
    },
  ];
}
