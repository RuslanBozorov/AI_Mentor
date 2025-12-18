
import React, { useState } from 'react';
import { UserProfile, LearningGoal } from '../types';
import { Camera, User, Hash, Mail, Target } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updated: UserProfile, resetLesson?: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age || 0);
  const [email, setEmail] = useState(user.email);
  const [goal, setGoal] = useState(user.goal);

  const goals = Object.values(LearningGoal);

  const handleUpdate = () => {
    let reset = false;
    if (goal !== user.goal) {
      const confirmChange = window.confirm(
        "Diqqat! Fokusni o'zgartirsangiz joriy darsingiz yangi yo'nalishga moslashadi. Rozimisiz?"
      );
      if (!confirmChange) {
        setGoal(user.goal);
        return;
      }
      reset = true;
    }
    onUpdate({ ...user, name, age, email, goal }, reset);
    alert("Profil yangilandi!");
  };

  const changeAvatar = () => {
    const newSeed = Math.random().toString(36).substr(2, 5);
    onUpdate({ ...user, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}` });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="relative inline-block mb-6">
          <img src={user.avatar} className="w-32 h-32 rounded-full border-4 border-indigo-600 p-1" alt="Avatar" />
          <button onClick={changeAvatar} className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg"><Camera size={18} /></button>
        </div>

        <div className="space-y-4 text-left max-w-sm mx-auto">
          <div className="relative">
            <User className="absolute left-4 top-3 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism" />
          </div>
          <div className="relative">
            <Hash className="absolute left-4 top-3 text-gray-400" size={18} />
            <input type="number" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={age} onChange={(e) => setAge(parseInt(e.target.value))} placeholder="Yosh" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-3 text-gray-400" size={18} />
            <input className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center"><Target size={12} className="mr-1" /> Fokus</label>
            <div className="grid grid-cols-2 gap-2">
              {goals.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className={`p-2 rounded-xl border text-xs transition ${goal === g ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-gray-600 border-gray-100'}`}>{g}</button>
              ))}
            </div>
          </div>
          
          <button onClick={handleUpdate} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-md active:scale-95 transition">Saqlash</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
