
import React from 'react';
import { UserProfile, RoadmapNode, LearningGoal } from '../types';
import { Lock, CheckCircle2 } from 'lucide-react';

interface RoadmapProps {
  user: UserProfile;
  onNodeClick: (node: RoadmapNode) => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ user, onNodeClick }) => {
  const getNodesForGoal = (goal: LearningGoal): RoadmapNode[] => {
    switch(goal) {
      case LearningGoal.SPEAKING:
        return [
          { id: 's1', title: 'Talaffuz asoslari', icon: '🗣️', type: 'lesson' },
          { id: 's2', title: 'Kundalik salomlashish', icon: '🤝', type: 'lesson' },
          { id: 's3', title: 'Savol berish', icon: '❓', type: 'lesson' },
          { id: 's4', title: 'Xazina: Speaking Bonus', icon: '🎁', type: 'treasure' },
          { id: 's5', title: 'Intonatsiya', icon: '🎵', type: 'lesson' },
          { id: 's_exam', title: 'Speaking Imtihoni', icon: '🎓', type: 'exam' },
        ];
      case LearningGoal.WRITING:
        return [
          { id: 'w1', title: 'Imlo qoidalari', icon: '✍️', type: 'lesson' },
          { id: 'w2', title: 'Gap qurilishi', icon: '🏗️', type: 'lesson' },
          { id: 'w3', title: 'Punctuation', icon: '📍', type: 'lesson' },
          { id: 'w4', title: 'Xazina: Writing Tips', icon: '🎁', type: 'treasure' },
          { id: 'w5', title: 'Insho asoslari', icon: '📝', type: 'lesson' },
          { id: 'w_exam', title: 'Writing Imtihoni', icon: '🎓', type: 'exam' },
        ];
      case LearningGoal.VOCABULARY:
        return [
          { id: 'v1', title: "Eng muhim 100 so'z", icon: '📚', type: 'lesson' },
          { id: 'v2', title: 'Sifatlar', icon: '✨', type: 'lesson' },
          { id: 'v3', title: "Fe'llar dunyosi", icon: '🏃', type: 'lesson' },
          { id: 'v4', title: "Xazina: Lug'at to'plami", icon: '🎁', type: 'treasure' },
          { id: 'v5', title: 'Idiomalar', icon: '🧠', type: 'lesson' },
          { id: 'v_exam', title: 'Vocabulary Imtihoni', icon: '🎓', type: 'exam' },
        ];
      default:
        return [
          { id: 'g1', title: "Tobe fe'li", icon: '🧩', type: 'lesson' },
          { id: 'g2', title: 'Hozirgi zamon', icon: '⏰', type: 'lesson' },
          { id: 'g3', title: "O'tgan zamon", icon: '🔙', type: 'lesson' },
          { id: 'g4', title: 'Xazina: Grammar Cheat Sheet', icon: '🎁', type: 'treasure' },
          { id: 'g5', title: 'Kelasi zamon', icon: '🚀', type: 'lesson' },
          { id: 'g_exam', title: 'Grammar Imtihoni', icon: '🎓', type: 'exam' },
        ];
    }
  };

  const nodes = getNodesForGoal(user.goal);

  return (
    <div className="flex flex-col items-center py-10 space-y-12 max-w-md mx-auto relative">
      <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-slate-200 -translate-x-1/2 rounded-full z-0 opacity-50" />

      {nodes.map((node, index) => {
        // Evaluate logic outside JSX tags
        const isCompleted = user.lessonsCompleted > index;
        const isActive = user.lessonsCompleted === index;
        const isLocked = index > user.lessonsCompleted;
        const xOffsetClass = (index % 2 === 0) ? '-translate-x-12' : 'translate-x-12';

        return (
          <div key={node.id} className={`relative flex flex-col items-center z-10 ${xOffsetClass} transition-all duration-500`}>
            <button
              disabled={isLocked}
              onClick={() => onNodeClick(node)}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all border-b-8
                ${isActive ? 'bg-indigo-600 border-indigo-800 scale-110 ring-8 ring-indigo-100 animate-pulse' : ''}
                ${isCompleted ? 'bg-green-500 border-green-700' : ''}
                ${isLocked ? 'bg-slate-200 border-slate-300 grayscale opacity-80 cursor-not-allowed' : 'hover:scale-110 active:scale-90 active:translate-y-1'}
              `}
            >
              {isLocked ? <Lock size={28} className="text-slate-400" /> : <span>{node.icon}</span>}
              
              {isCompleted && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full text-green-500 p-1 shadow-lg border-2 border-green-500">
                  <CheckCircle2 size={24} />
                </div>
              )}
            </button>

            <div className={`mt-4 px-4 py-2 rounded-2xl text-center shadow-md border-2 transition-all
              ${isActive ? 'bg-white border-indigo-400 scale-105' : 'bg-white/50 border-transparent'}
            `}>
              <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {node.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Roadmap;
