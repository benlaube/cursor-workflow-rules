# AI Chat UI Module

## Metadata

- **Module:** ai-chat-ui
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Description:** Standardized React components and hooks for building rich AI chat interfaces with attachment support

## What It Does

This module provides reusable React components and hooks for building AI chat interfaces in your application. It includes:

- **Message Display** - Render user and AI messages with proper styling
- **Attachment Support** - Handle file uploads and display attachments
- **Memory Display** - Show extracted user knowledge and context
- **Enhanced Chat Hook** - Extended chat hook with attachment management

The module is designed to work seamlessly with the `ai-agent-kit` module for backend AI interactions and integrates with Supabase Storage for file uploads.

## Features

- ✅ **MessageBubble Component** - Supports User/AI styles and attachments
- ✅ **AttachmentPicker Component** - Drag-and-drop file selection
- ✅ **MemoryWidget Component** - Displays extracted user knowledge
- ✅ **useChatWithAttachments Hook** - Enhanced hook for file state management
- ✅ **Type Safety** - Full TypeScript support
- ✅ **React Integration** - Works with React 18+ and Next.js

## Installation

### Copy the Module

Copy this module to your project:

```bash
cp -r modules/ai-chat-ui /path/to/your/project/src/components/ai-chat-ui
# or
cp -r modules/ai-chat-ui /path/to/your/project/lib/ai-chat-ui
```

### Dependencies

Install required dependencies:

```bash
npm install react react-dom
# Optional: For markdown rendering
npm install react-markdown remark-gfm
# Optional: For file uploads to Supabase
npm install @supabase/supabase-js
```

**Note:** The module uses the Vercel AI SDK's `useChat` hook as a base. Install if needed:

```bash
npm install ai
```

## Quick Start

### 1. Basic Chat Interface

```tsx
import { useChatWithAttachments, MessageBubble, AttachmentPicker } from '@/components/ai-chat-ui';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addFiles, attachments } =
    useChatWithAttachments({
      api: '/api/chat',
    });

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} attachments={m.attachments} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <AttachmentPicker onFilesSelected={addFiles} />
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

### 2. With Memory Widget

```tsx
import { MemoryWidget } from '@/components/ai-chat-ui';

export default function ChatWithMemory() {
  const memory = {
    userName: 'Alice',
    preferences: ['dark mode', 'notifications'],
    recentTopics: ['orders', 'shipping'],
  };

  return (
    <div className="flex">
      <div className="flex-1">{/* Chat interface */}</div>
      <MemoryWidget memory={memory} />
    </div>
  );
}
```

## Usage

### MessageBubble Component

Display individual chat messages with proper styling:

```tsx
import { MessageBubble } from '@/components/ai-chat-ui';

<MessageBubble
  role="user" // 'user' | 'assistant' | 'system'
  content="Hello!" // Message text
  attachments={[
    // Optional attachments
    {
      id: '1',
      url: '/image.jpg',
      type: 'image',
      name: 'image.jpg',
    },
  ]}
  isThinking={false} // Show thinking indicator
/>;
```

### AttachmentPicker Component

File selection with drag-and-drop:

```tsx
import { AttachmentPicker } from '@/components/ai-chat-ui';

<AttachmentPicker
  onFilesSelected={(files) => {
    // Handle selected files
    console.log(files);
  }}
  accept="image/*,application/pdf" // Optional: file types
  maxFiles={5} // Optional: max files
  maxSize={5 * 1024 * 1024} // Optional: max size (5MB)
/>;
```

### MemoryWidget Component

Display extracted user knowledge:

```tsx
import { MemoryWidget } from '@/components/ai-chat-ui';

const memory = {
  userName: 'Alice',
  preferences: ['dark mode', 'email notifications'],
  recentTopics: ['orders', 'shipping', 'returns'],
  context: {
    lastOrder: '2025-01-15',
    favoriteCategory: 'Electronics',
  },
};

<MemoryWidget
  memory={memory}
  onUpdate={(updated) => {
    // Handle memory updates
  }}
/>;
```

### useChatWithAttachments Hook

Enhanced chat hook with attachment support:

```tsx
import { useChatWithAttachments } from '@/components/ai-chat-ui';

