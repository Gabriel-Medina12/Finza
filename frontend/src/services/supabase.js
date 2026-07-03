import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Crear el cliente de Supabase solo si existen las variables de entorno
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const authService = {
  // Registro con correo
  signUp: async (email, password, fullName) => {
    if (!supabase) return { data: { user: { email, id: 'mock-user' } }, error: null };
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    return { data, error };
  },

  // Iniciar Sesión con correo
  signIn: async (email, password) => {
    if (!supabase) return { data: { user: { email, id: 'mock-user' } }, error: null };
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Iniciar Sesión con Google
  signInWithGoogle: async () => {
    if (!supabase) {
      alert("No se ha configurado Supabase. Iniciando sesión en modo Demo.");
      return { data: { user: { email: 'demo@google.com', id: 'mock-google' } }, error: null };
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { data, error };
  },

  // Cerrar Sesión
  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
};
