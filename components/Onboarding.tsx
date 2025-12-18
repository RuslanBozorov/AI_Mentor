
import React, { useState } from 'react';
import { UserProfile, EnglishLevel, LearningGoal, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';

interface OnboardingProps {
  email: string;
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ email, onComplete }) => {
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState<AppLanguage>('uz');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    id: Math.random().toString(36).substr(2, 9),
    email: email,
    coins: 0,
    onboarded: true,
    language: 'uz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
    lessonsCompleted: 0,
    currentTaskIndex: 0
  });

  const levels = Object.values(EnglishLevel);
  const goals = Object.values(LearningGoal);
  const t = UI_TEXT[lang];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else onComplete(profile as UserProfile);
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">{t.onboardingTitle}</h1>

        {step === 1 && (
          <div className="space-y-4">
             <label className="block text-sm font-medium text-gray-700">Ismingiz va Yoshingiz</label>
             <input 
              type="text" 
              className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-bold"
              placeholder="Ismingiz..."
              value={profile.name || ''}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
             />
             <input 
              type="number" 
              className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-bold"
              placeholder="Yoshingiz..."
              value={profile.age || ''}
              onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
             />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{t.levelLabel}</label>
            <div className="grid grid-cols-1 gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setProfile({ ...profile, currentLevel: lvl })}
                  className={`p-3 rounded-xl border text-left transition ${
                    profile.currentLevel === lvl ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{t.targetLabel}</label>
            <div className="grid grid-cols-1 gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setProfile({ ...profile, targetLevel: lvl })}
                  className={`p-3 rounded-xl border text-left transition ${
                    profile.targetLevel === lvl ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{t.goalLabel}</label>
            <div className="grid grid-cols-1 gap-2 text-gray-900">
              {goals.map((g) => (
                <button
                  key={g}
                  onClick={() => setProfile({ ...profile, goal: g })}
                  className={`p-3 rounded-xl border text-left transition ${
                    profile.goal === g ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-4">
            <label className="block text-sm font-medium text-gray-700">Tilni tanlang</label>
            <div className="flex justify-center space-x-3">
              {(['uz', 'ru', 'en'] as AppLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setProfile({ ...profile, language: l }); }}
                  className={`px-6 py-3 rounded-2xl text-lg font-bold transition ${
                    lang === l ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={step === 1 && (!profile.name || !profile.age)}
          className="w-full mt-8 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {step === 5 ? t.startBtn : t.next}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
