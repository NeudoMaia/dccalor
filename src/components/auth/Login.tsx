import React, { useState } from 'react';
import { KeyRound, User, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

// Componente SVG da Defesa Civil de Fortaleza com correção de escala
export const DefesaCivilLogo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={className} 
      width="100%"
      height="100%"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Caixa azul externa com cantos arredondados */}
      <rect width="500" height="500" rx="40" fill="#003594" />
      
      {/* Texto superior: DEFESA CIVIL */}
      <text 
        x="250" 
        y="75" 
        fill="white" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="52" 
        textAnchor="middle" 
        letterSpacing="1"
      >
        DEFESA CIVIL
      </text>
      
      {/* Retângulo branco interno */}
      <rect x="15" y="110" width="470" height="280" fill="white" />
      
      {/* Texto inferior: FORTALEZA */}
      <text 
        x="250" 
        y="455" 
        fill="white" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontWeight="900" 
        fontSize="52" 
        textAnchor="middle" 
        letterSpacing="1"
      >
        FORTALEZA
      </text>
      
      {/* Elementos internos do retângulo branco */}
      {/* Triângulo azul central */}
      <polygon points="250,185 185,285 315,285" fill="#003594" />
      
      {/* Mão laranja superior direita */}
      <polygon 
        points="
          475,120
          330,150
          190,150
          150,240
          175,240
          205,185
          310,185
          385,200
          475,200
        " 
        fill="#f47a00" 
      />
      
      {/* Mão laranja inferior esquerda */}
      <polygon 
        points="
          475,120
          330,150
          190,150
          150,240
          175,240
          205,185
          310,185
          385,200
          475,200
        " 
        fill="#f47a00" 
        transform="rotate(180, 250, 250)" 
      />
    </svg>
  );
};

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Por favor, insira o usuário.');
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    if (password === 'admindc') {
      onLogin();
    } else {
      setErrorMsg('Senha incorreta. Acesso negado.');
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
            {/* Container da logo com tamanho ampliado */}
            <div className="w-36 h-36 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner p-3.5 transform hover:scale-105 transition-transform duration-300">
              <DefesaCivilLogo className="w-full h-full" />
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
              DCCALOR
            </h1>
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">
              Painel de Monitoramento Climático • Fortaleza
            </h2>
            <p className="text-sm text-slate-500 mt-4 font-medium">
              Logística, Planejamento e Arquitetura de Prevenção de Ilhas de Calor
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="username">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 focus:ring-blue-500 rounded-xl leading-5 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:ring-2 sm:text-sm transition-all"
                  placeholder="Insira o usuário"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="password">
                Senha de Acesso
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
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all uppercase tracking-widest cursor-pointer"
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
