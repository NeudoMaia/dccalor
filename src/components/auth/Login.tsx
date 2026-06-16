import React, { useState } from 'react';
import { ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admindc') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden relative">
        {/* Header Decorativo */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-orange-500 to-red-600"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
              <ShieldAlert className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Defesa Civil</h1>
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Fortaleza • CE</h2>
            <p className="text-sm text-slate-500 mt-4 font-medium">Sistema de Monitoramento de Ilhas de Calor (ICU) e Alertas Climáticos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="password">
                Credencial de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-blue-500'} rounded-xl leading-5 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                  placeholder="Insira a senha de administrador"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Senha incorreta. Acesso negado.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all uppercase tracking-widest"
            >
              Autenticar
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-900/50 py-4 px-8 border-t border-slate-700 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Acesso Restrito</span>
          <span>v4.0.0</span>
        </div>
      </div>
    </div>
  );
};
