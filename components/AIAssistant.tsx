
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  message: string;
  isThinking?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ message, isThinking }) => {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none">
      <div className="relative mr-2 mb-2 max-w-[200px] bg-white p-3 rounded-2xl rounded-br-none shadow-xl border border-indigo-100 animate-in slide-in-from-right-4 duration-500 pointer-events-auto">
        {isThinking ? (
          <div className="flex space-x-1 p-1">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
          </div>
        ) : (
          <p className="text-[11px] font-bold text-indigo-900 leading-tight">
            {message}
          </p>
        )}
        <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-r border-b border-indigo-100 rotate-45"></div>
      </div>
      
      <div className="bg-indigo-600 p-3 rounded-full shadow-2xl animate-bounce pointer-events-auto cursor-pointer border-4 border-white">
        <Bot size={32} className="text-white" />
        <div className="absolute -top-1 -left-1 bg-amber-400 p-1 rounded-full text-white shadow-sm">
          <Sparkles size={12} />
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
