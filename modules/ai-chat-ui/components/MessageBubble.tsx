import React from 'react';

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  name: string;
}

export interface MessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  isThinking?: boolean;
}

export const MessageBubble: React.FC<MessageProps> = ({ role, content, attachments, isThinking }) => {
  const isUser = role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] p-4 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {/* Attachments Grid */}
        {attachments && attachments.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {attachments.map((att) => (
              <div key={att.id} className="relative group">
                {att.type === 'image' ? (
                  <img src={att.url} alt={att.name} className="w-20 h-20 object-cover rounded bg-gray-200" />
                ) : (
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-200 rounded text-xs">
                    {att.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className="prose prose-sm max-w-none">
          {isThinking ? (
            <div className="animate-pulse flex space-x-1 items-center h-6">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          ) : (
            // Note: In a real app, use ReactMarkdown here
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

