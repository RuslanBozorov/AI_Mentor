
import React from 'react';
import { TaskResponse, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';
import { Trophy, CheckCircle, AlertCircle, Sparkles, Bot, ArrowRight } from 'lucide-react';

interface FeedbackModalProps {
  response: TaskResponse;
  language: AppLanguage;
  onNext: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ response, language, onNext }) => {
  const t = UI_TEXT[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] animate-in fade-in zoom-in duration-300 border-4 border-indigo-50">
        
        <div className={`relative p-10 text-center overflow-hidden ${response.success ? 'bg-amber-50' : 'bg-red-50'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-4 left-4 animate-bounce"><Sparkles size={40} /></div>
             <div className="absolute bottom-4 right-4 animate-pulse"><Trophy size={40} /></div>
          </div>

          <div className="inline-flex items-center justify-center p-5 rounded-[30px] bg-white shadow-xl mb-6 relative">
             <Bot size={56} className={response.success ? "text-indigo-600" : "text-gray-400"} />
             {response.success && (
               <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-2 rounded-full animate-ping">
                 <Sparkles size={16} />
               </div>
             )}
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-2">
            {response.success ? `+${response.coins} ${t.coins}!` : "Oops!"}
          </h2>
          <p className="text-indigo-600 font-black uppercase tracking-widest text-xs px-6 py-2 bg-indigo-50 rounded-full inline-block">
            {response.motivation}
          </p>
        </div>

        <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <h4 className="flex items-center space-x-2 font-black text-gray-800 uppercase text-xs tracking-wider">
              <CheckCircle size={16} className="text-green-500" />
              <span>Feedback</span>
            </h4>
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
               <p className="text-gray-700 leading-relaxed font-bold">{response.feedback}</p>
            </div>
          </div>

          {!response.success && response.mistakes.length > 0 && (
            <div className="space-y-3">
              <h4 className="flex items-center space-x-2 font-black text-gray-800 uppercase text-xs tracking-wider">
                <AlertCircle size={16} className="text-red-500" />
                <span>{t.mistakes}</span>
              </h4>
              <div className="bg-red-50/50 p-5 rounded-3xl border border-red-100">
                <ul className="space-y-2">
                  {response.mistakes.map((m, i) => (
                    <li key={i} className="flex items-start space-x-2 text-red-700 font-bold">
                       <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                       <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="bg-indigo-50/50 p-5 rounded-3xl border-2 border-dashed border-indigo-200">
            <h4 className="font-black text-indigo-900 uppercase text-[10px] tracking-widest mb-1">{t.whyMistake}</h4>
            <p className="text-indigo-800 italic font-medium leading-relaxed">{response.reason}</p>
          </div>
        </div>

        <div className="p-8 bg-gray-50/80 border-t border-gray-100">
          <button
            onClick={onNext}
            className={`w-full flex items-center justify-center space-x-3 text-white font-black py-5 rounded-[24px] shadow-xl transition active:scale-95 ${
              response.success ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <span className="text-lg">{response.success ? t.next : "Qayta urinish"}</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
