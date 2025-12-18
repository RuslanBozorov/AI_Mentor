
import React from 'react';
import { LessonContent, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';
import { Volume2 } from 'lucide-react';
import { speakText } from '../services/geminiService';

interface LessonCardProps {
  lesson: LessonContent;
  language: AppLanguage;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, language }) => {
  const t = UI_TEXT[language];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
      <h2 className="text-2xl font-black text-indigo-900 mb-4">{lesson.title}</h2>
      <p className="text-gray-700 mb-6 leading-relaxed text-lg">
        {lesson.explanation}
      </p>
      
      <div className="space-y-4">
        {lesson.examples.map((ex, i) => (
          <div key={i} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 group transition hover:bg-indigo-50">
            <div className="flex items-start space-x-3">
              <button 
                onClick={() => speakText(ex.original)}
                className="mt-1 p-2 bg-white rounded-xl text-indigo-600 hover:scale-110 active:scale-95 transition shadow-sm"
              >
                <Volume2 size={20} />
              </button>
              <div>
                <span className="block text-indigo-900 font-bold text-lg">{ex.original}</span>
                <span className="block text-gray-500 italic text-sm mt-1">Tarjima: {ex.translation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonCard;
