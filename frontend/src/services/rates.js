const DEFAULT_RATES = {
  USD: 1.0,
  VES: 45.00,
  EUR: 0.92,
  USDT: 1.002,
};

export const ratesService = {
  getRates: () => {
    const cached = localStorage.getItem('finza_rates');
    if (!cached) {
      localStorage.setItem('finza_rates', JSON.stringify(DEFAULT_RATES));
      return DEFAULT_RATES;
    }
    return JSON.parse(cached);
  },

  syncRates: async () => {
    try {
      // 1. Dólar Oficial BCV
      const resDolar = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const dataDolar = await resDolar.json();
      
      // 2. Euro Oficial BCV
      const resEuro = await fetch('https://ve.dolarapi.com/v1/euros/oficial');
      const dataEuro = await resEuro.json();

      // 3. Dólar Cripto (USDT P2P)
      const resCripto = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo');
      const dataCripto = await resCripto.json();

      const updated = {
        USD: 1.0,
        VES: Number(dataDolar.promedio || 45.00),
        EUR: Number((dataDolar.promedio / dataEuro.promedio).toFixed(4)) || 0.92,
        USDT: Number((dataDolar.promedio / dataCripto.promedio).toFixed(4)) || 0.976
      };
      
      localStorage.setItem('finza_rates', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Error sincronizando tasas de cambio:", e);
      return ratesService.getRates(); // retorno seguro en caso de error
    }
  },

  convert: (amount, fromCurrency, toCurrency, customRates = null) => {
    const rates = customRates || ratesService.getRates();
    const amountInUSD = Number(amount) / rates[fromCurrency];
    return Number((amountInUSD * rates[toCurrency]).toFixed(2));
  },

  calculateCommission: (amount, account, method) => {
    if (!account) return 0;
    
    if (account.currency === 'VES') {
      if (method === 'Pago Móvil') {
        return Number((amount * 0.003).toFixed(2));
      }
      if (method === 'Transferencia') {
        return 0.50;
      }
    }

    if (account.id.includes('binance')) {
      if (method === 'Red (TRC20)') {
        return 1.00;
      }
      if (method === 'P2P') {
        return Number((amount * 0.005).toFixed(2));
      }
    }

    return 0;
  }
};
