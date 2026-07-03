import React, { useState } from 'react';
import { ratesService } from '../services/rates';

export default function RatesSettings({ 
  accounts, 
  categories, 
  activeRates, 
  onSyncRates, 
  onSaveAccount, 
  onDeleteAccount,
  onSaveCategory 
}) {
  const [calcSource, setCalcSource] = useState('VES');
  const [calcDest, setCalcDest] = useState('USD');
  const [sourceAmount, setSourceAmount] = useState('');
  const [destAmount, setDestAmount] = useState('');

  const [syncing, setSyncing] = useState(false);

  // Toggles para dropdowns de calculadora
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Toggles para creación de cuenta
  const [showNewAccTypeDropdown, setShowNewAccTypeDropdown] = useState(false);
  const [showNewAccCurrencyDropdown, setShowNewAccCurrencyDropdown] = useState(false);



  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Bank');
  const [newAccCurrency, setNewAccCurrency] = useState('VES');
  const [newAccBalance, setNewAccBalance] = useState('');

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('payments');

  const handleSourceAmountChange = (val) => {
    setSourceAmount(val);
    if (val === '') {
      setDestAmount('');
      return;
    }
    const converted = ratesService.convert(val, calcSource, calcDest, activeRates);
    setDestAmount(converted.toString());
  };

  const handleDestAmountChange = (val) => {
    setDestAmount(val);
    if (val === '') {
      setSourceAmount('');
      return;
    }
    const converted = ratesService.convert(val, calcDest, calcSource, activeRates);
    setSourceAmount(converted.toString());
  };

  const handleSync = async () => {
    setSyncing(true);
    await onSyncRates();
    setSyncing(false);
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance) return;
    onSaveAccount({
      name: newAccName,
      type: newAccType,
      currency: newAccCurrency,
      balance: Number(newAccBalance)
    });
    setNewAccName('');
    setNewAccBalance('');
    setShowNewAccount(false);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;
    onSaveCategory({
      name: newCatName,
      icon: newCatIcon,
      color: '#10B981',
      isIncome: false
    });
    setNewCatName('');
    setShowNewCategory(false);
  };

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-lg pb-12 select-none">
      
      <section className="glass-card rounded-2xl p-4 flex flex-col gap-3 relative z-30">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-bold text-white">Tasas del Día (BCV / USDT)</h4>
            <p className="text-[10px] text-on-surface-variant">Sincronizado pasivamente desde APIs oficiales</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3.5 py-1.5 bg-primary/10 text-primary text-xs rounded-lg font-bold border border-primary/20 hover:bg-primary/20 transition-all active-shrink disabled:opacity-50"
          >
            {syncing ? 'Sincronizando...' : 'Actualizar'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-surface-container-high/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Dólar BCV</span>
            <span className="text-xs font-bold text-white mt-1 block">{activeRates.VES.toFixed(2)} Bs.</span>
          </div>
          <div className="bg-surface-container-high/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Euro BCV</span>
            <span className="text-xs font-bold text-white mt-1 block">{(activeRates.VES / activeRates.EUR).toFixed(2)} Bs.</span>
          </div>
          <div className="bg-surface-container-high/40 p-2.5 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Binance P2P</span>
            <span className="text-xs font-bold text-white mt-1 block">{(activeRates.VES / activeRates.USDT).toFixed(2)} Bs.</span>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-2xl p-4 flex flex-col gap-3 relative z-20">
        <h4 className="text-sm font-bold text-white">Calculadora Cambiaria Bidireccional</h4>
        
        <div className="flex flex-col gap-3">
          {/* Source Currency Select */}
          <div className="flex gap-2 items-center w-full">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowSourceDropdown(!showSourceDropdown);
                  setShowDestDropdown(false);
                }}
                className="bg-surface-container-low text-white text-xs font-bold py-2.5 px-3.5 rounded-lg border border-white/10 outline-none flex items-center gap-1.5 min-w-[75px] justify-between active-shrink"
              >
                <span>{calcSource}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {showSourceDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSourceDropdown(false)} />
                  <div className="absolute top-[100%] left-0 mt-1 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-fade-in w-20">
                    {['USD', 'VES', 'EUR', 'USDT'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCalcSource(c);
                          setSourceAmount('');
                          setDestAmount('');
                          setShowSourceDropdown(false);
                        }}
                        className={`w-full text-center py-2 text-xs font-semibold block hover:bg-white/5 ${
                          calcSource === c ? 'bg-primary/20 text-primary' : 'text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <input
              type="number"
              placeholder="0.00"
              value={sourceAmount}
              onChange={(e) => handleSourceAmountChange(e.target.value)}
              className="flex-1 bg-surface-container-low text-white text-sm py-2 px-3 rounded-lg border border-white/10 outline-none font-semibold focus:border-primary transition-all"
            />
          </div>

          {/* Dest Currency Select */}
          <div className="flex gap-2 items-center w-full">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowDestDropdown(!showDestDropdown);
                  setShowSourceDropdown(false);
                }}
                className="bg-surface-container-low text-white text-xs font-bold py-2.5 px-3.5 rounded-lg border border-white/10 outline-none flex items-center gap-1.5 min-w-[75px] justify-between active-shrink"
              >
                <span>{calcDest}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {showDestDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDestDropdown(false)} />
                  <div className="absolute top-[100%] left-0 mt-1 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-fade-in w-20">
                    {['USD', 'VES', 'EUR', 'USDT'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        disabled={c === calcSource}
                        onClick={() => {
                          setCalcDest(c);
                          setSourceAmount('');
                          setDestAmount('');
                          setShowDestDropdown(false);
                        }}
                        className={`w-full text-center py-2 text-xs font-semibold block hover:bg-white/5 disabled:opacity-30 ${
                          calcDest === c ? 'bg-primary/20 text-primary' : 'text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <input
              type="number"
              placeholder="0.00"
              value={destAmount}
              onChange={(e) => handleDestAmountChange(e.target.value)}
              className="flex-1 bg-surface-container-low text-white text-sm py-2 px-3 rounded-lg border border-white/10 outline-none font-semibold focus:border-primary transition-all"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 relative z-10">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-white">Configurar Cuentas</h4>
            <button 
              onClick={() => setShowNewAccount(!showNewAccount)}
              className="text-xs text-primary font-bold flex items-center gap-0.5 active-shrink"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Nueva
            </button>
          </div>

          {showNewAccount && (
            <form onSubmit={handleAddAccount} className="p-3 rounded-xl bg-surface-container-high/30 border border-white/5 flex flex-col gap-3 mb-3">
              <input
                type="text"
                placeholder="Nombre de Cuenta (Ej: BDV)"
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                className="w-full bg-surface-container-low text-white text-xs py-2 px-3 rounded-lg border border-white/10 outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                {/* Tipo de Cuenta Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAccTypeDropdown(!showNewAccTypeDropdown);
                      setShowNewAccCurrencyDropdown(false);
                    }}
                    className="w-full bg-surface-container-low text-white text-xs font-semibold py-2 px-3 rounded-lg border border-white/10 outline-none flex justify-between items-center active-shrink"
                  >
                    <span>
                      {newAccType === 'Bank' ? 'Banco' : newAccType === 'Crypto' ? 'Cripto' : 'Efectivo'}
                    </span>
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>

                  {showNewAccTypeDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNewAccTypeDropdown(false)} />
                      <div className="absolute top-[100%] left-0 right-0 mt-1 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-fade-in">
                        {[
                          { val: 'Bank', label: 'Banco' },
                          { val: 'Crypto', label: 'Cripto' },
                          { val: 'Cash', label: 'Efectivo' }
                        ].map((t) => (
                          <button
                            key={t.val}
                            type="button"
                            onClick={() => {
                              setNewAccType(t.val);
                              setShowNewAccTypeDropdown(false);
                            }}
                            className={`w-full text-left py-2 px-3 text-xs font-semibold block hover:bg-white/5 ${
                              newAccType === t.val ? 'bg-primary/20 text-primary' : 'text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Divisa Custom Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAccCurrencyDropdown(!showNewAccCurrencyDropdown);
                      setShowNewAccTypeDropdown(false);
                    }}
                    className="w-full bg-surface-container-low text-white text-xs font-semibold py-2 px-3 rounded-lg border border-white/10 outline-none flex justify-between items-center active-shrink"
                  >
                    <span>{newAccCurrency}</span>
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>

                  {showNewAccCurrencyDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNewAccCurrencyDropdown(false)} />
                      <div className="absolute top-[100%] left-0 right-0 mt-1 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50 animate-fade-in text-center">
                        {['VES', 'USD', 'EUR', 'USDT'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setNewAccCurrency(c);
                              setShowNewAccCurrencyDropdown(false);
                            }}
                            className={`w-full text-left py-2 px-3 text-xs font-semibold block hover:bg-white/5 ${
                              newAccCurrency === c ? 'bg-primary/20 text-primary' : 'text-white'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <input
                type="number"
                placeholder="Balance Inicial"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                className="w-full bg-surface-container-low text-white text-xs py-2 px-3 rounded-lg border border-white/10 outline-none"
                required
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-primary-container text-white text-xs font-bold rounded-lg"
              >
                Crear Cuenta
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto hide-scrollbar">
            {accounts.map(acc => (
              <div key={acc.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-surface-container-low/40 border border-white/5">
                <span className="font-semibold text-white">{acc.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant font-bold">{acc.balance.toLocaleString()} {acc.currency}</span>
                  <button 
                    onClick={() => {
                      if (window.confirm(`¿Estás seguro de eliminar la cuenta "${acc.name}"? Esto borrará la cuenta y todos sus movimientos asociados.`)) {
                        onDeleteAccount(acc.id);
                      }
                    }}
                    className="text-error hover:text-red-400 p-1 flex items-center active-shrink"
                    title="Eliminar Cuenta"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-white">Configurar Categorías</h4>
            <button 
              onClick={() => setShowNewCategory(!showNewCategory)}
              className="text-xs text-primary font-bold flex items-center gap-0.5 active-shrink"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Nueva
            </button>
          </div>

          {showNewCategory && (
            <form onSubmit={handleAddCategory} className="p-3 rounded-xl bg-surface-container-high/30 border border-white/5 flex flex-col gap-3 mb-3">
              <input
                type="text"
                placeholder="Nombre Categoría (Ej: Repuestos)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-surface-container-low text-white text-xs py-2 px-3 rounded-lg border border-white/10 outline-none"
                required
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-primary-container text-white text-xs font-bold rounded-lg"
              >
                Crear Categoría
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto hide-scrollbar">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low/40 border border-white/5 text-xs text-white">
                <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
