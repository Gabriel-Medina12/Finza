import React, { useState } from 'react';
import { ratesService } from '../services/rates';

export default function Stats({ transactions, categories, activeRates }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openCategory, setOpenCategory] = useState(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Filtrar transacciones del mes
  const monthlyTransactions = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Calcular totales convertidos a USD de forma real
  const totalIncomeUSD = monthlyTransactions
    .filter(tx => tx.type === 'Ingreso')
    .reduce((sum, tx) => sum + ratesService.convert(tx.amount, tx.currency, 'USD', activeRates), 0);

  const totalExpenseUSD = monthlyTransactions
    .filter(tx => tx.type === 'Gasto')
    .reduce((sum, tx) => sum + ratesService.convert(tx.amount, tx.currency, 'USD', activeRates), 0);

  const netBalanceUSD = totalIncomeUSD - totalExpenseUSD;

  const totalCombined = totalIncomeUSD + totalExpenseUSD;
  const incomePercentage = totalCombined > 0 ? (totalIncomeUSD / totalCombined) * 100 : 50;
  const expensePercentage = totalCombined > 0 ? (totalExpenseUSD / totalCombined) * 100 : 50;

  // Agrupar por categoría sumando en USD
  const categorySummary = categories.reduce((acc, cat) => {
    const txs = monthlyTransactions.filter(tx => tx.categoryId === cat.id);
    const totalUSD = txs.reduce((sum, tx) => sum + ratesService.convert(tx.amount, tx.currency, 'USD', activeRates), 0);
    
    if (totalUSD > 0) {
      acc.push({
        category: cat,
        totalUSD,
        transactions: txs
      });
    }
    return acc;
  }, []).sort((a, b) => b.totalUSD - a.totalUSD);

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-sm pb-12 select-none">
      
      {/* Month Selector */}
      <div className="flex justify-between items-center bg-surface-container-high/40 p-3 rounded-xl border border-white/5">
        <button onClick={handlePrevMonth} className="text-primary font-bold active-shrink text-lg">
          <span className="material-symbols-outlined text-[20px] font-bold">chevron_left</span>
        </button>
        <span className="text-sm font-bold text-white uppercase tracking-wider">
          {months[selectedMonth]} {selectedYear}
        </span>
        <button onClick={handleNextMonth} className="text-primary font-bold active-shrink text-lg">
          <span className="material-symbols-outlined text-[20px] font-bold">chevron_right</span>
        </button>
      </div>

      {monthlyTransactions.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-on-surface-variant text-sm border border-white/5">
          No hay movimientos registrados en este mes.
        </div>
      ) : (
        <>
          {/* Executive Summary Card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 border border-white/5">
            <div className="flex justify-around items-center text-center">
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Ingresos</span>
                <span className="block text-base font-bold text-emerald-400 mt-1">
                  +${totalIncomeUSD.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[9px] text-on-surface-variant mt-0.5">
                  ≈ {ratesService.convert(totalIncomeUSD, 'USD', 'VES', activeRates).toLocaleString('es-ES', { maximumFractionDigits: 0 })} VES
                </span>
              </div>
              
              <div className="h-8 w-px bg-white/10" />
              
              <div>
                <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Gastos</span>
                <span className="block text-base font-bold text-rose-400 mt-1">
                  -${totalExpenseUSD.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[9px] text-on-surface-variant mt-0.5">
                  ≈ {ratesService.convert(totalExpenseUSD, 'USD', 'VES', activeRates).toLocaleString('es-ES', { maximumFractionDigits: 0 })} VES
                </span>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${incomePercentage}%` }}
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${expensePercentage}%` }}
              />
            </div>
            
            {/* Consolidated Net Balance */}
            <div className="text-center pt-2 border-t border-white/5">
              <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider block">Balance Neto</span>
              <span className={`text-xl font-black mt-1 block ${netBalanceUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netBalanceUSD >= 0 ? '+' : '-'}${Math.abs(netBalanceUSD).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-0.5">
                ≈ {ratesService.convert(netBalanceUSD, 'USD', 'VES', activeRates).toLocaleString('es-ES', { maximumFractionDigits: 0 })} VES
              </span>
            </div>
          </div>

          {/* Grouped Category Breakdown */}
          <div className="flex flex-col gap-2">
            {categorySummary.map(({ category, totalUSD, transactions: catTxs }) => {
              const isOpen = openCategory === category.id;
              const isIncome = category.isIncome;

              return (
                <div key={category.id} className="glass-card rounded-xl overflow-hidden border border-white/5">
                  <div
                    onClick={() => setOpenCategory(isOpen ? null : category.id)}
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg" style={{ color: category.color }}>
                        {category.icon}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-white block">{category.name}</span>
                        <span className="text-[9px] text-on-surface-variant">
                          {isIncome ? 'Ingreso' : 'Gasto'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`text-xs font-bold block ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}${totalUSD.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] text-on-surface-variant block">
                          ≈ {ratesService.convert(totalUSD, 'USD', 'VES', activeRates).toLocaleString('es-ES', { maximumFractionDigits: 0 })} VES
                        </span>
                      </div>
                      <span className={`material-symbols-outlined text-xs text-on-surface-variant transform transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 bg-[#151D2A] border-t border-white/5 flex flex-col gap-2">
                      {catTxs.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                          <span className="text-on-surface-variant font-medium">{tx.description}</span>
                          <div className="text-right">
                            <span className="font-semibold text-white block">
                              {tx.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {tx.currency}
                            </span>
                            <span className="text-[9px] text-on-surface-variant block mt-0.5">
                              ≈ {isIncome ? '+' : '-'}${ratesService.convert(tx.amount, tx.currency, 'USD', activeRates).toLocaleString('es-ES', { minimumFractionDigits: 2 })} USD
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
