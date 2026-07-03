import { supabase } from './supabase';

const INITIAL_ACCOUNTS = [
  { id: 'banesco-ves', name: 'Banesco', type: 'Bank', balance: 45000.00, currency: 'VES' },
  { id: 'bdv-ves', name: 'Banco de Venezuela', type: 'Bank', balance: 2500.00, currency: 'VES' },
  { id: 'binance-usdt', name: 'Binance', type: 'Crypto', balance: 5420.50, currency: 'USDT' },
  { id: 'cash-usd', name: 'Cash $', type: 'Cash', balance: 840.00, currency: 'USD' },
  { id: 'cash-eur', name: 'Cash €', type: 'Cash', balance: 150.00, currency: 'EUR' }
];

const INITIAL_CATEGORIES = [
  { id: 'food', name: 'Comida', icon: 'restaurant', color: '#10B981' },
  { id: 'moto', name: 'Moto', icon: 'motorcycle', color: '#3B82F6' },
  { id: 'health', name: 'Salud', icon: 'local_pharmacy', color: '#EF4444' },
  { id: 'barber', name: 'Barbería', icon: 'content_cut', color: '#8B5CF6' },
  { id: 'gym', name: 'Gimnasio', icon: 'fitness_center', color: '#EC4899' },
  { id: 'rent', name: 'Alquiler', icon: 'home', color: '#F59E0B' },
  { id: 'salary', name: 'Sueldo', icon: 'work', color: '#10B981', isIncome: true },
  { id: 'sales', name: 'Ventas', icon: 'store', color: '#10B981', isIncome: true },
  { id: 'freelance', name: 'Freelance', icon: 'computer', color: '#3B82F6', isIncome: true },
  { id: 'invest', name: 'Inversiones', icon: 'show_chart', color: '#EC4899', isIncome: true },
  { id: 'other-income', name: 'Otros Ingresos', icon: 'add_card', color: '#F59E0B', isIncome: true }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 't-1',
    description: 'Farmatodo',
    amount: 450.00,
    currency: 'VES',
    type: 'Gasto',
    accountId: 'banesco-ves',
    categoryId: 'health',
    date: new Date().toISOString(),
    commission: 4.50,
    commissionType: 'Pago Móvil'
  },
  {
    id: 't-2',
    description: 'Sueldo Semanal',
    amount: 1200.00,
    currency: 'USDT',
    type: 'Ingreso',
    accountId: 'binance-usdt',
    categoryId: 'salary',
    date: new Date().toISOString(),
    commission: 0
  },
  {
    id: 't-3',
    description: 'Starbucks',
    amount: 5.50,
    currency: 'USD',
    type: 'Gasto',
    accountId: 'cash-usd',
    categoryId: 'food',
    date: new Date(Date.now() - 86400000).toISOString(),
    commission: 0
  }
];

