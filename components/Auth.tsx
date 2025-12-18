
import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, Sparkles, UserPlus } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface AuthProps {
  onAuth: (email: string, name?: string, avatar?: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Google tugmasini render qilish (haqiqiy Client ID kerak bo'ladi)
    // Bu yerda demo uchun placeholder ishlatamiz, lekin API skripti ulangan
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Placeholder
        callback: handleGoogleResponse
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  const handleGoogleResponse = (response: any) => {
    const decoded: any = jwtDecode(response.credential);
    onAuth(decoded.email, decoded.name, decoded.picture);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Realistik server kutish vaqti
    setTimeout(() => {
      if (email && password) {
        onAuth(email);
      }
      setIsLoading(false);
    }, 1500);
  };

  // Demo Google login (tugma ishlamasa yoki Client ID bo'lmasa)
  const simulateGoogle = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAuth('demo_student@gmail.com', 'Azizbek', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aziz');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-6 text-white">
            <Sparkles size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
            {isLogin ? 'Xush kelibsiz!' : 'Yangi Hisob'}
          </h2>
          <p className="text-gray-500 font-medium">Ingliz tili olamiga sayohatni boshlang</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition" size={20} />
              <input
                type="email"
                placeholder="Email manzilingiz"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition text-gray-900 font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-indigo-600 transition" size={20} />
              <input
                type="password"
                placeholder="Parolingiz"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition text-gray-900 font-semibold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'}</span>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-black tracking-widest">Yoki</span></div>
          </div>

          <div className="mt-8 space-y-3">
            <div id="googleBtn"></div>
            {/* Failover Button if Google identity script is blocked or no Client ID */}
            <button 
              onClick={simulateGoogle}
              className="w-full flex items-center justify-center space-x-3 border-2 border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition font-bold text-gray-700 active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span>Google orqali kirish</span>
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-bold text-gray-500">
          {isLogin ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-600 hover:underline"
          >
            {isLogin ? 'Hoziroq oching' : 'Tizimga kiring'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
