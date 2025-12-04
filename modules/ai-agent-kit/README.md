# AI Agent Kit Module

## Metadata

- **Module:** ai-agent-kit
- **Version:** 1.0.0
- **Created:** 2025-11-18
- **Last Updated:** 2025-01-27
- **Description:** Standardized structure and utilities for building Runtime AI Agents (chatbots, assistants) within your application

## What It Does

This module provides a standardized structure and foundation for building **Runtime AI Agents** (chatbots, assistants) within your application. It abstracts AI providers (OpenAI, Anthropic, etc.) and enforces security best practices.

**Current Status:** This module is a **skeleton/template** that provides the structure and patterns. The implementation directories (`prompts/`, `tools/`, `providers/`) are currently empty and need to be populated based on your specific use case.

The module is designed to:

- **Abstract AI Providers** - Switch between OpenAI, Anthropic, or other providers easily
- **Standardize Prompts** - Centralized prompt templates and management
- **Tool System** - Define and execute tools (functions) that AI can call
- **Security** - Enforce best practices for AI interactions (PII scrubbing, rate limiting, etc.)

## Features

- ✅ **Provider Abstraction** - Switch between AI providers without changing code
- ✅ **Prompt Templates** - Centralized prompt management with variable substitution
- ✅ **Tool System** - Define tools (functions) that AI can call with Zod validation
- ✅ **Security Best Practices** - PII scrubbing, rate limiting, input validation
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Extensible Architecture** - Easy to add new providers, tools, and prompts

## Current Status

⚠️ **This module is a template/skeleton.** The following directories exist but are currently empty:

- `prompts/` - System prompts and templates (empty)
- `tools/` - Tool definitions with Zod schemas (empty)
- `providers/` - API adapters for different AI providers (empty)

You need to implement these based on your specific requirements. See the "Implementation Roadmap" section below.

## Installation

### Copy the Module

Copy this folder to your project:

```bash
cp -r modules/ai-agent-kit /path/to/your/project/src/lib/ai
# or
cp -r modules/ai-agent-kit /path/to/your/project/modules/ai
```

### Dependencies

Install required dependencies:

```bash
npm install zod openai anthropic
# or install providers as needed
```

## Quick Start

### 1. Set Up Provider

First, implement a provider adapter (see "Implementation Roadmap" below):

```typescript
// providers/openai.ts
import OpenAI from 'openai';

export class OpenAIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(messages: any[], options: any) {
    // Implementation
  }
}
```

### 2. Define a Prompt

Create prompt templates:

```typescript
// prompts/support.ts
export const SUPPORT_AGENT_PROMPT = (userName: string) => `
You are a helpful support assistant for ${userName}.
Refuse to answer political questions.
Always be polite and professional.
`;
```

### 3. Define a Tool

Create tool definitions with Zod validation:

```typescript
// tools/lookup.ts
import { z } from 'zod';

export const lookupOrderTool = {
  name: 'lookup_order',
  description: 'Find order details by ID',
  parameters: z.object({
    orderId: z.string().uuid(),
  }),
  execute: async ({ orderId }: { orderId: string }) => {
    // Call your database/API
    const order = await db.orders.findUnique({ where: { id: orderId } });
    return { status: order?.status || 'not_found' };
  },
};
```

### 4. Run the Agent

Use the agent client:

```typescript
// client.ts (to be implemented)
import { AgentClient } from './client';
import { SUPPORT_AGENT_PROMPT } from './prompts/support';
import { lookupOrderTool } from './tools/lookup';

const response = await AgentClient.chat({
  messages: conversationHistory,
  system: SUPPORT_AGENT_PROMPT('Alice'),
  tools: [lookupOrderTool],
  model: 'gpt-4-turbo',
});
```

## Usage

### Basic Agent Setup

```typescript
import { AgentClient } from '@/lib/ai/client';
import { SUPPORT_AGENT_PROMPT } from '@/lib/ai/prompts/support';

const agent = new AgentClient({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await agent.chat({
  messages: [{ role: 'user', content: 'What is my order status?' }],
  system: SUPPORT_AGENT_PROMPT('Alice'),
});
```

### With Tools

```typescript
import { lookupOrderTool, getUserInfoTool } from '@/lib/ai/tools';

const response = await agent.chat({
  messages: conversationHistory,
  system: SUPPORT_AGENT_PROMPT('Alice'),
  tools: [lookupOrderTool, getUserInfoTool],
  model: 'gpt-4-turbo',
});

// Agent can now call tools automatically
if (response.toolCalls) {
  // Handle tool calls
}
```

### Streaming Responses

```typescript
const stream = await agent.stream({
  messages: conversationHistory,
  system: SUPPORT_AGENT_PROMPT('Alice'),
});

for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}
```

