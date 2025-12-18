
import React, { useState } from 'react';
import { Mail, Lock, Chrome } from 'lucide-react';

interface AuthProps {
  onAuth: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) onAuth(email);
  };

  const handleGoogle = () => {
    onAuth('user_google@gmail.com');
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-black text-center text-gray-800 mb-2">
          {isLogin ? 'Xush kelibsiz!' : 'Ro\'yxatdan o\'tish'}
        </h2>
        <p className="text-gray-500 text-center mb-8">
          {isLogin ? 'Tizimga kirish uchun ma\'lumotlarni kiriting' : 'Yangi hisob yarating'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Parol"
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg">
            {isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <div className="mt-6 flex items-center space-x-4">
          <div className="h-px flex-1 bg-gray-100"></div>
          <span className="text-xs text-gray-400 font-bold uppercase">Yoki</span>
          <div className="h-px flex-1 bg-gray-100"></div>
        </div>

        <button 
          onClick={handleGoogle}
          className="w-full mt-6 flex items-center justify-center space-x-3 border-2 border-gray-100 py-3.5 rounded-2xl hover:bg-gray-50 transition"
        >
          <Chrome className="text-red-500" size={20} />
          <span className="font-bold text-gray-700">Google bilan kirish</span>
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-indigo-600 font-bold hover:underline"
          >
            {isLogin ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
