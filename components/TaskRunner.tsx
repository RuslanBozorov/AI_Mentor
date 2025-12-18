
import React, { useState } from 'react';
import { LessonContent, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';
import { Send, Volume2, BookCheck, CheckCircle2 } from 'lucide-react';
import { speakText } from '../services/geminiService';

interface TaskRunnerProps {
  lesson: LessonContent;
  language: AppLanguage;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

const TaskRunner: React.FC<TaskRunnerProps> = ({ lesson, language, onSubmit, isLoading }) => {
  const [answer, setAnswer] = useState('');
  const t = UI_TEXT[language];

  const handleSubmit = () => {
    if (!answer.trim()) return;
    onSubmit(answer);
  };

  const { question, options, audioPrompt } = lesson.task;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-100 mt-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookCheck className="text-indigo-600" size={24} />
          <h3 className="font-black text-gray-800 text-xl">Test Mashqi</h3>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
          Selection Based
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-gray-100 shadow-inner">
        <p className="text-gray-900 text-xl font-bold leading-relaxed">{question}</p>
      </div>

      {audioPrompt && (
        <div className="mb-8">
          <button 
            onClick={() => speakText(audioPrompt)}
            className="flex items-center space-x-3 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 px-8 py-5 rounded-2xl font-black transition hover:bg-indigo-100 hover:border-indigo-300 active:scale-95 w-full justify-center shadow-lg"
          >
            <Volume2 size={28} />
            <span className="text-lg">Audio Mashqni Tinglash</span>
          </button>
        </div>
      )}

      {/* Force options to always exist and be shown */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {(options || []).map((opt, i) => (
          <button
            key={i}
            onClick={() => setAnswer(opt)}
            className={`group p-5 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden ${
              answer === opt 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl translate-x-2' 
                : 'text-gray-800 bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                answer === opt ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-lg font-bold flex-1">{opt}</span>
              {answer === opt && <CheckCircle2 size={24} className="text-white" />}
            </div>
          </button>
        ))}
        {(!options || options.length === 0) && (
           <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold">
              Variantlar yuklanmadi. Iltimos, qayta urinib ko'ring.
           </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!answer || isLoading}
        className="w-full flex items-center justify-center space-x-3 bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-2xl shadow-indigo-200 active:scale-95 active:translate-y-1"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent" />
        ) : (
          <>
            <Send size={24} />
            <span className="text-xl">{t.submit}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TaskRunner;
