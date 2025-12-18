
import { UserProfile, LeaderboardEntry } from '../types';

const DB_KEY = 'ai_mentor_users_db';

export const Backend = {
  // Barcha foydalanuvchilarni olish
  getAllUsers: (): UserProfile[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Foydalanuvchini saqlash yoki yangilash
  saveUser: (user: UserProfile) => {
    const users = Backend.getAllUsers();
    const index = users.findIndex(u => u.email === user.email);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    // O'z ma'lumotlarini ham alohida saqlash (tezkor yuklash uchun)
    localStorage.setItem(`ai_tutor_user_${user.email}`, JSON.stringify(user));
  },

  // Reytingni shakllantirish
  getLeaderboard: (): LeaderboardEntry[] => {
    const users = Backend.getAllUsers();
    return users
      .map(u => ({
        id: u.id,
        name: u.name,
        coins: u.coins,
        avatar: u.avatar
      }))
      .sort((a, b) => b.coins - a.coins);
  },

  // Email orqali foydalanuvchini topish
  getUserByEmail: (email: string): UserProfile | null => {
    const users = Backend.getAllUsers();
    return users.find(u => u.email === email) || null;
  }
};