## Architecture

The module follows this structure:

```
/ai-agent-kit
  /prompts       # System prompts and templates
    support.ts   # Support agent prompts
    general.ts   # General purpose prompts
  /tools         # Tool definitions (Zod schemas)
    lookup.ts    # Order lookup tool
    search.ts    # Search tool
  /providers     # API adapters
    openai.ts    # OpenAI provider
    anthropic.ts # Anthropic provider
  client.ts      # Main Agent Client
  types.ts       # Type definitions
```

### Provider Abstraction

Providers implement a common interface:

```typescript
interface AIProvider {
  chat(messages: Message[], options: ChatOptions): Promise<ChatResponse>;
  stream(messages: Message[], options: ChatOptions): AsyncIterable<Chunk>;
}
```

### Tool System

Tools are defined with:

- **Name** - Unique identifier
- **Description** - What the tool does (used by AI)
- **Parameters** - Zod schema for validation
- **Execute** - Function to execute the tool

## Integration

### With AI Chat UI Module

Use with `ai-chat-ui` for the frontend:

```typescript
// Frontend
import { useChatWithAttachments } from '@/modules/ai-chat-ui';
import { AgentClient } from '@/lib/ai/client';

const { messages, input, handleSubmit } = useChatWithAttachments({
  api: '/api/chat',
  // ...
});

// Backend API route
import { AgentClient } from '@/lib/ai/client';

export const POST = createApiHandler({
  handler: async ({ input }) => {
    const agent = new AgentClient({ provider: 'openai' });
    return await agent.chat({
      messages: input.messages,
      system: SUPPORT_AGENT_PROMPT(input.userName),
    });
  },
});
```

### With Logger Module

Log all AI interactions:

```typescript
import { setupLogger } from '@/modules/logger-module';
import { AgentClient } from '@/lib/ai/client';

const logger = setupLogger('ai-agent', { env: 'production' });

const agent = new AgentClient({
  provider: 'openai',
  logger, // Agent logs all interactions
});
```

### With Error Handler Module

Handle errors gracefully:

```typescript
import { safe, withRetry } from '@/modules/error-handler';
import { AgentClient } from '@/lib/ai/client';

const agent = new AgentClient({ provider: 'openai' });

// Retry on transient failures
const result = await withRetry(() => agent.chat({ messages, system }), { retries: 3, delay: 1000 });
```

## Related Documentation

- `modules/ai-chat-ui/` - React components for AI chat interfaces
- `modules/logger-module/` - Logging for AI interactions
- `modules/error-handler/` - Error handling for AI operations
- `standards/architecture/runtime-ai-agents.md` - AI agent architecture guide

## Possible Enhancements

### Implementation Roadmap

#### Phase 1: Core Implementation (Priority)

1. **Provider Abstraction**
   - Implement `OpenAIProvider` class
   - Implement `AnthropicProvider` class
   - Create provider factory function
   - Add provider configuration interface

2. **Prompt Template System**
   - Create prompt template engine with variable substitution
   - Implement few-shot example support
   - Add prompt versioning
   - Create example prompts (support, general, etc.)

3. **Tool System**
   - Implement tool registry
   - Add tool validation with Zod
   - Create tool execution engine
   - Add rate limiting per tool
   - Implement tool result caching

4. **Agent Client**
   - Implement main `AgentClient` class
   - Add streaming support
   - Implement tool calling
   - Add context management
   - Create conversation memory

#### Phase 2: Security & Performance

5. **Security Features**
   - PII detection and scrubbing
   - Input sanitization
   - Rate limiting per user
   - Cost tracking and limits
   - Token usage monitoring

6. **Performance**
   - Response caching
   - Streaming optimizations
   - Batch processing
   - Connection pooling

#### Phase 3: Advanced Features

7. **Memory Management**
   - Conversation summarization
   - Long-term memory storage
   - Context window optimization
   - Memory retrieval system

8. **Multi-Agent Support**
   - Agent orchestration
   - Agent-to-agent communication
   - Specialized agent types
   - Agent routing

9. **Analytics & Monitoring**
   - Usage analytics
   - Cost tracking
   - Performance metrics
   - Error tracking
   - User satisfaction metrics

### Long-term Enhancements

- **Voice Support** - Voice input/output integration
- **Multi-modal** - Image and video processing
- **Fine-tuning** - Custom model fine-tuning support
- **Embeddings** - Vector search and RAG (Retrieval Augmented Generation)
- **Function Calling** - Advanced function calling patterns
- **Agent Marketplace** - Share and discover agent templates
- **Testing Framework** - Unit and integration tests for agents
- **CI/CD Integration** - Automated testing and deployment
