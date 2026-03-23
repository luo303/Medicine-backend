import { ToolHandler } from './tool-registry';
import { DrugService } from '../../basic/drug/drug.service';
import { Drug } from '@/entity/Drug';

export function createDrugTools(drugService: DrugService): ToolHandler[] {
  return [
    {
      name: 'query_drug_list',
      definition: {
        type: 'function' as const,
        function: {
          name: 'query_drug_list',
          description: '查询药品目录列表，获取所有药品信息',
          parameters: {
            type: 'object',
            properties: {
              keyword: {
                type: 'string',
                description: '可选的药品名称关键词',
              },
            },
          },
        },
      },
      execute: async () => {
        const drugs = await drugService.findAll();
        return drugs.map((d: Drug) => ({
          approval_no: d.approval_no,
          name: d.name,
          specification: d.specification,
          is_prescription: d.is_prescription,
        }));
      },
    },
  ];
}
