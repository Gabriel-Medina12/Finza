import React, { useState, useEffect } from 'react';
import { ratesService } from '../services/rates';

export default function Transfers({ accounts, onSaveTransfer, onBack }) {
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amountSource, setAmountSource] = useState('');
  
  const [rateOverride, setRateOverride] = useState(false);
  const [customRate, setCustomRate] = useState('');
  const [calculatedDestAmount, setCalculatedDestAmount] = useState(0);
  const [commission, setCommission] = useState(0);

  // Custom dropdown toggles
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const sourceAccount = accounts.find(a => a.id === fromAccountId);
  const destAccount = accounts.find(a => a.id === toAccountId);

  useEffect(() => {
    if (accounts.length > 1) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
    }
  }, [accounts]);

  const rates = ratesService.getRates();
  const officialRate = sourceAccount && destAccount
    ? rates[sourceAccount.currency] / rates[destAccount.currency]
    : 1;

  const currentRate = rateOverride && customRate ? Number(customRate) : officialRate;

  useEffect(() => {
    if (sourceAccount && destAccount && amountSource) {
      let calculated = 0;
      if (rateOverride && customRate) {
        if (sourceAccount.currency === 'VES' && destAccount.currency === 'USDT') {
          calculated = Number(amountSource) / Number(customRate);
        } else {
          calculated = Number(amountSource) * Number(customRate);
        }
      } else {
        calculated = ratesService.convert(amountSource, sourceAccount.currency, destAccount.currency, rates);
      }
      setCalculatedDestAmount(Number(calculated.toFixed(2)));

      const isBankVES = sourceAccount.currency === 'VES';
      const comm = isBankVES ? ratesService.calculateCommission(Number(amountSource), sourceAccount, 'Transferencia') : 0;
      setCommission(comm);
    } else {
      setCalculatedDestAmount(0);
      setCommission(0);
    }
  }, [amountSource, fromAccountId, toAccountId, rateOverride, customRate, officialRate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amountSource || Number(amountSource) <= 0) return;
    if (fromAccountId === toAccountId) return;

    onSaveTransfer({
      fromAccountId,
      toAccountId,
      amountSource: Number(amountSource),
      amountDest: calculatedDestAmount,
      commissionSource: commission,
      rateUsed: currentRate,
      isCustomRate: rateOverride
    });

    setAmountSource('');
    setCustomRate('');
    setRateOverride(false);
  };

  return (
    <div className="max-w-md mx-auto py-md flex flex-col gap-sm pb-12">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-headline-sm text-lg text-on-surface font-semibold">Transferir Fondos</h3>
        <button onClick={onBack} className="text-sm text-primary flex items-center gap-1 active-shrink">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Origen Custom Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Origen</label>
            <button
              type="button"
              onClick={() => {
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}
              className="w-full bg-surface-container-low text-white py-3 px-3 rounded-xl border border-white/10 outline-none focus:border-primary flex justify-between items-center text-xs transition-all active-shrink"
            >
              <span className="font-semibold truncate">
                {sourceAccount ? `${sourceAccount.name} (${sourceAccount.currency})` : 'Seleccionar...'}
              </span>
              <span 
                className="material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200"
                style={{ transform: showFromDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>
            
            {showFromDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFromDropdown(false)} />
                <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setFromAccountId(acc.id);
                        setShowFromDropdown(false);
                      }}
                      className={`w-full text-left py-2.5 px-3.5 text-xs font-semibold block transition-all ${
                        fromAccountId === acc.id 
                          ? 'bg-primary/20 text-primary border-l-2 border-primary' 
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {acc.name} ({acc.currency})
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Destino Custom Dropdown */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Destino</label>
            <button
              type="button"
              onClick={() => {
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}
              className="w-full bg-surface-container-low text-white py-3 px-3 rounded-xl border border-white/10 outline-none focus:border-primary flex justify-between items-center text-xs transition-all active-shrink"
            >
              <span className="font-semibold truncate">
                {destAccount ? `${destAccount.name} (${destAccount.currency})` : 'Seleccionar...'}
              </span>
              <span 
                className="material-symbols-outlined text-on-surface-variant text-base transition-transform duration-200"
                style={{ transform: showToDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_more
              </span>
            </button>
            
            {showToDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowToDropdown(false)} />
                <div className="absolute top-[100%] left-0 right-0 mt-2 bg-[#0e1726]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      disabled={acc.id === fromAccountId}
                      onClick={() => {
                        setToAccountId(acc.id);
                        setShowToDropdown(false);
                      }}
                      className={`w-full text-left py-2.5 px-3.5 text-xs font-semibold block transition-all disabled:opacity-30 disabled:hover:bg-transparent ${
                        toAccountId === acc.id 
                          ? 'bg-primary/20 text-primary border-l-2 border-primary' 
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {acc.name} ({acc.currency})
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold">Monto a Enviar</label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amountSource}
              onChange={(e) => setAmountSource(e.target.value)}
              className="w-full bg-surface-container-low text-white py-3.5 px-4 rounded-xl border border-white/10 outline-none focus:border-primary transition-all text-sm pr-12 font-semibold"
            />
            <span className="absolute right-4 top-3.5 text-on-surface-variant font-bold text-sm">
              {sourceAccount?.currency}
            </span>
          </div>
        </div>

        {sourceAccount && destAccount && sourceAccount.currency !== destAccount.currency && (
          <div className="p-4 rounded-xl border border-white/5 bg-surface-container-high/30 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Puente Cambiario</span>
              <span className="text-primary font-semibold">
                Tasa Oficial: {officialRate.toFixed(4)} {destAccount.currency}/{sourceAccount.currency}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <label className="text-xs font-semibold text-white">¿Tasa Personalizada (P2P / Efectivo)?</label>
              <input
                type="checkbox"
                checked={rateOverride}
                onChange={(e) => {
                  setRateOverride(e.target.checked);
                  if (!e.target.checked) setCustomRate('');
                }}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
            </div>

            {rateOverride && (
              <div className="flex flex-col gap-1.5 mt-1">
                <input
                  type="number"
                  step="any"
                  placeholder="Ej: 44.50"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full bg-surface-container-lowest text-white py-2.5 px-3 rounded-lg border border-white/10 outline-none focus:border-primary text-xs"
                />
              </div>
            )}

            <div className="border-t border-white/5 pt-2 mt-1 flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Destinatario recibe:</span>
              <span className="text-sm font-bold text-white">
                {calculatedDestAmount.toLocaleString('es-ES')} {destAccount.currency}
              </span>
            </div>
          </div>
        )}

        {commission > 0 && (
          <div className="text-[11px] text-on-surface-variant p-3 bg-surface-container-lowest rounded-lg border border-white/5">
            Comisión bancaria de envío: +{commission.toLocaleString('es-ES')} {sourceAccount?.currency}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 mt-2 bg-primary-container text-white font-bold rounded-xl shadow-lg active-shrink hover:bg-primary-container/95 transition-all text-sm"
        >
          Confirmar Transferencia
        </button>
      </form>
    </div>
  );
}
