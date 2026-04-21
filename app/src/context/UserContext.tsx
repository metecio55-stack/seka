import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'commission' | 'bonus' | 'profit';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  description: string;
  txHash?: string;
  network?: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  address: string;
  network: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  date: string;
  fee: number;
}

export interface DepositRequest {
  id: string;
  amount: number;
  network: string;
  txHash: string;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  vipLevel: number;
  referralCode: string;
  referredBy?: string;
  teamMembers: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  totalEarnings: number;
  referralEarnings: number;
  deposits: number;
  investments: number;
  transactions: Transaction[];
  withdrawalRequests: WithdrawalRequest[];
  depositRequests: DepositRequest[];
  phone?: string;
  createdAt: string;
  lastQuantifyTime?: string;
  lastSpinTime?: string;
  spinRights: number;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  getReferralLink: () => string;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  requestWithdrawal: (amount: number, address: string, network: string, fee: number) => Promise<boolean>;
  requestDeposit: (amount: number, network: string, txHash: string) => Promise<boolean>;
  invest: (amount: number, vipLevel: number) => Promise<boolean>;
  getTeamMembers: () => User[];
  getTier1Members: () => User[];
  getTier2Members: () => User[];
  getTier3Members: () => User[];
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  addDailyProfit: () => void;
  quantify: () => Promise<{ success: boolean; message: string; profit?: number }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Admin wallet addresses
export const ADMIN_WALLETS = {
  trc20: 'TF7tKSsWQgvty8cvZTQQLwU5uz2LG5vkxb',
  bep20: '0xe344B7e57fa47F98e9844d9cFD06E88c6207a418',
  brise: '0xe344B7e57fa47F98e9844d9cFD06E88c6207a418',
  usdc: '0xe344B7e57fa47F98e9844d9cFD06E88c6207a418',
  ethereum: '0xe344B7e57fa47F98e9844d9cFD06E88c6207a418',
};

// Network configurations
export const NETWORKS = {
  trc20: { name: 'TRC20', token: 'USDT', fee: 1, minDeposit: 10, minWithdraw: 50, confirmTime: '3 min' },
  bep20: { name: 'BEP20', token: 'USDT', fee: 0.5, minDeposit: 5, minWithdraw: 50, confirmTime: '5 min' },
  brise: { name: 'BRISE', token: 'BRISE', fee: 0, minDeposit: 1000000, minWithdraw: 2000000, confirmTime: '1 min' },
  usdc: { name: 'USDC', token: 'USDC', fee: 2, minDeposit: 10, minWithdraw: 50, confirmTime: '10 min' },
  ethereum: { name: 'ERC20', token: 'USDT', fee: 5, minDeposit: 50, minWithdraw: 100, confirmTime: '15 min' },
};

// VIP Plans
export const VIP_PLANS = [
  { level: 1, min: 10, max: 74, dailyRate: 27, dailyMin: 2.7, dailyMax: 20.25 },
  { level: 2, min: 75, max: 224, dailyRate: 28, dailyMin: 21, dailyMax: 63 },
  { level: 3, min: 225, max: 749, dailyRate: 29, dailyMin: 65.25, dailyMax: 217.5 },
  { level: 4, min: 750, max: 2249, dailyRate: 32, dailyMin: 240, dailyMax: 720 },
  { level: 5, min: 2250, max: 7499, dailyRate: 36, dailyMin: 810, dailyMax: 2700 },
  { level: 6, min: 7500, max: 22499, dailyRate: 45, dailyMin: 3375, dailyMax: 10125 },
  { level: 7, min: 22500, max: 49999, dailyRate: 55, dailyMin: 12375, dailyMax: 27500 },
  { level: 8, min: 50000, max: Infinity, dailyRate: 65, dailyMin: 32500, dailyMax: Infinity },
];

// Referral Commission Rates
const REFERRAL_COMMISSION = {
  tier1: 0.14, // 14% direct referral
  tier2: 0.03, // 3%
  tier3: 0.03, // 3%
};

// Generate random referral code
const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Generate transaction ID
const generateTxId = () => {
  return 'TX' + Date.now().toString(36).toUpperCase();
};

// Helper: sync a user to localStorage
const syncUserToStorage = (updatedUser: User) => {
  localStorage.setItem('seka_user', JSON.stringify(updatedUser));
  const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
  const index = users.findIndex((u: User) => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('seka_users', JSON.stringify(users));
  }
};

// Helper: find user by referral code
const findUserByReferralCode = (code: string): User | null => {
  const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
  return users.find((u: User) => u.referralCode === code) || null;
};

// Helper: add commission to a user
const addCommissionToUser = (userId: string, amount: number, description: string) => {
  const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
  const index = users.findIndex((u: User) => u.id === userId);
  if (index === -1) return;

  users[index].balance = (users[index].balance || 0) + amount;
  users[index].referralEarnings = (users[index].referralEarnings || 0) + amount;
  users[index].totalEarnings = (users[index].totalEarnings || 0) + amount;

  const commissionTx: Transaction = {
    id: generateTxId(),
    type: 'commission',
    amount: amount,
    status: 'completed',
    date: new Date().toISOString(),
    description: description,
  };

  users[index].transactions = [commissionTx, ...(users[index].transactions || [])];
  localStorage.setItem('seka_users', JSON.stringify(users));

  // Sync current session if this is the logged in user
  const currentSession = localStorage.getItem('seka_user');
  if (currentSession) {
    const sessionUser = JSON.parse(currentSession);
    if (sessionUser.id === userId) {
      sessionUser.balance = users[index].balance;
      sessionUser.referralEarnings = users[index].referralEarnings;
      sessionUser.totalEarnings = users[index].totalEarnings;
      sessionUser.transactions = users[index].transactions;
      localStorage.setItem('seka_user', JSON.stringify(sessionUser));
    }
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('seka_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsLoggedIn(true);
    }
  }, []);

