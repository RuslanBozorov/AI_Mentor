
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
      const savedUser = localStorage.getItem(`ai_tutor_user_${savedEmail}`);
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = (authEmail: string) => {
    setEmail(authEmail);
    localStorage.setItem('ai_tutor_email', authEmail);
    const existing = localStorage.getItem(`ai_tutor_user_${authEmail}`);
    if (existing) setUser(JSON.parse(existing));
  };

  const saveUser = useCallback((updatedUser: UserProfile, resetLesson: boolean = false) => {
    setUser(updatedUser);
    localStorage.setItem(`ai_tutor_user_${updatedUser.email}`, JSON.stringify(updatedUser));
    
    const allUsersJson = localStorage.getItem('ai_tutor_all_users') || '[]';
    let allUsers: UserProfile[] = JSON.parse(allUsersJson);
    const index = allUsers.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
      allUsers[index] = updatedUser;
    } else {
      allUsers.push(updatedUser);
    }
    localStorage.setItem('ai_tutor_all_users', JSON.stringify(allUsers));

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
      setAssistantMsg(`Barakalla! "${newLesson.title}" mavzusini o'rganishni boshladik!`);
    } catch (e: any) {
      console.error(e);
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
    setError(null);
    try {
      const response = await evaluateTask(user, lesson, answer);
      setTaskResponse(response);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Xatolik yuz berdi.");
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
        saveUser(updatedUser);
        setLesson(null);
        setCurrentNode(null);
        setTaskResponse(null);
      } else {
        updatedUser.currentTaskIndex = newIndex;
        saveUser(updatedUser);
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
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl space-y-6 border-b-8 border-indigo-200">
          <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <Key size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">Sozlash kerak!</h2>
          <div className="space-y-4 text-left">
            <p className="text-gray-600 font-medium text-sm">
              Vercel Settings {"\u2192"} Environment Variables bo{"'"}limiga API_KEY qo{"'"}shing.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-mono text-slate-500 border border-slate-100">
              1. Project Settings<br />
              2. Environment Variables<br />
              3. Key: API_KEY<br />
              4. Value: [Google AI Studio Key]
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!email) return <Auth onAuth={handleAuth} />;
  if (!user) return <Onboarding email={email} onComplete={(p) => saveUser(p)} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans antialiased text-gray-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <GraduationCap size={20} />
            </div>
            <h1 className="font-black text-gray-800 text-lg tracking-tight">AI Mentor</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full flex items-center space-x-1 font-black text-sm border border-amber-100">
              <Coins size={16} />
              <span>{user.coins}</span>
            </div>
            <button onClick={() => setActiveTab('profile')}>
              <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Avatar" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {error && (
          <div className="mb-8 p-8 bg-white border-4 border-red-50 rounded-[40px] flex flex-col items-center text-center space-y-6 shadow-xl">
            <div className="bg-red-100 p-5 rounded-full text-red-600">
               <AlertTriangle size={48} />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-gray-900">Xatolik</h3>
               <p className="text-gray-500 font-bold max-w-sm">{error}</p>
            </div>
            <button 
              onClick={() => { setError(null); if(currentNode) loadTask(user, currentNode.type === 'exam'); }}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition"
            >
              <RefreshCcw size={20} />
              <span>Qayta urinish</span>
            </button>
          </div>
        )}

        {isLoading && !lesson && !taskResponse && (
          <div className="fixed inset-0 z-50 bg-indigo-600 flex flex-col items-center justify-center text-white text-center p-8">
            <div className="mb-6">
               <div className="animate-spin rounded-full h-24 w-24 border-8 border-white/20 border-t-white" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter italic">Yuklanmoqda...</h2>
          </div>
        )}

        {activeTab === 'roadmap' && !lesson && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter">O{"'"}quv Yo{"'"}li</h2>
              <p className="text-indigo-600 font-black text-lg bg-indigo-50 inline-block px-6 py-2 rounded-full border border-indigo-100">{user.goal}</p>
            </div>
            <Roadmap user={user} onNodeClick={startNode} />
          </div>
        )}

        {lesson && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
             <div className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                <button onClick={() => {setLesson(null); setCurrentNode(null); setError(null);}} className="text-indigo-600 font-black hover:bg-indigo-50 px-4 py-2 rounded-2xl transition">{"\u2190"} Chiqish</button>
                <div className="flex-1 mx-6">
                   <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 p-0.5">
                      <div className="h-full bg-indigo-600 transition-all duration-700 rounded-full" style={{width: `${(user.currentTaskIndex / TASKS_PER_LESSON) * 100}%`}} />
                   </div>
                </div>
                <span className="text-sm font-black text-indigo-600">{user.currentTaskIndex + 1}/{TASKS_PER_LESSON}</span>
             </div>
             
             {isLoading && !taskResponse ? (
                <div className="py-24 text-center">
                   <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-48 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-8 w-64 bg-gray-200 rounded-full"></div>
                   </div>
                </div>
             ) : (
               <>
                <LessonCard lesson={lesson} language={user.language} />
                <TaskRunner lesson={lesson} language={user.language} onSubmit={handleTaskSubmit} isLoading={isLoading} />
               </>
             )}
          </div>
        )}

        {activeTab === 'rank' && <Leaderboard user={user} dynamicUsers={(JSON.parse(localStorage.getItem('ai_tutor_all_users') || '[]')).map((u: any) => ({ ...u, isSelf: u.id === user.id }))} />}
        {activeTab === 'profile' && <Profile user={user} onUpdate={saveUser} />}
        {activeTab === 'shop' && <Shop />}
      </main>

      {taskResponse && <FeedbackModal response={taskResponse} language={user.language} onNext={handleNextTask} />}
      
      <AIAssistant message={assistantMsg} isThinking={isLoading} />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 backdrop-blur-2xl border border-white/20 p-4 z-40 shadow-xl rounded-[40px] flex justify-around">
          {[
            { id: 'roadmap', icon: Map, label: "Yo'l" },
            { id: 'rank', icon: Trophy, label: 'Reyting' },
            { id: 'shop', icon: ShoppingBag, label: "Do'kon" },
            { id: 'profile', icon: Settings, label: 'Profil' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setLesson(null); setCurrentNode(null); setError(null); }} 
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon size={ activeTab === item.id ? 28 : 24} strokeWidth={activeTab === item.id ? 3 : 2} /> 
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default App;
