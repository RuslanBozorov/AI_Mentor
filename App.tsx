
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, LessonContent, TaskResponse, RoadmapNode, EnglishLevel, LearningGoal } from './types';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import LessonCard from './components/LessonCard';
import TaskRunner from './components/TaskRunner';
import FeedbackModal from './components/FeedbackModal';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Shop from './components/Shop';
import Roadmap from './components/Roadmap';
import AIAssistant from './components/AIAssistant';
import { generateLesson, evaluateTask } from './services/geminiService';
import { Backend } from './services/backendService';
// Added Sparkles to the import list from lucide-react
import { Trophy, Settings, Coins, ShoppingBag, GraduationCap, Map, AlertTriangle, RefreshCcw, Key, LogOut, Sparkles } from 'lucide-react';

const TASKS_PER_LESSON = 5;

const App: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'rank' | 'profile' | 'shop'>('roadmap');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskResponse, setTaskResponse] = useState<TaskResponse | null>(null);
  const [assistantMsg, setAssistantMsg] = useState("Salom! Bugun nimani o'rganamiz?");
  const [currentNode, setCurrentNode] = useState<RoadmapNode | null>(null);

  const apiKey = process.env.API_KEY;

  // Sessiyani tekshirish
  useEffect(() => {
    const savedEmail = Backend.getCurrentSessionEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      const existingUser = Backend.getUserByEmail(savedEmail);
      if (existingUser) setUser(existingUser);
    }
  }, []);

  const handleAuth = (authEmail: string, name?: string, avatar?: string) => {
    setEmail(authEmail);
    const existingUser = Backend.getUserByEmail(authEmail);
    if (existingUser) {
      setUser(existingUser);
      Backend.syncUser(existingUser);
    } else if (name) {
      // Yangi Google foydalanuvchisi uchun qisman profil
      const newUser: Partial<UserProfile> = {
        id: Math.random().toString(36).substr(2, 9),
        email: authEmail,
        name: name,
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        coins: 0,
        onboarded: false,
        lessonsCompleted: 0,
        currentTaskIndex: 0,
        language: 'uz'
      };
      // Onboarding-ga yo'naltirish
      setUser(newUser as any);
    }
  };

  const handleUpdateUser = useCallback((updatedUser: UserProfile, resetLesson: boolean = false) => {
    setUser(updatedUser);
    Backend.syncUser(updatedUser);

    if (resetLesson) {
      setLesson(null);
      setTaskResponse(null);
      setCurrentNode(null);
    }
  }, []);

  const handleLogout = () => {
    Backend.logout();
    setEmail(null);
    setUser(null);
    setLesson(null);
  };

  const loadTask = async (currentUser: UserProfile, isExam: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const newLesson = await generateLesson(currentUser, isExam);
      setLesson(newLesson);
      setAssistantMsg(`Barakalla! "${newLesson.title}" darsini boshladik!`);
    } catch (e: any) {
      setError(e.message || "Xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNode = (node: RoadmapNode) => {
    if (!user) return;
    setCurrentNode(node);
    loadTask(user, node.type === 'exam');
  };

  const handleTaskSubmit = async (answer: string) => {
    if (!user || !lesson) return;
    setIsLoading(true);
    try {
      const response = await evaluateTask(user, lesson, answer);
      setTaskResponse(response);
    } catch (e: any) {
      setError(e.message || "Xatolik.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextTask = () => {
    if (!user || !taskResponse || !currentNode) return;
    
    const updatedUser = { ...user, coins: user.coins + (taskResponse.success ? taskResponse.coins : 0) };
    
    if (taskResponse.success) {
      const newIndex = user.currentTaskIndex + 1;
      if (newIndex >= TASKS_PER_LESSON) {
        updatedUser.currentTaskIndex = 0;
        updatedUser.lessonsCompleted += 1;
        handleUpdateUser(updatedUser);
        setLesson(null);
        setCurrentNode(null);
        setTaskResponse(null);
        setAssistantMsg("Ajoyib natija! Keyingi bosqich ochildi.");
      } else {
        updatedUser.currentTaskIndex = newIndex;
        handleUpdateUser(updatedUser);
        setTaskResponse(null);
        loadTask(updatedUser, currentNode.type === 'exam');
      }
    } else {
      setTaskResponse(null);
      loadTask(user, currentNode.type === 'exam');
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md w-full bg-slate-800 rounded-[40px] p-10 shadow-2xl space-y-6">
          <Key size={48} className="mx-auto text-indigo-400" />
          <h2 className="text-2xl font-black">API_KEY Sozlanmagan</h2>
          <p className="text-slate-400">Dasturni ishga tushirish uchun Gemini API Key kerak.</p>
        </div>
      </div>
    );
  }

  if (!email || !user) return <Auth onAuth={handleAuth} />;
  
  if (!user.onboarded) {
    return <Onboarding email={email} onComplete={(p) => handleUpdateUser({...p, onboarded: true})} />;
  }

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <GraduationCap size={18} />
            </div>
            <h1 className="font-black text-xl tracking-tight">AI Mentor</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-2xl flex items-center space-x-1 font-black text-sm border border-amber-100">
              <Coins size={16} />
              <span>{user.coins}</span>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-full border-2 border-indigo-600 overflow-hidden shadow-md"
            >
              <img src={user.avatar} className="w-full h-full object-cover" alt="Profile" />
            </button>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {error && (
          <div className="mb-8 p-6 bg-red-50 rounded-[30px] border-2 border-red-100 flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="text-red-500" size={32} />
            <p className="font-bold text-red-900">{error}</p>
            <button onClick={() => setError(null)} className="bg-white text-red-600 px-6 py-2 rounded-xl font-black shadow-sm">Tushunarli</button>
          </div>
        )}

        {isLoading && !lesson && !taskResponse && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping bg-indigo-200 rounded-full"></div>
              <div className="relative bg-indigo-600 p-6 rounded-full text-white">
                <Sparkles size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-black animate-pulse">Sun{"'"}iy ong o{"'"}ylamoqda...</h2>
          </div>
        )}

        {activeTab === 'roadmap' && !lesson && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center mb-10">
              <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">Sening Yo{"'"}nalishing</span>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">{user.goal}</h2>
            </div>
            <Roadmap user={user} onNodeClick={startNode} />
          </div>
        )}

        {lesson && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center space-x-4 mb-8 bg-white p-4 rounded-[30px] border shadow-sm">
                <button onClick={() => {setLesson(null); setError(null);}} className="text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-2xl transition">{"\u2190"} Chiqish</button>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border">
                   <div className="h-full bg-indigo-600 transition-all duration-700 rounded-full" style={{width: `${(user.currentTaskIndex / TASKS_PER_LESSON) * 100}%`}} />
                </div>
                <span className="text-sm font-black text-indigo-600">{user.currentTaskIndex + 1}/{TASKS_PER_LESSON}</span>
             </div>
             <LessonCard lesson={lesson} language={user.language} />
             <TaskRunner lesson={lesson} language={user.language} onSubmit={handleTaskSubmit} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'rank' && <Leaderboard user={user} dynamicUsers={Backend.getLeaderboard(user)} />}
        {activeTab === 'profile' && <Profile user={user} onUpdate={handleUpdateUser} />}
        {activeTab === 'shop' && <Shop />}
      </main>

      {taskResponse && <FeedbackModal response={taskResponse} language={user.language} onNext={handleNextTask} />}
      
      <AIAssistant message={assistantMsg} isThinking={isLoading} />

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border border-gray-100 p-4 z-40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[40px] flex justify-around items-center">
          {[
            { id: 'roadmap', icon: Map, label: "Yo'l" },
            { id: 'rank', icon: Trophy, label: 'Reyting' },
            { id: 'shop', icon: ShoppingBag, label: "Do'kon" },
            { id: 'profile', icon: Settings, label: 'Sozlamalar' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setLesson(null); }} 
              className={`flex flex-col items-center group transition-all duration-300 ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-gray-300 hover:text-gray-500'}`}
            >
              <div className={`p-2 rounded-2xl transition-colors ${activeTab === item.id ? 'bg-indigo-50' : ''}`}>
                <item.icon size={22} strokeWidth={activeTab === item.id ? 3 : 2} /> 
              </div>
              <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default App;
