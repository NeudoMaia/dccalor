/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Calculator, Database, PenTool, GitBranch } from 'lucide-react';

export const TechnicalManual: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-700 text-white rounded-lg shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Documentação Técnica Detalhada: SITermal</h2>
            <p className="text-slate-500 font-medium">Fundamentos, Modelagem e Inteligência Analítica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Seção Planejamento */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <PenTool className="w-4 h-4" /> 1. Planejamento e Escopo
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              O projeto foi planejado como uma parceria estratégica entre a Defesa Civil e a Secretaria Municipal de Saúde de Fortaleza.
              O objetivo central é a monitorização contínua de Ilhas de Calor (ICU) para mitigação de riscos à saúde pública e otimização da infraestrutura urbana.
              O sistema baseia-se em uma infraestrutura descentralizada de sensores IoT, garantindo alta granularidade de dados espaciais.
            </p>
          </div>

          {/* Seção Metodologia */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> 2. Metodologia e Técnica
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              Utilizamos uma abordagem de <strong>Baseline Dinâmica</strong>. Em vez de médias históricas estáticas, o sistema varre a malha a cada 5 segundos para identificar o ponto mais fresco da cidade (nó base). Os gradientes térmicos são processados em relação a essa referência mutável, permitindo detecção imediata de anomalias térmicas induzidas por urbanização (asfalto, concreto) em tempo real.
            </p>
          </div>

          {/* Seção Variáveis */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4" /> 3. Dicionário de Variáveis
            </h3>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li><strong>T</strong> (Temperatura): Temperatura ambiente (°C) captada pelos sensores.</li>
              <li><strong>U</strong> (Umidade): Umidade relativa do ar (%).</li>
              <li><strong>HI</strong> (Heat Index): Temperatura aparente percebida pelo corpo humano.</li>
              <li><strong>ΔT</strong> (Delta): Desvio de temperatura em relação à base mais fria da malha.</li>
              <li><strong>Radius</strong>: Raio de influência (2km) da estação primária.</li>
            </ul>
          </div>

          {/* Seção Matemática */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <Calculator className="w-4 h-4" /> 4. Manuseio Matemático
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-700 space-y-2">
              <p><strong>Cálculo do Índice de Calor (Steadman):</strong></p>
              <code>HI = T + (0.33 * (U/100) * T) - 4</code>
              <p className="mt-4"><strong>Cálculo do Delta Térmico:</strong></p>
              <code>ΔT = T_local - min(T_malha)</code>
              <p className="mt-2 text-[10px] text-slate-500 italic">*Os resultados são normalizados para garantir a estabilidade do fluxo de dados.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* ... [Restante do código original mantido] */}
      <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-slate-800 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Sobre o SITermal</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sistema de monitoramento de ilhas de calor urbana desenvolvido pela Defesa Civil de Fortaleza 
            em parceria com a Secretaria Municipal de Saúde. Versão 3.2.0.
          </p>
        </div>
      </div>
    </div>
  );
};
