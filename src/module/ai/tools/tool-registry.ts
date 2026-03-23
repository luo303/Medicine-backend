import { ToolDefinition } from './tool.types';

export interface ToolHandler {
  name: string;
  definition: ToolDefinition;
  execute: (args: Record<string, any>) => Promise<any>;
}

export class ToolRegistry {
  private tools: Map<string, ToolHandler> = new Map();

  register(tool: ToolHandler): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolHandler | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => tool.definition);
  }

  async execute(name: string, args: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown function: ${name}`);
    }
    return tool.execute(args);
  }
}