  // Auto-add daily profit
  useEffect(() => {
    if (!user || user.vipLevel === 0) return;
    const interval = setInterval(() => {
      addDailyProfit();
    }, 86400000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
    const foundUser = users.find((u: User & { password?: string }) => u.email === email && u.password === password);
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      setIsLoggedIn(true);
      localStorage.setItem('seka_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    referralCode?: string
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
    if (users.find((u: User) => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      balance: 10,
      vipLevel: 0,
      referralCode: generateReferralCode(),
      referredBy: referralCode,
      teamMembers: 0,
      tier1Count: 0,
      tier2Count: 0,
      tier3Count: 0,
      totalEarnings: 10,
      referralEarnings: 0,
      deposits: 10,
      investments: 0,
      transactions: [{
        id: generateTxId(),
        type: 'bonus',
        amount: 10,
        status: 'completed',
        date: new Date().toISOString(),
        description: 'Welcome bonus - System gift for new members',
      }],
      withdrawalRequests: [],
      depositRequests: [],
      createdAt: new Date().toISOString(),
      spinRights: 0,
    };

    users.push({ ...newUser, password });
    localStorage.setItem('seka_users', JSON.stringify(users));

    // Professional 3-Tier Referral System
    if (referralCode) {
      // Find Tier 1 (direct referrer)
      const tier1User = findUserByReferralCode(referralCode);
      if (tier1User) {
        // Add Tier 1 commission ($1 for registration)
        const tier1Commission = 1;
        addCommissionToUser(
          tier1User.id,
          tier1Commission,
          `Tier 1 commission - ${username} registered using your referral code`
        );

        // Update Tier 1 user's tier1Count
        const usersArr = JSON.parse(localStorage.getItem('seka_users') || '[]');
        const t1Idx = usersArr.findIndex((u: User) => u.id === tier1User.id);
        if (t1Idx !== -1) {
          usersArr[t1Idx].tier1Count = (usersArr[t1Idx].tier1Count || 0) + 1;
          usersArr[t1Idx].teamMembers = (usersArr[t1Idx].teamMembers || 0) + 1;
          usersArr[t1Idx].spinRights = (usersArr[t1Idx].spinRights || 0) + 1;
          localStorage.setItem('seka_users', JSON.stringify(usersArr));
        }

        // Find Tier 2 (referrer's referrer)
        if (tier1User.referredBy) {
          const tier2User = findUserByReferralCode(tier1User.referredBy);
          if (tier2User) {
            const tier2Commission = 0.5;
            addCommissionToUser(
              tier2User.id,
              tier2Commission,
              `Tier 2 commission - ${username} joined your network (via ${tier1User.username})`
            );

            // Update Tier 2 user's tier2Count
            const usersArr2 = JSON.parse(localStorage.getItem('seka_users') || '[]');
            const t2Idx = usersArr2.findIndex((u: User) => u.id === tier2User.id);
            if (t2Idx !== -1) {
              usersArr2[t2Idx].tier2Count = (usersArr2[t2Idx].tier2Count || 0) + 1;
              usersArr2[t2Idx].teamMembers = (usersArr2[t2Idx].teamMembers || 0) + 1;
              localStorage.setItem('seka_users', JSON.stringify(usersArr2));
            }

            // Find Tier 3 (referrer's referrer's referrer)
            if (tier2User.referredBy) {
              const tier3User = findUserByReferralCode(tier2User.referredBy);
              if (tier3User) {
                const tier3Commission = 0.25;
                addCommissionToUser(
                  tier3User.id,
                  tier3Commission,
                  `Tier 3 commission - ${username} joined your network (indirect)`
                );

                // Update Tier 3 user's tier3Count
                const usersArr3 = JSON.parse(localStorage.getItem('seka_users') || '[]');
                const t3Idx = usersArr3.findIndex((u: User) => u.id === tier3User.id);
                if (t3Idx !== -1) {
                  usersArr3[t3Idx].tier3Count = (usersArr3[t3Idx].tier3Count || 0) + 1;
                  usersArr3[t3Idx].teamMembers = (usersArr3[t3Idx].teamMembers || 0) + 1;
                  localStorage.setItem('seka_users', JSON.stringify(usersArr3));
                }
              }
            }
          }
        }
      }
    }

    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('seka_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('seka_user');
  };

  const quantify = async (): Promise<{ success: boolean; message: string; profit?: number }> => {
    if (!user) return { success: false, message: 'User not logged in' };

    const hasDeposited = user.deposits > 10 || user.transactions?.some((t: Transaction) => t.type === 'deposit' && t.status === 'completed');
    if (!hasDeposited) {
      return { success: false, message: 'You need to make a deposit first to unlock quantify.' };
    }

    const now = Date.now();
    const lastQuantify = user.lastQuantifyTime ? new Date(user.lastQuantifyTime).getTime() : 0;
    const cooldownMs = 24 * 60 * 60 * 1000;

    if (lastQuantify > 0 && now - lastQuantify < cooldownMs) {
      const remainingMs = cooldownMs - (now - lastQuantify);
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        success: false,
        message: `Please wait ${remainingHours}h ${remainingMinutes}m before quantifying again.`
      };
    }

    const profit = user.balance * 0.27; // 27% increase

    const updatedUser = {
      ...user,
      balance: user.balance + profit,
      totalEarnings: (user.totalEarnings || 0) + profit,
      lastQuantifyTime: new Date().toISOString(),
    };

    setUser(updatedUser);
    syncUserToStorage(updatedUser);

    const newTransaction: Transaction = {
      id: generateTxId(),
      type: 'profit',
      amount: profit,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Quantify profit - 27% daily boost`,
    };

    updatedUser.transactions = [newTransaction, ...updatedUser.transactions];
    setUser(updatedUser);
    syncUserToStorage(updatedUser);

    return { success: true, message: 'Quantify completed!', profit };
  };

  const updateBalance = (amount: number) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount };
      setUser(updatedUser);
      syncUserToStorage(updatedUser);
    }
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    if (user) {
      const newTransaction: Transaction = {
        ...transaction,
        id: generateTxId(),
        date: new Date().toISOString(),
      };
      const updatedUser = {
        ...user,
        transactions: [newTransaction, ...(user.transactions || [])],
      };
      setUser(updatedUser);
      syncUserToStorage(updatedUser);
    }
  };

  const requestWithdrawal = async (amount: number, address: string, network: string, fee: number): Promise<boolean> => {
    if (!user || user.balance < amount + fee) return false;
    const netAmount = amount - fee;
    const withdrawalRequest: WithdrawalRequest = {
      id: 'WD' + Date.now().toString(36).toUpperCase(),
      amount: netAmount,
      address,
      network,
      status: 'pending',
      date: new Date().toISOString(),
      fee,
    };
    const updatedUser = {
      ...user,
      balance: user.balance - amount - fee,
      withdrawalRequests: [withdrawalRequest, ...(user.withdrawalRequests || [])],
    };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
    addTransaction({
      type: 'withdrawal',
      amount: -(amount + fee),
      status: 'pending',
      description: `Withdrawal to ${address.substring(0, 15)}... via ${network.toUpperCase()}`,
      network,
    });
    return true;
  };

  const requestDeposit = async (amount: number, network: string, txHash: string): Promise<boolean> => {
    if (!user) return false;
    const depositRequest: DepositRequest = {
      id: 'DP' + Date.now().toString(36).toUpperCase(),
      amount,
      network,
      txHash,
      status: 'pending',
      date: new Date().toISOString(),
    };
    const updatedUser = {
      ...user,
      depositRequests: [depositRequest, ...(user.depositRequests || [])],
    };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
    addTransaction({
      type: 'deposit',
      amount: 0,
      status: 'pending',
      description: `Deposit ${amount} ${NETWORKS[network as keyof typeof NETWORKS]?.token || 'USDT'} via ${network.toUpperCase()}`,
      txHash,
      network,
    });

    // Professional 3-Tier Commission on Deposit
    if (user.referredBy) {
      // Tier 1: Direct referrer gets 14% of deposit
      const tier1User = findUserByReferralCode(user.referredBy);
      if (tier1User) {
        const tier1Commission = amount * REFERRAL_COMMISSION.tier1;
        addCommissionToUser(
          tier1User.id,
          tier1Commission,
          `Tier 1 commission - ${user.username} deposited $${amount} (14%)`
        );

        // Tier 2: Referrer's referrer gets 3%
        if (tier1User.referredBy) {
          const tier2User = findUserByReferralCode(tier1User.referredBy);
          if (tier2User) {
            const tier2Commission = amount * REFERRAL_COMMISSION.tier2;
            addCommissionToUser(
              tier2User.id,
              tier2Commission,
              `Tier 2 commission - ${user.username} deposited $${amount} (3%)`
            );

            // Tier 3: Referrer's referrer's referrer gets 3%
            if (tier2User.referredBy) {
              const tier3User = findUserByReferralCode(tier2User.referredBy);
              if (tier3User) {
                const tier3Commission = amount * REFERRAL_COMMISSION.tier3;
                addCommissionToUser(
                  tier3User.id,
                  tier3Commission,
                  `Tier 3 commission - ${user.username} deposited $${amount} (3%)`
                );
              }
            }
          }
        }
      }
    }

    return true;
  };

  const invest = async (amount: number, vipLevel: number): Promise<boolean> => {
    if (!user || user.balance < amount) return false;
    const updatedUser = {
      ...user,
      balance: user.balance - amount,
      investments: (user.investments || 0) + amount,
      vipLevel: Math.max(user.vipLevel, vipLevel),
    };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
    addTransaction({
      type: 'investment',
      amount: -amount,
      status: 'completed',
      description: `VIP ${vipLevel} Investment Plan`,
    });
    return true;
  };

  const addDailyProfit = () => {
    if (!user || user.vipLevel === 0 || user.investments === 0) return;
    const vipPlan = VIP_PLANS.find(v => v.level === user.vipLevel);
    if (!vipPlan) return;
    const dailyProfit = (user.investments * vipPlan.dailyRate) / 100;
    const updatedUser = {
      ...user,
      balance: user.balance + dailyProfit,
      totalEarnings: (user.totalEarnings || 0) + dailyProfit,
    };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
    const newTransaction: Transaction = {
      id: generateTxId(),
      type: 'profit',
      amount: dailyProfit,
      status: 'completed',
      date: new Date().toISOString(),
      description: `Daily profit from VIP ${user.vipLevel} investment`,
    };
    updatedUser.transactions = [newTransaction, ...updatedUser.transactions];
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    syncUserToStorage(updatedUser);
    return true;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
    const index = users.findIndex((u: User & { password?: string }) => u.id === user.id && u.password === currentPassword);
    if (index === -1) return false;
    users[index].password = newPassword;
    localStorage.setItem('seka_users', JSON.stringify(users));
    return true;
  };

  const getReferralLink = () => {
    if (user) {
      return `${window.location.origin}/register?ref=${user.referralCode}`;
    }
    return '';
  };

  const getTeamMembers = (): User[] => {
    if (!user) return [];
    const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
    return users.filter((u: User & { referredBy?: string }) => u.referredBy === user.referralCode);
  };

  const getTier1Members = (): User[] => {
    if (!user) return [];
    const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
    return users.filter((u: User & { referredBy?: string }) => u.referredBy === user.referralCode);
  };

  const getTier2Members = (): User[] => {
    if (!user) return [];
    const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
    const tier1Codes = allUsers
      .filter((u: User & { referredBy?: string }) => u.referredBy === user.referralCode)
      .map((u: User) => u.referralCode);
    return allUsers.filter((u: User & { referredBy?: string }) => tier1Codes.includes(u.referredBy));
  };

  const getTier3Members = (): User[] => {
    if (!user) return [];
    const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
    const tier1Codes = allUsers
      .filter((u: User & { referredBy?: string }) => u.referredBy === user.referralCode)
      .map((u: User) => u.referralCode);
    const tier2Codes = allUsers
      .filter((u: User & { referredBy?: string }) => tier1Codes.includes(u.referredBy))
      .map((u: User) => u.referralCode);
    return allUsers.filter((u: User & { referredBy?: string }) => tier2Codes.includes(u.referredBy));
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoggedIn,
      login,
      register,
      logout,
      updateBalance,
      getReferralLink,
      addTransaction,
      requestWithdrawal,
      requestDeposit,
      invest,
      getTeamMembers,
      getTier1Members,
      getTier2Members,
      getTier3Members,
      updateProfile,
      changePassword,
      addDailyProfit,
      quantify,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
