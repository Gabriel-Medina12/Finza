import React, { useState } from 'react';

export default function Stats({ transactions, categories }) {
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

  const monthlyExpenses = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === selectedMonth && 
           d.getFullYear() === selectedYear && 
           tx.type === 'Gasto';
  });

  const totalExpenseAmount = monthlyExpenses.reduce((acc, tx) => acc + tx.amount, 0);

  const categorySummary = categories.reduce((acc, cat) => {
    if (cat.isIncome) return acc;
    const txs = monthlyExpenses.filter(tx => tx.categoryId === cat.id);
    const total = txs.reduce((sum, tx) => sum + tx.amount, 0);
    
    if (total > 0) {
      acc.push({
        category: cat,
        total,
        percentage: Number(((total / totalExpenseAmount) * 100).toFixed(1)),
        transactions: txs
      });
    }
    return acc;
  }, []).sort((a, b) => b.total - a.total);

  let accumulatedPercent = 0;
  const donutSegments = categorySummary.map(item => {
    const start = accumulatedPercent;
    accumulatedPercent += item.percentage;
    return {
      ...item,
      start,
      end: accumulatedPercent
    };
  });

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-sm pb-12 select-none">
      
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

      {monthlyExpenses.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-on-surface-variant text-sm border border-white/5">
          No hay gastos registrados en este mes.
        </div>
      ) : (
        <>
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative border border-white/5">
            <svg width="200" height="200" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1E293B" strokeWidth="4.5"></circle>
              {donutSegments.map((seg, idx) => {
                const strokeDasharray = `${seg.percentage} ${100 - seg.percentage}`;
                const strokeDashoffset = 100 - seg.start;
                return (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={seg.category.color}
                    strokeWidth="4.5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  ></circle>
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Gastos Totales</span>
              <span className="text-xl font-bold text-white mt-0.5">
                ${totalExpenseAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {categorySummary.map(({ category, total, percentage, transactions: catTxs }) => {
              const isOpen = openCategory === category.id;

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
                      <span className="text-xs font-semibold text-white">{category.name}</span>
                      <span className="text-[10px] text-on-surface-variant">({percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">${total.toLocaleString('es-ES')}</span>
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
                            <span className="font-semibold text-white">${tx.amount.toLocaleString()} {tx.currency}</span>
                            <span className="block text-[9px] text-on-surface-variant mt-0.5">
                              {new Date(tx.date).toLocaleDateString()}
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
