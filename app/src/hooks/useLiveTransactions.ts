import { useState, useEffect, useCallback } from 'react';

export interface LiveTransaction {
  id: string;
  email: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'profit';
  time: Date;
}

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'protonmail.com', 'icloud.com'];
const COUNTRY_CODES = ['+1', '+44', '+49', '+33', '+39', '+34', '+81', '+82', '+86', '+91', '+61', '+7', '+90', '+55', '+52'];

const generateRandomEmail = (): string => {
  const prefixes = [
    'crypto', 'trader', 'investor', 'btc', 'eth', 'wallet', 'rich', 'money', 'gold', 'diamond',
    'star', 'lucky', 'winner', 'pro', 'master', 'king', 'queen', 'boss', 'elite', 'vip'
  ];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
  return `${prefix}${randomNum}@${domain}`;
};

const generateRandomPhone = (): string => {
  const country = COUNTRY_CODES[Math.floor(Math.random() * COUNTRY_CODES.length)];
  const number = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
  return `${country}****${number.slice(-4)}`;
};

const generateRandomAmount = (): number => {
  // Random amount between 300 and 35000
  const min = 300;
  const max = 35000;
  const random = Math.random() * (max - min) + min;
  // Round to 2 decimal places
  return Math.round(random * 100) / 100;
};

const generateTransactionId = (): string => {
  return 'TX' + Date.now().toString(36).substring(0, 8).toUpperCase();
};

export function useLiveTransactions(initialCount: number = 20) {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);

  const generateNewTransaction = useCallback((): LiveTransaction => {
    const types: ('deposit' | 'withdrawal' | 'profit')[] = ['deposit', 'deposit', 'deposit', 'profit', 'profit', 'withdrawal'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const useEmail = Math.random() > 0.3;
    const identifier = useEmail ? generateRandomEmail() : generateRandomPhone();
    
    // Mask the identifier
    let masked = identifier;
    if (useEmail) {
      const [local, domain] = identifier.split('@');
      masked = `${local.substring(0, 1)}***${local.substring(local.length - 2)}@${domain}`;
    }

    return {
      id: generateTransactionId(),
      email: masked,
      amount: generateRandomAmount(),
      type,
      time: new Date(),
    };
  }, []);

  // Initialize with random transactions
  useEffect(() => {
    const initial: LiveTransaction[] = [];
    for (let i = 0; i < initialCount; i++) {
      const tx = generateNewTransaction();
      tx.time = new Date(Date.now() - Math.random() * 3600000); // Within last hour
      initial.push(tx);
    }
    setTransactions(initial.sort((a, b) => b.time.getTime() - a.time.getTime()));
  }, [generateNewTransaction, initialCount]);

  // Add new transaction every 2-5 seconds
  useEffect(() => {
    const addTransaction = () => {
      setTransactions(prev => {
        const newTx = generateNewTransaction();
        const updated = [newTx, ...prev].slice(0, 50); // Keep last 50
        return updated;
      });
    };

    const scheduleNext = () => {
      const delay = Math.random() * 3000 + 2000; // 2-5 seconds
      return setTimeout(() => {
        addTransaction();
        scheduleNext();
      }, delay);
    };

    const timeoutId = scheduleNext();

    return () => clearTimeout(timeoutId);
  }, [generateNewTransaction]);

  const getTimeAgo = useCallback((date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }, []);

  return {
    transactions,
    getTimeAgo,
  };
}
