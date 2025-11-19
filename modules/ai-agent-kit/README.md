# AI Agent Kit Module

## Metadata
- **Module:** ai-agent-kit
- **Version:** 1.0
- **Created:** 2025-11-18

## Purpose
This module provides a standardized structure for building **Runtime AI Agents** (chatbots, assistants) within your application. It abstracts the provider (OpenAI, Anthropic) and enforces security best practices.

## Integration
Copy this folder to `src/lib/ai` or `modules/ai` in your project.

## Structure

```
/ai-agent-kit
  /prompts       # System prompts and templates
  /tools         # Tool definitions (Zod schemas)
  /providers     # API adapters
  client.ts      # Main Agent Client
```

## Usage Example

### 1. Define a Prompt (`prompts/support.ts`)
```typescript
export const SUPPORT_AGENT_PROMPT = (userName: string) => `
You are a helpful support assistant for ${userName}.
Refuse to answer political questions.
`;
```

### 2. Define a Tool (`tools/lookup.ts`)
```typescript
import { z } from 'zod';

export const lookupOrderTool = {
  name: 'lookup_order',
  description: 'Find order details by ID',
  parameters: z.object({
    orderId: z.string()
  }),
  execute: async ({ orderId }) => {
    // Call DB
    return { status: 'shipped' };
  }
};
```

### 3. Run the Agent
```typescript
import { AgentClient } from './client';
import { SUPPORT_AGENT_PROMPT } from './prompts/support';
import { lookupOrderTool } from './tools/lookup';

const response = await AgentClient.chat({
  messages: history,
  system: SUPPORT_AGENT_PROMPT('Alice'),
  tools: [lookupOrderTool],
  model: 'gpt-4-turbo'
});
```

