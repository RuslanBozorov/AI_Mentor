
import React from 'react';
import { ShoppingBag, Construction, Heart, Zap, Star } from 'lucide-react';

const Shop: React.FC = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center py-20">
        <div className="bg-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
          <Construction size={48} />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Do'kon bo'limi</h2>
        <p className="text-gray-500 font-bold text-lg mb-8">Dastur ustida ishlayapmiz...</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-40 grayscale">
          <div className="border border-gray-100 p-4 rounded-2xl flex items-center space-x-4">
            <div className="bg-red-50 p-3 rounded-xl text-red-500"><Heart /></div>
            <div className="text-left">
              <p className="font-bold">Extra Life</p>
              <p className="text-xs">500 coins</p>
            </div>
          </div>
          <div className="border border-gray-100 p-4 rounded-2xl flex items-center space-x-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-500"><Zap /></div>
            <div className="text-left">
              <p className="font-bold">Double XP</p>
              <p className="text-xs">1000 coins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
