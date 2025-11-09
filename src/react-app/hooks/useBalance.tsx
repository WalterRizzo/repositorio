import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface BalanceContextType {
  balance: number;
  currency: string;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('ARS');

  const refreshBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me/balance');
      const data = await response.json();
      setBalance(data.balance || 0);
      setCurrency(data.currency || 'ARS');
    } catch (error) {
      console.error('Error al cargar saldo:', error);
    }
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return (
    <BalanceContext.Provider value={{ balance, currency, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}