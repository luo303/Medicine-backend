import { ToolHandler } from './tool-registry';
import { WarehouseService } from '../../basic/warehouse/warehouse.service';
import { Warehouse } from '@/entity/Warehouse';

export function createWarehouseTools(
  warehouseService: WarehouseService,
): ToolHandler[] {
  return [
    {
      name: 'query_warehouse_list',
      definition: {
        type: 'function' as const,
        function: {
          name: 'query_warehouse_list',
          description: '查询仓库列表，获取所有仓库信息',
          parameters: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: '可选的仓库名称关键词',
              },
            },
          },
        },
      },
      execute: async () => {
        const warehouses = await warehouseService.findAll();
        return warehouses.map((w: Warehouse) => ({
          id: w.id,
          code: w.code,
          name: w.name,
          address: w.address,
          manager: w.manager,
        }));
      },
    },
  ];
}
