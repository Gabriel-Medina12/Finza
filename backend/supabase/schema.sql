-- Esquema de Base de Datos para Finza en Supabase (PostgreSQL)

-- 1. Tabla de Perfiles de Usuario (Mapeado a Auth.Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil." 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Tabla de Cuentas Financieras
CREATE TABLE public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Bank', 'Crypto', 'Cash')),
  balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('VES', 'USD', 'EUR', 'USDT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propias cuentas."
  ON public.accounts FOR ALL
  USING (auth.uid() = user_id);

-- 3. Tabla de Categorías de Transacción
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL indica categorías del sistema predefinidas
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#10B981' NOT NULL,
  is_income BOOLEAN DEFAULT FALSE NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver categorías del sistema y las suyas."
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus propias categorías."
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Tabla de Transacciones y Movimientos
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts ON DELETE CASCADE NOT NULL,
  destination_account_id UUID REFERENCES public.accounts ON DELETE CASCADE, -- Para transferencias
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Gasto', 'Ingreso', 'Transferencia')),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  commission NUMERIC(15, 2) DEFAULT 0.00,
  commission_type TEXT,
  rate_used NUMERIC(15, 6),
  is_custom_rate BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propios movimientos."
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);
