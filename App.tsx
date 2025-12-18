
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, LessonContent, TaskResponse, RoadmapNode } from './types';
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
import { Trophy, Settings, Coins, ShoppingBag, GraduationCap, Map, AlertTriangle, RefreshCcw, Key } from 'lucide-react';

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

  useEffect(() => {
    const savedEmail = localStorage.getItem('ai_tutor_email');
    if (savedEmail) {
      setEmail(savedEmail);
      const existingUser = Backend.getUserByEmail(savedEmail);
      if (existingUser) setUser(existingUser);
    }
  }, []);

  const handleAuth = (authEmail: string) => {
    setEmail(authEmail);
    localStorage.setItem('ai_tutor_email', authEmail);
    const existingUser = Backend.getUserByEmail(authEmail);
    if (existingUser) setUser(existingUser);
  };

  const handleUpdateUser = useCallback((updatedUser: UserProfile, resetLesson: boolean = false) => {
    setUser(updatedUser);
    Backend.saveUser(updatedUser);

    if (resetLesson) {
      setLesson(null);
      setTaskResponse(null);
      setCurrentNode(null);
    }
  }, []);

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
        setAssistantMsg("Dars tugadi! Keyingi bosqichga tayyormisiz?");
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl space-y-6">
          <Key size={48} className="mx-auto text-indigo-600" />
          <h2 className="text-2xl font-black">API_KEY Sozlanmagan</h2>
          <p className="text-gray-500">Vercel Environment Variables bo'limiga API_KEY qo'shing.</p>
        </div>
      </div>
    );
  }

  if (!email) return <Auth onAuth={handleAuth} />;
  if (!user) return <Onboarding email={email} onComplete={(p) => handleUpdateUser(p)} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-gray-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="text-indigo-600" />
            <h1 className="font-black text-lg">AI Mentor</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full flex items-center space-x-1 font-black text-sm border border-amber-100">
              <Coins size={16} />
              <span>{user.coins}</span>
            </div>
            <img 
              src={user.avatar} 
              className="w-10 h-10 rounded-full border-2 border-indigo-600 cursor-pointer" 
              onClick={() => setActiveTab('profile')}
              alt="Avatar" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {error && (
          <div className="mb-8 p-6 bg-white rounded-3xl border-2 border-red-100 flex flex-col items-center text-center space-y-4 shadow-lg">
            <AlertTriangle className="text-red-500" size={32} />
            <p className="font-bold">{error}</p>
            <button onClick={() => setError(null)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black">Yopish</button>
          </div>
        )}

        {isLoading && !lesson && !taskResponse && (
          <div className="fixed inset-0 z-50 bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4" />
            <h2 className="text-xl font-black italic">Dars tayyorlanmoqda...</h2>
          </div>
        )}

        {activeTab === 'roadmap' && !lesson && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black">O{"'"}quv Yo{"'"}li</h2>
              <p className="text-indigo-600 font-bold">{user.goal} yo{"'"}nalishi</p>
            </div>
            <Roadmap user={user} onNodeClick={startNode} />
          </div>
        )}

        {lesson && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center space-x-4 mb-6 bg-white p-3 rounded-2xl border">
                <button onClick={() => {setLesson(null); setError(null);}} className="text-indigo-600 font-black">{"\u2190"} Orqaga</button>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 transition-all" style={{width: `${(user.currentTaskIndex / TASKS_PER_LESSON) * 100}%`}} />
                </div>
                <span className="text-xs font-black">{user.currentTaskIndex + 1}/{TASKS_PER_LESSON}</span>
             </div>
             <LessonCard lesson={lesson} language={user.language} />
             <TaskRunner lesson={lesson} language={user.language} onSubmit={handleTaskSubmit} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'rank' && <Leaderboard user={user} dynamicUsers={Backend.getLeaderboard()} />}
        {activeTab === 'profile' && <Profile user={user} onUpdate={handleUpdateUser} />}
        {activeTab === 'shop' && <Shop />}
      </main>

      {taskResponse && <FeedbackModal response={taskResponse} language={user.language} onNext={handleNextTask} />}
      
      <AIAssistant message={assistantMsg} isThinking={isLoading} />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white border p-3 z-40 shadow-2xl rounded-[30px] flex justify-around">
          {[
            { id: 'roadmap', icon: Map, label: "Yo'l" },
            { id: 'rank', icon: Trophy, label: 'Reyting' },
            { id: 'shop', icon: ShoppingBag, label: "Do'kon" },
            { id: 'profile', icon: Settings, label: 'Profil' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setLesson(null); }} 
              className={`flex flex-col items-center p-2 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}
            >
              <item.icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} /> 
              <span className="text-[10px] font-black uppercase mt-1">{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default App;