const {
  messages, // Chat messages
  input, // Current input value
  handleInputChange, // Input change handler
  handleSubmit, // Form submit handler
  isLoading, // Loading state
  error, // Error state
  attachments, // Current attachments
  addFiles, // Add files function
  removeAttachment, // Remove attachment function
} = useChatWithAttachments({
  api: '/api/chat', // API endpoint
  initialMessages: [], // Optional: initial messages
  onError: (error) => {
    // Optional: error handler
    console.error(error);
  },
});
```

## Component API

### MessageBubble

**Props:**

```typescript
interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  isThinking?: boolean;
}
```

**Attachment Interface:**

```typescript
interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  name: string;
}
```

### AttachmentPicker

**Props:**

```typescript
interface AttachmentPickerProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string; // File type filter (e.g., "image/*")
  maxFiles?: number; // Maximum number of files
  maxSize?: number; // Maximum file size in bytes
  disabled?: boolean; // Disable file selection
}
```

### MemoryWidget

**Props:**

```typescript
interface MemoryWidgetProps {
  memory: {
    userName?: string;
    preferences?: string[];
    recentTopics?: string[];
    context?: Record<string, any>;
  };
  onUpdate?: (memory: Memory) => void;
  editable?: boolean; // Allow editing memory
}
```

## Hooks API

### useChatWithAttachments

**Options:**

```typescript
interface UseChatWithAttachmentsOptions {
  api: string; // API endpoint for chat
  initialMessages?: Message[]; // Initial conversation
  onError?: (error: Error) => void; // Error handler
  // ... other useChat options from Vercel AI SDK
}
```

**Returns:**

```typescript
interface UseChatWithAttachmentsReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  error: Error | null;
  attachments: Attachment[];
  addFiles: (files: File[]) => void;
  removeAttachment: (id: string) => void;
  // ... other useChat returns from Vercel AI SDK
}
```

## Styling

The components use Tailwind CSS classes. Customize by:

1. **Override Classes** - Pass custom className props (if supported)
2. **CSS Modules** - Create your own CSS modules
3. **Tailwind Config** - Extend Tailwind theme
4. **Styled Components** - Wrap components with styled-components

**Example with custom styling:**

```tsx
<div className="[&_.message-bubble]:bg-custom-color">
  <MessageBubble role="user" content="Hello" />
</div>
```

## Integration

### With AI Agent Kit

Use with `ai-agent-kit` for backend AI interactions:

```tsx
// Frontend
import { useChatWithAttachments } from '@/components/ai-chat-ui';

const { messages, input, handleSubmit } = useChatWithAttachments({
  api: '/api/chat',
});

// Backend API route (app/api/chat/route.ts)
import { createApiHandler } from '@/lib/backend-api';
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

### With Supabase Storage

Upload attachments to Supabase Storage:

```tsx
import { useChatWithAttachments } from '@/components/ai-chat-ui';
import { uploadFile } from '@/lib/supabase-core-typescript';

const { addFiles, attachments } = useChatWithAttachments({
  api: '/api/chat',
  onFilesSelected: async (files) => {
    // Upload to Supabase Storage
    for (const file of files) {
      const result = await uploadFile(supabase, {
        bucket: 'chat-attachments',
        path: `user-${userId}/${file.name}`,
        file: file,
      });
      // Add uploaded URL to attachments
    }
  },
});
```

### With Logger Module

Log chat interactions:

```tsx
import { setupLogger } from '@/modules/logger-module';
import { useChatWithAttachments } from '@/components/ai-chat-ui';

const logger = setupLogger('chat-ui', { env: 'production' });

const { messages, handleSubmit } = useChatWithAttachments({
  api: '/api/chat',
  onResponse: (response) => {
    logger.info('Chat response received', { messageCount: messages.length });
  },
});
```

## Related Documentation

- `modules/ai-agent-kit/` - Backend AI agent implementation
- `modules/supabase-core-typescript/` - Supabase utilities for file uploads
- `modules/logger-module/` - Logging for chat interactions
- `standards/ui/chat-interface.md` - Chat interface standards

## Possible Enhancements

### Short-term Improvements

- **Markdown Rendering** - Add ReactMarkdown support for rich text messages
- **Code Syntax Highlighting** - Highlight code blocks in messages
- **Image Preview** - Full-size image preview on click
- **File Preview** - Preview PDFs and other files
- **Message Reactions** - Add emoji reactions to messages
- **Copy to Clipboard** - Copy message content button
- **Edit Messages** - Allow editing sent messages
- **Delete Messages** - Delete individual messages
- **Message Timestamps** - Show message timestamps
- **Typing Indicators** - Show when AI is typing

### Medium-term Enhancements

- **Streaming Support** - Real-time streaming of AI responses
- **Voice Input** - Voice-to-text input support
- **Voice Output** - Text-to-speech for AI responses
- **Suggested Replies** - AI-suggested quick replies
- **Tool Call Display** - Show when AI is calling tools
- **Citation Display** - Show sources/citations for AI responses
- **Conversation History** - Load and save conversation history
- **Search Messages** - Search within conversation
- **Export Conversation** - Export chat as PDF/text
- **Multi-language Support** - Internationalization

### Long-term Enhancements

- **Video Chat** - Video call integration
- **Screen Sharing** - Share screen during chat
- **Collaborative Chat** - Multiple users in one chat
- **Custom Themes** - User-customizable themes
- **Plugin System** - Extensible plugin architecture
- **Mobile App** - React Native version
- **Offline Support** - Work offline with sync
- **Accessibility** - Full WCAG compliance
- **Performance** - Virtual scrolling for long conversations
- **Analytics** - Usage analytics and metrics
