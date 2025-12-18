
import { UserProfile, LeaderboardEntry } from '../types';

const DB_KEY = 'ai_mentor_online_db';
const SESSION_KEY = 'ai_mentor_session';

// Global (online) foydalanuvchilar simulyatsiyasi uchun boshlang'ich ma'lumotlar
const INITIAL_ONLINE_USERS: LeaderboardEntry[] = [
  { id: 'u1', name: 'Dilshod', coins: 2450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dilshod' },
  { id: 'u2', name: 'Malika', coins: 1890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Malika' },
  { id: 'u3', name: 'Sardor', coins: 1560, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sardor' },
  { id: 'u4', name: 'Gulnoza', coins: 1200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gulnoza' }
];

export const Backend = {
  // Barcha foydalanuvchilarni "online" serverdan olish simulyatsiyasi
  getOnlineUsers: (): UserProfile[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Foydalanuvchini saqlash (Sinxronizatsiya)
  syncUser: (user: UserProfile) => {
    const users = Backend.getOnlineUsers();
    const index = users.findIndex(u => u.email === user.email);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, user.email);
  },

  // Reytingni shakllantirish (O'zingiz + Boshqa online talabalar)
  getLeaderboard: (currentUser?: UserProfile): LeaderboardEntry[] => {
    // Fix: Explicitly type onlineUsers to ensure avatar remains optional as per LeaderboardEntry interface
    const onlineUsers: LeaderboardEntry[] = Backend.getOnlineUsers().map(u => ({
      id: u.id,
      name: u.name,
      coins: u.coins,
      avatar: u.avatar,
      isSelf: u.email === currentUser?.email
    }));

    // Simulyatsiya qilingan foydalanuvchilarni qo'shish
    const combined = [...onlineUsers];
    INITIAL_ONLINE_USERS.forEach(mock => {
      if (!combined.find(u => u.name === mock.name)) {
        combined.push(mock);
      }
    });

    return combined.sort((a, b) => b.coins - a.coins);
  },

  getUserByEmail: (email: string): UserProfile | null => {
    const users = Backend.getOnlineUsers();
    return users.find(u => u.email === email) || null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentSessionEmail: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  }
};
