import React, { useState, useEffect } from 'react';
import { authService } from '../services/supabase';
import Logo from '../components/Logo';



export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lockout states
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem('finza_lockout_until');
      if (lockoutUntil) {
        const timeLeft = Math.ceil((new Date(lockoutUntil).getTime() - Date.now()) / 1000);
        if (timeLeft > 0) {
          setLockoutTimeLeft(timeLeft);
        } else {
          setLockoutTimeLeft(0);
          localStorage.removeItem('finza_lockout_until');
          localStorage.removeItem('finza_failed_attempts');
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;
    if (!email || !password) return;
    setLoading(true);
    setError('');

    let res;
    if (isSignUp) {
      res = await authService.signUp(email, password, fullName);
    } else {
      res = await authService.signIn(email, password);
    }

    setLoading(false);

    if (res.error) {
      const currentAttempts = Number(localStorage.getItem('finza_failed_attempts') || 0) + 1;
      localStorage.setItem('finza_failed_attempts', currentAttempts);

      if (currentAttempts >= 5) {
        const lockoutTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('finza_lockout_until', lockoutTime);
        setLockoutTimeLeft(3 * 60 * 60);
        setError("Demasiados intentos. Acceso bloqueado por 3 horas.");
      } else {
        setError(`${res.error.message || "Error al autenticar."} (Intento ${currentAttempts} de 5)`);
      }
    } else if (res.data?.user) {
      localStorage.removeItem('finza_failed_attempts');
      localStorage.removeItem('finza_lockout_until');
      onLoginSuccess({
        email: res.data.user.email,
        fullName: res.data.user.user_metadata?.full_name || res.data.user.email.split('@')[0],
        avatarUrl: null
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0e1726] to-[#080d16] text-white px-6 py-8 select-none font-sans max-w-md mx-auto relative">
      
      {/* Top Header Logo */}
      <div className="flex items-center gap-2 mt-4">
        <Logo className="w-7 h-7" />
        <h1 className="text-2xl font-bold tracking-widest text-[#4deaf0] font-sans">FINZA</h1>
      </div>

      {/* Main Content Card Container */}
      <div className="flex-1 flex flex-col justify-center gap-8 my-auto">
        
        {/* Central Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-[#1b263b]/50 border border-white/5 flex items-center justify-center shadow-lg">
            <Logo className="w-12 h-12" />
          </div>
        </div>

        {/* Welcome Texts */}
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            {isSignUp 
              ? 'Regístrate para comenzar a gestionar tu portafolio financiero.'
              : 'Accede a tu bóveda financiera segura y gestión de portafolio.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-semibold text-center">
            {error}
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Nombre Completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={lockoutTimeLeft > 0}
              className="w-full bg-white text-black py-4 px-5 rounded-xl outline-none placeholder-gray-400 font-medium text-sm transition-all focus:ring-2 focus:ring-primary disabled:opacity-50"
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={lockoutTimeLeft > 0}
            className="w-full bg-white text-black py-4 px-5 rounded-xl outline-none placeholder-gray-400 font-medium text-sm transition-all focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={lockoutTimeLeft > 0}
            className="w-full bg-white text-black py-4 px-5 rounded-xl outline-none placeholder-gray-400 font-medium text-sm transition-all focus:ring-2 focus:ring-primary disabled:opacity-50"
            required
          />

          {!isSignUp && (
            <div className="text-right">
              <button type="button" className="text-xs text-gray-400 hover:text-white font-semibold transition-colors">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || lockoutTimeLeft > 0}
            className={`w-full py-4 mt-2 font-bold rounded-xl shadow-lg active-shrink transition-all text-sm flex justify-center items-center gap-2 ${
              lockoutTimeLeft > 0 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-[#48e3a5] hover:bg-[#3cd094] text-black'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : lockoutTimeLeft > 0 ? (
              `Bloqueado: ${formatTimeLeft(lockoutTimeLeft)}`
            ) : (
              isSignUp ? 'Registrarse' : 'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center text-xs text-gray-400">
          <span>{isSignUp ? '¿Ya tienes una cuenta? ' : '¿No tienes una cuenta? '}</span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-bold hover:underline transition-all"
          >
            {isSignUp ? 'Iniciar Sesión' : 'Regístrate'}
          </button>
        </div>

        {/* O continuar con */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span>O continuar con</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <div className="flex justify-center">
            {/* Google */}
            <button 
              type="button" 
              onClick={async () => {
                const res = await authService.signInWithGoogle();
                if (res.data?.user) {
                  onLoginSuccess({
                    email: res.data.user.email,
                    fullName: res.data.user.user_metadata?.full_name || "Usuario Google",
                    avatarUrl: null
                  });
                } else if (res.error) {
                  setError(res.error.message);
                }
              }}
              className="w-12 h-12 rounded-full bg-[#1b263b]/40 border border-white/5 flex items-center justify-center hover:bg-white/5 active-shrink transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info Links */}
      <div className="flex justify-center gap-6 mt-6 text-[10px] text-gray-500 font-semibold">
        <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[12px]">help</span>
          Centro de Ayuda
        </button>
        <button type="button" className="flex items-center gap-1 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[12px]">info</span>
          Política de Privacidad
        </button>
      </div>

    </div>
  );
}
