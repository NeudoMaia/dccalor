import React, { useState } from 'react';
import { KeyRound, User, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

// Componente SVG personalizado representando a logo da Defesa Civil de Fortaleza
export const DefesaCivilLogo: React.FC<{ className?: string }> = ({ className = "w-32 h-32" }) => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      className={className} 
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
      
      {/* Elementos internos do retângulo branco: Triângulo azul e mãos laranjas */}
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
      
      {/* Mão laranja inferior esquerda (Rotacionada 180 graus em relação ao centro x=250, y=250) */}
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500/30 relative overflow-hidden">
      {/* Efeitos de Fundo (Glows de Ilhas de Calor) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800/60 overflow-hidden relative z-10">
        {/* Faixa decorativa superior com degradê do sistema */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-orange-500 to-red-600"></div>
        
        <div className="p-8 sm:p-10">
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            {/* Logo da Defesa Civil */}
            <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
              <DefesaCivilLogo className="w-36 h-36 drop-shadow-[0_4px_20px_rgba(0,53,148,0.25)]" />
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              DCCALOR
            </h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1">
              Painel de Monitoramento Climático • Fortaleza
            </p>
            <p className="text-sm text-slate-400 mt-3 font-medium max-w-xs">
              Logística, Planejamento e Arquitetura de Prevenção de Ilhas de Calor
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="username">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl leading-5 bg-slate-950 text-white placeholder-slate-600 focus:outline-none sm:text-sm transition-all"
                  placeholder="Ex: admin"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest" htmlFor="password">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border ${error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'} rounded-xl leading-5 bg-slate-950 text-white placeholder-slate-600 focus:outline-none sm:text-sm transition-all`}
                  placeholder="Insira a credencial"
                />
              </div>
              {error && (
                <div className="mt-2 text-xs text-red-400 font-bold flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all uppercase tracking-widest cursor-pointer mt-2"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-950/40 py-4 px-8 border-t border-slate-900/60 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Ambiente Seguro
          </span>
          <span>v4.0.0</span>
        </div>
      </div>
    </div>
  );
};
