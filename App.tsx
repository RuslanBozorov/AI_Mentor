
import React, { useState, useEffect } from 'react';
import { UserProfile, LessonContent, TaskResponse, EnglishLevel, RoadmapNode } from './types';
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
import { UI_TEXT } from './constants';
import { Trophy, Settings, Coins, ShoppingBag, GraduationCap, Map, Sparkles } from 'lucide-react';

const TASKS_PER_LESSON = 5;

const App: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'rank' | 'profile' | 'shop'>('roadmap');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskResponse, setTaskResponse] = useState<TaskResponse | null>(null);
  const [assistantMsg, setAssistantMsg] = useState('Salom! Bugun nimani o\'rganamiz?');
  const [currentNode, setCurrentNode] = useState<RoadmapNode | null>(null);

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

  const saveUser = (updatedUser: UserProfile, resetLesson: boolean = false) => {
    setUser(updatedUser);
    localStorage.setItem(`ai_tutor_user_${updatedUser.email}`, JSON.stringify(updatedUser));
    
    const allUsersJson = localStorage.getItem('ai_tutor_all_users') || '[]';
    let allUsers: UserProfile[] = JSON.parse(allUsersJson);
    const index = allUsers.findIndex(u => u.id === updatedUser.id);
    if (index > -1) allUsers[index] = updatedUser;
    else allUsers.push(updatedUser);
    localStorage.setItem('ai_tutor_all_users', JSON.stringify(allUsers));

    if (resetLesson) {
      setLesson(null);
      setTaskResponse(null);
      setCurrentNode(null);
    }
  };

  const loadTask = async (currentUser: UserProfile, isExam: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const newLesson = await generateLesson(currentUser, isExam);
      setLesson(newLesson);
      setAssistantMsg(`Qani, urinib ko'rchi! "${newLesson.title}" mavzusini o'rganyapmiz.`);
    } catch (e) {
      setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
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
      const result = await evaluateTask(user, lesson, answer);
      setTaskResponse(result);
      if (result.success) {
        setAssistantMsg("Barakalla! To'g'ri topding!");
      } else {
        setAssistantMsg("Hm, biroz xato bo'ldi. Yana bir urinib ko'ramizmi?");
      }
    } catch (e) {
      setError("Xatolik.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextLesson = () => {
    if (!user || !taskResponse || !currentNode) return;
    
    const updatedUser = { ...user, coins: user.coins + taskResponse.coins };
    
    if (taskResponse.success) {
      // Advance inside lesson
      const newIndex = user.currentTaskIndex + 1;
      if (newIndex >= TASKS_PER_LESSON) {
        // Lesson Complete
        updatedUser.currentTaskIndex = 0;
        updatedUser.lessonsCompleted += 1;
        setLesson(null);
        setCurrentNode(null);
        setAssistantMsg("Darsni a'lo darajada tugatding! Keyingisiga o'tamizmi?");
      } else {
        // Next task in same lesson
        updatedUser.currentTaskIndex = newIndex;
        loadTask(updatedUser, currentNode.type === 'exam');
      }
      saveUser(updatedUser);
      setTaskResponse(null);
    } else {
      // Stay on same task, retry
      setTaskResponse(null);
      loadTask(user, currentNode.type === 'exam');
    }
  };

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
            <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full flex items-center space-x-1 font-black text-sm border border-amber-100 shadow-sm">
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
        {isLoading && !lesson && !taskResponse && (
          <div className="fixed inset-0 z-50 bg-indigo-600 flex flex-col items-center justify-center text-white text-center p-8">
            <div className="mb-6 relative">
               <div className="animate-spin rounded-full h-24 w-24 border-8 border-white/20 border-t-white" />
               <Sparkles className="absolute inset-0 m-auto animate-bounce" size={32} />
            </div>
            <h2 className="text-4xl font-black mb-4">Dars hozir boshlanadi...</h2>
            <p className="text-indigo-100 text-xl font-bold max-w-xs">Siz uchun eng zo'r topshiriqlarni tayyorlayapmiz!</p>
          </div>
        )}

        {activeTab === 'roadmap' && !lesson && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-800 tracking-tight">O'quv Yo'li</h2>
              <p className="text-indigo-600 font-black text-lg bg-indigo-50 inline-block px-4 py-1 rounded-full">{user.goal} Yo'nalishi</p>
            </div>
            <Roadmap user={user} onNodeClick={startNode} />
          </div>
        )}

        {lesson && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
             <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <button onClick={() => {setLesson(null); setCurrentNode(null);}} className="text-indigo-600 font-black hover:bg-indigo-50 px-3 py-1 rounded-xl transition">← Chiqish</button>
                <div className="flex-1 mx-4">
                   <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                      <div className="h-full bg-indigo-600 transition-all duration-700 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{width: `${((user.currentTaskIndex) / TASKS_PER_LESSON) * 100}%`}} />
                   </div>
                </div>
                <span className="text-xs font-black text-indigo-600">{user.currentTaskIndex + 1}/{TASKS_PER_LESSON}</span>
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

      {taskResponse && <FeedbackModal response={taskResponse} language={user.language} onNext={handleNextLesson} />}
      
      <AIAssistant message={assistantMsg} isThinking={isLoading} />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-gray-100 p-4 z-40 shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-3xl flex justify-around">
          {[
            { id: 'roadmap', icon: Map, label: 'Yo\'l' },
            { id: 'rank', icon: Trophy, label: 'Reyting' },
            { id: 'shop', icon: ShoppingBag, label: 'Do\'kon' },
            { id: 'profile', icon: Settings, label: 'Profil' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setLesson(null); setCurrentNode(null); }} 
              className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === item.id ? 'text-indigo-600 scale-125' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon size={ activeTab === item.id ? 28 : 24} strokeWidth={activeTab === item.id ? 2.5 : 2} /> 
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
};

export default App;
