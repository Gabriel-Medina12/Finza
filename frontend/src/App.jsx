import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { ratesService } from './services/rates';
import { supabase } from './services/supabase';
import Logo from './components/Logo';

import Dashboard from './views/Dashboard';
import ExpressForm from './views/ExpressForm';
import Transfers from './views/Transfers';
import Scanner from './views/Scanner';
import RatesSettings from './views/RatesSettings';
import Stats from './views/Stats';
import Login from './views/Login';


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem('finza_user');
    return cached ? JSON.parse(cached) : null;
  });
  
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeRates, setActiveRates] = useState(ratesService.getRates());

  // Escuchar cambios de autenticación de Supabase (Login, Registro, Redirección OAuth de Google)
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = {
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          avatarUrl: session.user.user_metadata?.avatar_url || null
        };
        setUser(u);
        sessionStorage.setItem('finza_user', JSON.stringify(u));
      } else {
        setUser(null);
        sessionStorage.removeItem('finza_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // 1. Sincronizar tasas de cambio reales
      const syncedRates = await ratesService.syncRates();
      setActiveRates(syncedRates);

      // 2. Cargar datos de la BD
      setAccounts(await db.getAccounts());
      setTransactions(await db.getTransactions());
      setCategories(await db.getCategories());
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  const handleSyncRates = async () => {
    const updated = await ratesService.syncRates();
    setActiveRates(updated);
  };

  const handleSaveTransaction = async (tx) => {
    const newTx = await db.addTransaction(tx);
    if (newTx) {
      setTransactions(await db.getTransactions());
      setAccounts(await db.getAccounts());
      setActiveTab('dashboard');
    }
  };

  const handleSaveTransfer = async (transfer) => {
    const newTx = await db.addTransfer(transfer);
    if (newTx) {
      setTransactions(await db.getTransactions());
      setAccounts(await db.getAccounts());
      setActiveTab('dashboard');
    }
  };

  const handleScanSuccess = async (scanResult) => {
    await handleSaveTransaction({
      description: scanResult.description,
      amount: scanResult.amount,
      currency: scanResult.currency,
      type: 'Gasto',
      accountId: accounts[0]?.id,
      categoryId: scanResult.categoryId,
      commission: 0
    });
  };

  const handleSaveAccount = async (newAcc) => {
    const acc = await db.addAccount(newAcc);
    if (acc) {
      setAccounts(await db.getAccounts());
    }
  };

  const handleSaveCategory = async (newCat) => {
    const cat = await db.addCategory(newCat);
    if (cat) {
      setCategories(await db.getCategories());
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            accounts={accounts} 
            transactions={transactions} 
            categories={categories}
            activeRates={activeRates}
            onNavigateToAdd={() => setActiveTab('add')}
          />
        );
      case 'add':
        return (
          <ExpressForm 
            accounts={accounts} 
            categories={categories} 
            onSaveTransaction={handleSaveTransaction}
            onSwitchToTransfer={() => setActiveTab('transfer')}
            onSaveCategory={handleSaveCategory}
          />
        );
      case 'transfer':
        return (
          <Transfers 
            accounts={accounts} 
            onSaveTransfer={handleSaveTransfer}
            onBack={() => setActiveTab('add')}
          />
        );
      case 'scanner':
        return (
          <Scanner 
            onScanSuccess={handleScanSuccess} 
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'rates':
        return (
          <RatesSettings 
            accounts={accounts} 
            categories={categories} 
            activeRates={activeRates}
            onSyncRates={handleSyncRates}
            onSaveAccount={handleSaveAccount}
            onSaveCategory={handleSaveCategory}
          />
        );
      case 'stats':
        return (
          <Stats 
            transactions={transactions} 
            categories={categories}
          />
        );
      default:
        return <div className="text-center py-10">Vista no encontrada</div>;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: 'home' },
    { id: 'add', label: 'Registrar', icon: 'add_circle' },
    { id: 'scanner', label: 'Escáner', icon: 'qr_code_scanner' },
    { id: 'rates', label: 'Ajustes', icon: 'settings' },
    { id: 'stats', label: 'Reportes', icon: 'equalizer' },
  ];

  if (!user) {
    return <Login onLoginSuccess={(u) => { setUser(u); sessionStorage.setItem('finza_user', JSON.stringify(u)); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-finza-bg text-on-surface">
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-white/5 p-6 justify-between shrink-0">

        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white">Finza</span>
          </div>

          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all active-shrink ${
                  activeTab === item.id || (activeTab === 'transfer' && item.id === 'add')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 p-2 bg-surface-container-low rounded-xl border border-white/5">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center font-bold text-white text-xs uppercase">
            {user ? user.fullName[0] : 'U'}
          </div>
          <div>
            <div className="text-xs font-semibold text-white truncate max-w-[120px]">
              {user ? user.fullName : 'Usuario Local'}
            </div>
            <div className="text-[10px] text-on-surface-variant flex justify-between items-center w-full">
              <span>
                {supabase ? 'En Línea' : 'Modo Offline'} (${accounts.reduce((sum, acc) => sum + ratesService.convert(acc.balance, acc.currency, 'USD', activeRates), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
              <button 
                onClick={() => {
                  setUser(null);
                  sessionStorage.removeItem('finza_user');
                  if (supabase) supabase.auth.signOut();
                }}
                className="text-primary hover:underline font-bold text-[9px] ml-2 active-shrink"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </aside>


      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-surface/80 backdrop-blur-xl fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 border-b border-white/5 md:hidden">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="text-lg font-bold text-white tracking-tight">Finza</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSyncRates}
              className="text-on-surface-variant hover:text-primary flex items-center active-shrink"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-20 pb-24 md:py-8 max-w-4xl mx-auto w-full">
          {renderView()}
        </main>

        <nav className="bg-surface/90 backdrop-blur-xl fixed bottom-0 w-full z-40 rounded-t-2xl border-t border-white/5 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] flex justify-around items-center px-2 py-3 pb-6 md:hidden">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id || (activeTab === 'transfer' && item.id === 'add');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 py-1.5 rounded-xl transition-all active-shrink ${
                  isActive
                    ? 'text-primary font-bold bg-primary/10'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xl" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
