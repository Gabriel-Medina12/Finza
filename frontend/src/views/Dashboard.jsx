import React, { useState } from 'react';
import AccountCard from '../components/AccountCard';
import { ratesService } from '../services/rates';

export default function Dashboard({ accounts, transactions, categories, activeRates, onNavigateToAdd }) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const totalNetWorth = accounts.reduce((acc, account) => {
    const accountInSelected = ratesService.convert(account.balance, account.currency, selectedCurrency, activeRates);
    return acc + accountInSelected;
  }, 0);

  const getCurrencySymbol = (cur) => {
    switch (cur) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'VES': return 'Bs. ';
      case 'USDT': return '₮ ';
      default: return '';
    }
  };

  const getCategoryDetails = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Otros', icon: 'payments', color: '#6B7280' };
  };

  const getAccountName = (accId) => {
    return accounts.find(a => a.id === accId)?.name || 'Cuenta Externa';
  };

  return (
    <div className="flex flex-col gap-xl">
      <section className="flex flex-col items-center justify-center text-center pt-md select-none">
        <h2 className="font-body-md text-on-surface-variant mb-xs uppercase tracking-widest text-xs font-semibold">
          Patrimonio Consolidado
        </h2>
        <div className="font-display-lg-mobile md:font-display-lg text-primary-container mb-md drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold text-4xl md:text-5xl transition-all">
          {getCurrencySymbol(selectedCurrency)}
          {totalNetWorth.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        
        <div className="flex bg-surface-container-high rounded-full p-1 border border-white/5">
          {['USD', 'VES', 'EUR', 'USDT'].map((cur) => (
            <button
              key={cur}
              onClick={() => setSelectedCurrency(cur)}
              className={`px-5 py-2 rounded-full font-semibold text-xs transition-all active-shrink ${
                selectedCurrency === cur
                  ? 'bg-primary-container text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </section>

      <section className="w-full">
        <div className="flex justify-between items-end mb-sm px-1">
          <h3 className="font-headline-sm text-lg text-on-surface font-semibold">Cuentas</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
          {accounts.map((account) => (
            <AccountCard 
              key={account.id} 
              account={account} 
              activeRates={activeRates}
              onClick={onNavigateToAdd}
            />
          ))}
        </div>
      </section>

      <section className="glass-card rounded-xl p-0 overflow-hidden mb-8">
        <div className="p-md border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
          <h3 className="font-headline-sm text-md text-on-surface font-semibold">Movimientos del Mes</h3>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
            filter_list
          </span>
        </div>
        
        <div className="flex flex-col">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No hay transacciones registradas este mes.
            </div>
          ) : (
            transactions.map((tx, idx) => {
              const cat = getCategoryDetails(tx.categoryId);
              const isExpense = tx.type === 'Gasto';
              const isTransfer = tx.type === 'Transferencia';

              const showDateHeader = idx === 0 || 
                new Date(tx.date).toLocaleDateString() !== new Date(transactions[idx - 1].date).toLocaleDateString();

              return (
                <div key={tx.id}>
                  {showDateHeader && (
                    <div className="px-md py-1.5 bg-surface-container-high/30 border-b border-white/5">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        {new Date(tx.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-md border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <span className="material-symbols-outlined text-xl" style={{ color: cat.color }}>
                          {cat.icon}
                        </span>
                      </div>
                      <div>
                        <div className="font-body-md font-semibold text-white text-sm">{tx.description}</div>
                        <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">account_balance_wallet</span>
                          {getAccountName(tx.accountId)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-body-md font-semibold text-sm ${
                        isTransfer 
                          ? 'text-on-surface-variant' 
                          : isExpense 
                            ? 'text-error' 
                            : 'text-primary'
                      }`}>
                        {isTransfer ? '⇄' : isExpense ? '-' : '+'}
                        {tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {tx.currency}
                      </div>
                      {tx.commission > 0 && (
                        <div className="text-[10px] text-on-surface-variant mt-0.5">
                          +Com: {tx.commission.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {tx.currency}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
