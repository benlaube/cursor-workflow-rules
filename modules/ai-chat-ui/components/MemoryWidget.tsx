import React from 'react';

export interface Memory {
  id: string;
  content: string;
  createdAt: string;
}

interface MemoryWidgetProps {
  memories: Memory[];
  onDelete?: (id: string) => void;
}

export const MemoryWidget: React.FC<MemoryWidgetProps> = ({ memories, onDelete }) => {
  if (memories.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm">
      <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
        <span>🧠 Knowledge Base</span>
        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
          {memories.length} facts
        </span>
      </h3>
      <ul className="space-y-2">
        {memories.map((m) => (
          <li key={m.id} className="flex justify-between items-start group">
            <span className="text-yellow-900">{m.content}</span>
            {onDelete && (
              <button 
                onClick={() => onDelete(m.id)}
                className="text-yellow-400 hover:text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

