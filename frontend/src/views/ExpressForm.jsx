import React, { useState, useEffect } from 'react';
import NumericKeyboard from '../components/NumericKeyboard';
import { ratesService } from '../services/rates';

export default function ExpressForm({ accounts, categories, onSaveTransaction, onSwitchToTransfer, onSaveCategory }) {
  const [txType, setTxType] = useState('Gasto');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Ninguno');
  const [commission, setCommission] = useState(0);

  // Estados para agregar categoría en caliente
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Toggles para dropdowns custom
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);



  const activeAccount = accounts.find(a => a.id === accountId);

  useEffect(() => {
    if (accounts.length > 0) {
      setAccountId(accounts[0].id);
      setSelectedCurrency(accounts[0].currency);
    }
    const filteredCats = categories.filter(c => txType === 'Gasto' ? !c.isIncome : c.isIncome);
    if (filteredCats.length > 0) {
      setCategoryId(filteredCats[0].id);
    }
  }, [accounts, categories, txType]);

  const handleAccountChange = (id) => {
    setAccountId(id);
    const acc = accounts.find(a => a.id === id);
    if (acc) {
      setSelectedCurrency(acc.currency);
    }
  };

  useEffect(() => {
    if (activeAccount && amount) {
      const comm = ratesService.calculateCommission(Number(amount), activeAccount, paymentMethod);
      setCommission(comm);
    } else {
      setCommission(0);
    }
  }, [amount, activeAccount, paymentMethod]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (!accountId || !categoryId) return;

    onSaveTransaction({
      description: description || (txType === 'Gasto' ? 'Gasto Express' : 'Ingreso Express'),
      amount: Number(amount),
      currency: selectedCurrency,
      type: txType,
      accountId,
      categoryId,
      commission,
      commissionType: paymentMethod !== 'Ninguno' ? paymentMethod : null
    });

    setAmount('');
    setDescription('');
    setPaymentMethod('Ninguno');
  };

  const getPaymentMethods = () => {
    if (!activeAccount) return ['Ninguno'];
    if (activeAccount.currency === 'VES') {
      return ['Ninguno', 'Pago Móvil', 'Transferencia', 'Punto de Venta'];
    }
    if (activeAccount.id.includes('binance')) {
      return ['Ninguno', 'Red (TRC20)', 'P2P'];
    }
    return ['Ninguno'];
  };

  const filteredCategories = categories.filter(c => txType === 'Gasto' ? !c.isIncome : c.isIncome);

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-sm pb-12">
      <div className="flex bg-surface-container-high rounded-full p-1 border border-white/5 select-none">
        {['Gasto', 'Ingreso', 'Transferencia'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              if (type === 'Transferencia') {
                onSwitchToTransfer();
              } else {
                setTxType(type);
              }
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-sm transition-all active-shrink ${
              (type === 'Transferencia' ? false : txType === type)
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center p-md glass-card rounded-2xl relative overflow-hidden">
          <label className="text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Monto</label>
          <div className="flex items-center gap-2 justify-center w-full">
            <div className="text-4xl font-bold text-white tracking-tight min-h-[48px] flex items-center justify-center">
              {amount || '0.00'}
            </div>
            
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-surface-container-high text-primary font-semibold py-1 px-3 rounded-lg border border-white/10 text-lg outline-none cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="VES">VES</option>
              <option value="EUR">EUR</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Cuenta</label>
          <button
            type="button"
            onClick={() => {
              setShowAccountDropdown(!showAccountDropdown);
              setShowCategoryDropdown(false);
            }}
            className="w-full bg-surface-container-low text-white py-3 px-4 rounded-xl border border-white/10 outline-none focus:border-primary flex justify-between items-center text-sm transition-all active-shrink"
          >
            <span className="font-medium">
              {activeAccount 
                ? `${activeAccount.name} (${activeAccount.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} ${activeAccount.currency})` 
                : 'Seleccionar Cuenta'}
            </span>
            <span 
              className="material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200"
              style={{ transform: showAccountDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>
          
          {showAccountDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAccountDropdown(false)} />
              <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      handleAccountChange(acc.id);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full text-left py-3 px-4 text-xs font-semibold flex justify-between items-center transition-all ${
                      accountId === acc.id 
                        ? 'bg-primary/20 text-primary border-l-2 border-primary' 
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{acc.name}</span>
                    <span className="text-on-surface-variant">
                      {acc.balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })} {acc.currency}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {txType === 'Gasto' && getPaymentMethods().length > 1 && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-surface-container-lowest">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Método de Pago</label>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
              {getPaymentMethods().map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    paymentMethod === method
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-container-high text-on-surface-variant border border-white/5 hover:text-white'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {commission > 0 && (
              <div className="text-[11px] text-primary mt-1 font-medium bg-primary/5 p-2 rounded-lg border border-primary/10">
                Comisión: +{commission.toLocaleString('es-ES')} {activeAccount?.currency}
                <span className="text-on-surface-variant block mt-0.5">
                  Se debitará un total de: {(Number(amount) + commission).toLocaleString('es-ES')} {activeAccount?.currency}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Categoría</label>
            {isAddingCategory ? (
              <div className="relative flex items-center w-full">
                <input
                  type="text"
                  placeholder="Nueva..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-surface-container-low text-white py-3 pl-3 pr-20 rounded-xl border border-white/10 outline-none text-xs focus:border-primary"
                  required
                  autoFocus
                />
                <div className="absolute right-1.5 flex gap-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCategoryName) return;
                      const saved = await onSaveCategory({
                        name: newCategoryName,
                        isIncome: txType === 'Ingreso',
                        icon: txType === 'Ingreso' ? 'add_card' : 'payments',
                        color: txType === 'Ingreso' ? '#10B981' : '#3B82F6'
                      });
                      if (saved) {
                        setCategoryId(saved.id);
                      }
                      setNewCategoryName('');
                      setIsAddingCategory(false);
                    }}
                    className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-all active-shrink"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all active-shrink"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowAccountDropdown(false);
                  }}
                  className="w-full bg-surface-container-low text-white py-3 px-3 rounded-xl border border-white/10 outline-none focus:border-primary flex justify-between items-center text-xs transition-all active-shrink"
                >
                  <span className="font-semibold truncate">
                    {categories.find(c => c.id === categoryId)?.name || 'Seleccionar...'}
                  </span>
                  <span 
                    className="material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200"
                    style={{ transform: showCategoryDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                </button>
                
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCategoryDropdown(false)} />
                    <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in max-h-40 overflow-y-auto custom-scrollbar">
                      {filteredCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left py-2.5 px-3.5 text-xs font-semibold block transition-all ${
                            categoryId === cat.id 
                              ? 'bg-primary/20 text-primary border-l-2 border-primary' 
                              : 'text-white hover:bg-white/5'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(true);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full text-left py-2.5 px-3.5 text-xs text-primary font-bold hover:bg-white/5 border-t border-white/5 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Crear Categoría
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Detalle/Comercio</label>
            <input
              type="text"
              placeholder="Ej: Farmatodo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low text-white py-3 px-4 rounded-xl border border-white/10 outline-none focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <NumericKeyboard 
          value={amount} 
          onChange={setAmount} 
          onClear={() => setAmount('')}
        />

        <button
          type="submit"
          className="w-full py-4 mt-2 bg-primary-container text-white font-bold rounded-xl shadow-lg active-shrink hover:bg-primary-container/95 transition-all text-sm"
        >
          Guardar Transacción
        </button>
      </form>
    </div>
  );
}
