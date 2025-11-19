# AI Chat Interface & Memory Standard v1.0

## Metadata
- **Created:** 2025-11-19
- **Version:** 1.0
- **Dependencies:** `modules/ai-chat-ui`, `Vercel AI SDK`

## 1. Overview
This standard defines the UX/UI patterns for "Smart" Chat Interfaces. It goes beyond simple text bubbles to include File Uploads, Citations, and a Persistent Memory feedback loop.

### Core Principles
1.  **Transparent Logic**: Users should know *why* the AI said something (Citations, Thinking steps).
2.  **Stateful**: The AI remembers user preferences (Memory).
3.  **Multimodal**: Users can upload text, images, and docs.

## 2. UI Layout Standards

### 2.1 Message Bubbles
- **User**: Right-aligned. Distinct background color (e.g., Brand Blue).
- **AI**: Left-aligned. Neutral background (Gray/White).
- **Meta**: Timestamp on hover.

### 2.2 The "Thinking" State
Do not make the user wait at a blank screen.
- **Immediate**: Show "Thinking..." indicator instantly after submit.
- **Detailed**: If the process takes >2s, show a collapsible "Steps" view:
    - ✅ Retrieved memories
    - ✅ Searched documentation
    - 🔄 Generating response...

### 2.3 Citations & Sources
- **Footnotes**: Render sources as `[1]`, `[2]` in the text.
- **Preview**: Hovering `[1]` shows a tooltip with the source title/snippet.
- **Source List**: Bottom of the message lists all used sources.

## 3. File Upload Interaction
### 3.1 UX Flow
1.  **Attach**: User clicks "Paperclip" or drags file into input.
2.  **Preview**: Show thumbnail (image) or icon (PDF) in the input box.
3.  **Progress**: Show upload progress bar.
4.  **Context**: Once uploaded, the file is visually "chipified" inside the chat input context.

## 4. Memory System (The "Brain")
The UI must visualize the AI's growing knowledge of the user.

### 4.1 The "Memory Widget"
A component (usually in the sidebar) that lists extracted facts.
- "User prefers TypeScript over Python"
- "User is building a CRM app"

### 4.2 Feedback Loop
- **Notification**: When the AI saves a new memory, show a small toast: "✨ I'll remember that."
- **Correction**: User can delete or edit memories if the AI misunderstood.

## 5. React Component Architecture
(See `modules/ai-chat-ui` for implementation)

```tsx
<ChatProvider>
  <ChatLayout>
    <MemorySidebar />
    <ChatWindow>
      <MessageList>
        <MessageBubble variant="user" />
        <MessageBubble variant="ai">
           <Citations />
        </MessageBubble>
      </MessageList>
      <InputArea>
        <AttachmentPicker />
        <TextArea />
      </InputArea>
    </ChatWindow>
  </ChatLayout>
</ChatProvider>
```




