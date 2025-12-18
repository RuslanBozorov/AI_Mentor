
import React from 'react';
import { UserProfile, LeaderboardEntry } from '../types';
import { UI_TEXT } from '../constants';
import { Trophy, Coins } from 'lucide-react';

interface LeaderboardProps {
  user: UserProfile;
  dynamicUsers: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user, dynamicUsers }) => {
  const t = UI_TEXT[user.language];
  
  const entries = [...dynamicUsers].sort((a, b) => b.coins - a.coins);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="bg-indigo-600 p-6 flex items-center justify-between">
          <h3 className="text-white font-black text-xl flex items-center space-x-3">
            <Trophy size={28} />
            <span>Top Foydalanuvchilar</span>
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium">Hozircha hech kim yo'q</div>
          ) : (
            entries.map((entry, i) => (
              <div 
                key={entry.id} 
                className={`p-5 flex items-center space-x-4 transition ${entry.isSelf ? 'bg-indigo-50/80 ring-2 ring-indigo-200 ring-inset' : ''}`}
              >
                <span className={`w-8 text-center font-black text-lg ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                  {i + 1}
                </span>
                <img 
                  src={entry.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}`} 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  alt="Avatar"
                />
                <div className="flex-1">
                  <span className={`block font-bold text-lg ${entry.isSelf ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {entry.name} {entry.isSelf ? '(Siz)' : ''}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Talaba</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-600 font-black">
                  <Coins size={18} />
                  <span>{entry.coins}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