const getLocalData = (key, fallback) => {
  const val = localStorage.getItem(`finza_${key}`);
  if (!val) {
    localStorage.setItem(`finza_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(val);
};

const setLocalData = (key, data) => {
  localStorage.setItem(`finza_${key}`, JSON.stringify(data));
};

export const db = {
  // Obtener Cuentas
  getAccounts: async () => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
        if (!error && data) {
          return data;
        }
      }
    }
    return getLocalData('accounts', INITIAL_ACCOUNTS);
  },

  saveAccounts: async (accounts) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // En Supabase el balance se actualiza por registro individual, no sobreescribiendo toda la tabla.
        return;
      }
    }
    setLocalData('accounts', accounts);
  },

  // Obtener Categorías
  getCategories: async () => {
    if (supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (!error && data && data.length > 0) {
        return data.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          isIncome: c.is_income
        }));
      }
    }
    return getLocalData('categories', INITIAL_CATEGORIES);
  },

  saveCategories: async (categories) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const seeded = categories.filter(c => !c.id.startsWith('cat-')).map(c => ({
          name: c.name,
          icon: c.icon,
          color: c.color,
          is_income: !!c.isIncome,
          user_id: user.id
        }));
        await supabase.from('categories').insert(seeded);
        return;
      }
    }
    setLocalData('categories', categories);
  },

  // Obtener Transacciones
  getTransactions: async () => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        if (!error && data) {
          return data.map(t => ({
            id: t.id,
            description: t.description,
            amount: Number(t.amount),
            currency: t.currency,
            type: t.type,
            accountId: t.account_id,
            destinationAccountId: t.destination_account_id,
            categoryId: t.category_id,
            date: t.date,
            commission: Number(t.commission || 0),
            commissionType: t.commission_type,
            rateUsed: t.rate_used,
            isCustomRate: t.is_custom_rate
          }));
        }
      }
    }
    return getLocalData('transactions', INITIAL_TRANSACTIONS);
  },

  saveTransactions: async (txs) => {
    if (supabase) return;
    setLocalData('transactions', txs);
  },

  // Agregar Transacción
  addTransaction: async (tx) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Conseguir balance actual de la cuenta
        const { data: acc } = await supabase.from('accounts').select('balance').eq('id', tx.accountId).single();
        if (acc) {
          const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
          const newBalance = tx.type === 'Gasto' 
            ? Number((acc.balance - amountWithCommission).toFixed(2))
            : Number((acc.balance + Number(tx.amount)).toFixed(2));
          
          // 2. Actualizar balance
          await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.accountId);
        }

        // 3. Insertar transacción
        const { data: newTx } = await supabase.from('transactions').insert({
          description: tx.description,
          amount: tx.amount,
          currency: tx.currency,
          type: tx.type,
          account_id: tx.accountId,
          category_id: tx.categoryId,
          commission: tx.commission,
          commission_type: tx.commissionType,
          user_id: user.id
        }).select().single();
        
        return newTx;
      }
    }

    // Fallback LocalStorage
    const transactions = getLocalData('transactions', INITIAL_TRANSACTIONS);
    const accounts = getLocalData('accounts', INITIAL_ACCOUNTS);
    const newTx = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      ...tx
    };
    const accountIndex = accounts.findIndex(a => a.id === tx.accountId);
    if (accountIndex !== -1) {
      const acc = accounts[accountIndex];
      const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
      acc.balance = tx.type === 'Gasto' 
        ? Number((acc.balance - amountWithCommission).toFixed(2))
        : Number((acc.balance + Number(tx.amount)).toFixed(2));
      accounts[accountIndex] = acc;
      setLocalData('accounts', accounts);
    }
    transactions.unshift(newTx);
    setLocalData('transactions', transactions);
    return newTx;
  },

  // Agregar Transferencia
  addTransfer: async (transfer) => {
    const {
      fromAccountId,
      toAccountId,
      amountSource,
      amountDest,
      commissionSource,
      rateUsed,
      isCustomRate
    } = transfer;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Descontar origen
        const { data: src } = await supabase.from('accounts').select('balance').eq('id', fromAccountId).single();
        if (src) {
          const totalDeduction = Number(amountSource) + Number(commissionSource || 0);
          await supabase.from('accounts').update({ balance: Number((src.balance - totalDeduction).toFixed(2)) }).eq('id', fromAccountId);
        }

        // Incrementar destino
        const { data: dst } = await supabase.from('accounts').select('balance').eq('id', toAccountId).single();
        if (dst) {
          await supabase.from('accounts').update({ balance: Number((dst.balance + Number(amountDest)).toFixed(2)) }).eq('id', toAccountId);
        }

        // Crear transacción
        const { data: newTx } = await supabase.from('transactions').insert({
          description: `Transferencia interna`,
          amount: amountSource,
          currency: transfer.currency || 'VES',
          type: 'Transferencia',
          account_id: fromAccountId,
          destination_account_id: toAccountId,
          commission: commissionSource,
          rate_used: rateUsed,
          is_custom_rate: isCustomRate,
          user_id: user.id
        }).select().single();

        return newTx;
      }
    }

    // Fallback LocalStorage
    const transactions = getLocalData('transactions', INITIAL_TRANSACTIONS);
    const accounts = getLocalData('accounts', INITIAL_ACCOUNTS);
    const sourceAcc = accounts.find(a => a.id === fromAccountId);
    const destAcc = accounts.find(a => a.id === toAccountId);
    if (!sourceAcc || !destAcc) return null;

    const totalDeduction = Number(amountSource) + Number(commissionSource || 0);
    sourceAcc.balance = Number((sourceAcc.balance - totalDeduction).toFixed(2));
    destAcc.balance = Number((destAcc.balance + Number(amountDest)).toFixed(2));
    setLocalData('accounts', accounts);

    const newTx = {
      id: `t-${Date.now()}`,
      description: `Transferencia: ${sourceAcc.name} ➔ ${destAcc.name}`,
      amount: Number(amountSource),
      currency: sourceAcc.currency,
      type: 'Transferencia',
      accountId: fromAccountId,
      destinationAccountId: toAccountId,
      categoryId: 'transfer',
      date: new Date().toISOString(),
      commission: Number(commissionSource || 0),
      rateUsed: Number(rateUsed),
      isCustomRate,
      receivedAmount: Number(amountDest),
      receivedCurrency: destAcc.currency
    };

    transactions.unshift(newTx);
    setLocalData('transactions', transactions);
    return newTx;
  },

  addAccount: async (acc) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('accounts').insert({
          name: acc.name,
          type: acc.type,
          balance: acc.balance,
          currency: acc.currency,
          user_id: user.id
        }).select().single();
        return data;
      }
    }
    const list = getLocalData('accounts', INITIAL_ACCOUNTS);
    const newAcc = { id: `acc-${Date.now()}`, ...acc };
    list.push(newAcc);
    setLocalData('accounts', list);
    return newAcc;
  },

  addCategory: async (cat) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('categories').insert({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          is_income: cat.isIncome,
          user_id: user.id
        }).select().single();
        return data;
      }
    }
    const list = getLocalData('categories', INITIAL_CATEGORIES);
    const newCat = { id: `cat-${Date.now()}`, ...cat };
    list.push(newCat);
    setLocalData('categories', list);
    return newCat;
  },

  deleteTransaction: async (txId) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: tx } = await supabase.from('transactions').select('*').eq('id', txId).single();
        if (tx) {
          const { data: acc } = await supabase.from('accounts').select('balance').eq('id', tx.account_id).single();
          if (acc) {
            let newBalance = acc.balance;
            if (tx.type === 'Gasto') {
              const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
              newBalance = Number((acc.balance + amountWithCommission).toFixed(2));
              await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.account_id);
            } else if (tx.type === 'Ingreso') {
              newBalance = Number((acc.balance - Number(tx.amount)).toFixed(2));
              await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.account_id);
            } else if (tx.type === 'Transferencia') {
              const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
              const newSrcBalance = Number((acc.balance + amountWithCommission).toFixed(2));
              await supabase.from('accounts').update({ balance: newSrcBalance }).eq('id', tx.account_id);

              if (tx.destination_account_id) {
                const { data: destAcc } = await supabase.from('accounts').select('balance').eq('id', tx.destination_account_id).single();
                if (destAcc) {
                  const receivedAmount = Number(tx.amount) * Number(tx.rate_used || 1);
                  await supabase.from('accounts').update({ balance: Number((destAcc.balance - receivedAmount).toFixed(2)) }).eq('id', tx.destination_account_id);
                }
              }
            }
          }
          await supabase.from('transactions').delete().eq('id', txId);
          return true;
        }
      }
    }

    const transactions = getLocalData('transactions', INITIAL_TRANSACTIONS);
    const accounts = getLocalData('accounts', INITIAL_ACCOUNTS);
    const txIndex = transactions.findIndex(t => t.id === txId);
    if (txIndex !== -1) {
      const tx = transactions[txIndex];
      if (tx.type === 'Gasto') {
        const acc = accounts.find(a => a.id === tx.accountId);
        if (acc) {
          const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
          acc.balance = Number((acc.balance + amountWithCommission).toFixed(2));
        }
      } else if (tx.type === 'Ingreso') {
        const acc = accounts.find(a => a.id === tx.accountId);
        if (acc) {
          acc.balance = Number((acc.balance - Number(tx.amount)).toFixed(2));
        }
      } else if (tx.type === 'Transferencia') {
        const srcAcc = accounts.find(a => a.id === tx.accountId);
        const dstAcc = accounts.find(a => a.id === tx.destinationAccountId);
        if (srcAcc) {
          const amountWithCommission = Number(tx.amount) + Number(tx.commission || 0);
          srcAcc.balance = Number((srcAcc.balance + amountWithCommission).toFixed(2));
        }
        if (dstAcc) {
          const receivedAmount = tx.receivedAmount || (Number(tx.amount) * Number(tx.rateUsed || 1));
          dstAcc.balance = Number((dstAcc.balance - receivedAmount).toFixed(2));
        }
      }
      transactions.splice(txIndex, 1);
      setLocalData('transactions', transactions);
      setLocalData('accounts', accounts);
      return true;
    }
    return false;
  },

  updateTransaction: async (txId, updatedTx) => {
    // 1. Primero revertimos los cambios de la transacción anterior eliminándola (sin borrar el registro en DB, solo simulando su borrado en balance)
    await db.deleteTransaction(txId);
    
    // 2. Insertamos la transacción modificada con el mismo ID original
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Conseguimos la cuenta y aplicamos el nuevo balance
        const { data: acc } = await supabase.from('accounts').select('balance').eq('id', updatedTx.accountId).single();
        if (acc) {
          const amountWithCommission = Number(updatedTx.amount) + Number(updatedTx.commission || 0);
          const newBalance = updatedTx.type === 'Gasto' 
            ? Number((acc.balance - amountWithCommission).toFixed(2))
            : Number((acc.balance + Number(updatedTx.amount)).toFixed(2));
          await supabase.from('accounts').update({ balance: newBalance }).eq('id', updatedTx.accountId);
        }

        // Insertamos la transacción con el ID original
        await supabase.from('transactions').insert({
          id: txId,
          description: updatedTx.description,
          amount: updatedTx.amount,
          currency: updatedTx.currency,
          type: updatedTx.type,
          account_id: updatedTx.accountId,
          category_id: updatedTx.categoryId,
          commission: updatedTx.commission,
          commission_type: updatedTx.commissionType,
          user_id: user.id,
          date: updatedTx.date || new Date().toISOString()
        });
        return true;
      }
    }

    // Para localStorage, db.deleteTransaction ya eliminó la transacción de la lista y actualizó el balance.
    // Ahora agregamos la nueva con el ID correspondiente.
    const transactions = getLocalData('transactions', INITIAL_TRANSACTIONS);
    const accounts = getLocalData('accounts', INITIAL_ACCOUNTS);
    const accountIndex = accounts.findIndex(a => a.id === updatedTx.accountId);
    if (accountIndex !== -1) {
      const acc = accounts[accountIndex];
      const amountWithCommission = Number(updatedTx.amount) + Number(updatedTx.commission || 0);
      acc.balance = updatedTx.type === 'Gasto' 
        ? Number((acc.balance - amountWithCommission).toFixed(2))
        : Number((acc.balance + Number(updatedTx.amount)).toFixed(2));
      accounts[accountIndex] = acc;
      setLocalData('accounts', accounts);
    }
    const newRecord = {
      id: txId,
      date: updatedTx.date || new Date().toISOString(),
      ...updatedTx
    };
    transactions.unshift(newRecord);
    setLocalData('transactions', transactions);
    return true;
  },

  deleteAccount: async (accountId) => {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('transactions').delete().eq('account_id', accountId);
        await supabase.from('transactions').delete().eq('destination_account_id', accountId);
        await supabase.from('accounts').delete().eq('id', accountId);
        return true;
      }
    }
    const accounts = getLocalData('accounts', INITIAL_ACCOUNTS);
    const transactions = getLocalData('transactions', INITIAL_TRANSACTIONS);
    
    const filteredAccs = accounts.filter(a => a.id !== accountId);
    setLocalData('accounts', filteredAccs);

    const filteredTxs = transactions.filter(t => t.accountId !== accountId && t.destinationAccountId !== accountId);
    setLocalData('transactions', filteredTxs);
    return true;
  }
};

