import React from 'react';
import { ratesService } from '../services/rates';

export default function AccountCard({ account, activeRates, onClick }) {
  const getIcon = (type) => {
    switch (type) {
      case 'Bank': return 'account_balance';
      case 'Crypto': return 'currency_bitcoin';
      case 'Cash': return 'payments';
      default: return 'credit_card';
    }
  };

  const getGradient = (type) => {
    switch (type) {
      case 'Bank': return 'from-primary-container/10 to-transparent';
      case 'Crypto': return 'from-[#FCD535]/10 to-transparent';
      case 'Cash': return 'from-primary/10 to-transparent';
      default: return 'from-white/5 to-transparent';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'Crypto': return 'text-[#FCD535]';
      case 'Bank': return 'text-primary';
      default: return 'text-primary';
    }
  };

  const usdReference = ratesService.convert(account.balance, account.currency, 'USD', activeRates);

  return (
    <div 
      onClick={onClick}
      className="glass-card min-w-[280px] p-md rounded-xl flex-shrink-0 snap-start relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all select-none hover-scale active-shrink"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(account.type)} opacity-50`}></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-lg">
          <span className="font-headline-sm text-headline-sm text-white font-semibold">{account.name}</span>
          <span className={`material-symbols-outlined ${getIconColor(account.type)}`}>
            {getIcon(account.type)}
          </span>
        </div>
        <div>
          <div className="font-headline-md text-headline-md text-white mb-1 font-bold">
            {account.balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {account.currency}
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            ≈ ${usdReference.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
        </div>
      </div>
    </div>
  );
}
