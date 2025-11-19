# AI Chat UI Module

Standardized React components for building rich AI interfaces.

## Features
- **MessageBubble**: Supports User/AI styles and attachments.
- **AttachmentPicker**: Drag-and-drop file selection.
- **MemoryWidget**: Displays extracted user knowledge.
- **useChatWithAttachments**: Enhanced hook for file state.

## Usage

```tsx
import { useChatWithAttachments, MessageBubble, AttachmentPicker } from './modules/ai-chat-ui';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addFiles, attachments } = useChatWithAttachments();

  return (
    <div>
      {messages.map(m => (
        <MessageBubble 
          key={m.id} 
          role={m.role} 
          content={m.content} 
        />
      ))}
      
      <form onSubmit={handleSubmit}>
        <AttachmentPicker onFilesSelected={addFiles} />
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  )
}
```




