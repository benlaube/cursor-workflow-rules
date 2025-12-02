# Runtime_AI_Agent_Architecture_v1.0

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.0
- **Description:** Standard defining how to architect Runtime Agents (AI features embedded in the application) as opposed to Developer Agents, ensuring agents are modular, secure, and provider-agnostic.

## 1. Purpose
This standard defines how to architect **Runtime Agents** (AI features embedded in the application) as opposed to **Developer Agents** (coding assistants). It ensures agents are modular, secure, and provider-agnostic.

## 2. Core Principles
1.  **Separation of Concerns:**
    *   **System Prompts are Code:** Version control them.
    *   **User Context is Data:** Store it in the database (Supabase).
    *   **API Keys are Secrets:** Never hardcode; use `SettingsManager`.
2.  **Provider Agnosticism:**
    *   Do not tightly couple logic to `openai-node` or `anthropic-sdk`.
    *   Use an Adapter pattern or a standardized SDK (e.g., Vercel AI SDK, LangChain).
3.  **Tool Isolation:**
    *   Tools (functions agents can call) must have Zod schemas.
    *   Tools must never have unchecked access to `service_role`.

## 3. Directory Structure (`src/ai/` or `src/agents/`)

```
src/ai/
  ├── prompts/           # System prompts (ts/js files exporting strings)
  │   ├── customer-support.ts
  │   └── data-analyst.ts
  ├── tools/             # Tool definitions
  │   ├── crm-tools.ts   # "lookUpCustomer", "updateStatus"
  │   └── web-tools.ts   # "searchWeb", "scrapeUrl"
  ├── config/            # Model configuration (temperature, model IDs)
  │   └── index.ts
  └── providers/         # Adapters (if not using a unified SDK)
      ├── openai.ts
      └── anthropic.ts
```

## 4. Storage Strategy

### 4.1 Prompts
*   **Static (Recommended):** Store in code (`src/ai/prompts/`). Benefits: Git history, PR reviews, TypeScript interpolation.
*   **Dynamic (Advanced):** Store in Supabase `prompts` table. Benefits: Admin UI updates without deploy. *Only use if non-engineers need to edit prompts.*

### 4.2 Tools & Instructions
*   **Tools:** Define as JSON Schemas (or Zod).
*   **Instructions:** Dynamically assembled at runtime: `Base System Prompt + User Profile Context + Current Task`.

### 4.3 Memory (History)
*   **Short-term:** Store in Client State (React State / Context).
*   **Long-term:** Store in Supabase `chat_messages` table.
    *   `id`, `session_id`, `role` (user/assistant/system), `content`, `created_at`.

## 5. Security & Safety
*   **Rate Limiting:** Mandatory for all AI endpoints.
*   **Context Window:** Truncate history to avoid token overflow.
*   **Input Sanitation:** Detect prompt injection before sending to LLM.

## 6. Adapters & SDKs (Plug-and-Play)

Instead of writing raw HTTP calls to OpenAI, use these recommended libraries which act as **Universal Adapters**.

### 6.1 Vercel AI SDK (Recommended)
*   **Why:** Standardization. It unifies OpenAI, Anthropic, and Mistral under a single `generateText` or `streamText` API.
*   **Integration:**
    ```typescript
    import { generateText } from 'ai';
    import { openai } from '@ai-sdk/openai';
    
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Hello world',
    });
    ```

### 6.2 LangChain.js
*   **Why:** Complex chains. Use this if you need "Retriever Augmented Generation" (RAG) or complex agent loops that Vercel SDK doesn't cover.
*   **Warning:** Can be heavy. Prefer Vercel AI SDK for simple chatbot apps.

### 6.3 LiteLLM
*   **Why:** Proxy server. If you need to route traffic to different providers without changing *any* code (just env vars), LiteLLM is a great Drop-in replacement for the OpenAI SDK.

## 7. Module Recommendation
Use the `modules/ai-agent-kit` to bootstrap this structure.

