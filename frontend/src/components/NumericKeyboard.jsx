import React from 'react';

export default function NumericKeyboard({ value, onChange, onClear }) {
  const handlePress = (num) => {
    if (num === '.') {
      if (value.includes('.')) return;
      if (value === '') {
        onChange('0.');
        return;
      }
    }
    
    if (num === 'back') {
      if (value.length > 0) {
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (value.includes('.')) {
      const [, decimals] = value.split('.');
      if (decimals && decimals.length >= 2) return;
    }

    onChange(value + num);
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', 'back'
  ];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto mt-4">
      {buttons.map((btn) => (
        <button
          key={btn}
          onClick={() => handlePress(btn)}
          type="button"
          className="h-14 rounded-xl glass-card flex items-center justify-center text-xl font-bold text-white active:bg-primary/20 active:scale-95 duration-100 hover:border-primary/40 select-none"
        >
          {btn === 'back' ? (
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">backspace</span>
          ) : btn}
        </button>
      ))}
      <button
        onClick={onClear}
        type="button"
        className="col-span-3 h-10 rounded-lg bg-surface-container-high/50 border border-white/5 flex items-center justify-center text-sm font-semibold text-on-surface-variant active:bg-red-500/20 active:text-red-400 select-none mt-1"
      >
        Limpiar Monto
      </button>
    </div>
  );
}
