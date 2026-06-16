/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Calculator, Database, PenTool, GitBranch, TrendingUp } from 'lucide-react';

export const TechnicalManual: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-700 text-white rounded-lg shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Documentação Técnica Detalhada: SITermal v4.0</h2>
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
              O projeto foi planejado como uma iniciativa estratégica da Defesa Civil de Fortaleza.
              O objetivo central é a monitorização contínua de Ilhas de Calor (ICU) para mitigação de riscos à saúde pública e otimização da infraestrutura urbana.
              O sistema utiliza o <strong>Índice de Desconforto Térmico (IDT - Fórmula de Thom)</strong> para avaliar o estresse térmico,
              a <strong>Intensidade da ICU</strong> comparada a uma estação de referência, e <strong>interpolação IDW</strong> para espacialização contínua.
            </p>
          </div>

          {/* Seção Metodologia */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> 2. Metodologia e Técnica
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              Utilizamos a metodologia de <strong>Referência Térmica Dinâmica</strong>. Em vez de fixar um bairro geograficamente, 
              o sistema identifica dinamicamente a estação mais fria da rede no ciclo de leitura (T_mín) como controle natural. 
              A intensidade da ICU de cada bairro é dada por <code className="bg-slate-100 px-1 rounded text-xs">ICU = T_urbana − T_mín</code>. 
              O conforto térmico é calibrado especificamente para Fortaleza: zona de conforto ajustada para **24°C a 27°C** devido à aclimatação local, 
              </p>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              O sistema baseia-se na formulação da <strong>Temperatura Aparente de Steadman (1994)</strong>, um índice universal que consolida a Temperatura do Ar, Umidade Relativa, Velocidade do Vento e Radiação Solar incidente em um único valor representativo do estresse térmico humano.
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 font-mono text-xs overflow-x-auto text-slate-700">
              e = (RH / 100) * 6.105 * exp(17.27 * Ta / (237.7 + Ta))<br/>
              AT = Ta + 0.348 * e - 0.70 * ws + 0.70 * (Q / (ws + 10)) - 4.25
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li><strong>Ta:</strong> Temperatura do Ar (°C) coletada pelos sensores</li>
              <li><strong>e:</strong> Pressão de vapor d'água (hPa) baseada na Umidade Relativa (RH)</li>
              <li><strong>ws:</strong> Velocidade do Vento (m/s) a 10m de altura (convecção térmica)</li>
              <li><strong>Q:</strong> Radiação Solar Incidente (W/m²) limitando o resfriamento cutâneo</li>
            </ul>
          </div>

          {/* Seção Variáveis */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4" /> 3. Dicionário de Variáveis
            </h3>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              <li><strong>T</strong> (Temperatura): Temperatura ambiente (°C) captada pelos sensores.</li>
              <li><strong>UR</strong> (Umidade): Umidade relativa do ar (%).</li>
              <li><strong>IDT</strong> (Índice de Desconforto Térmico): Temperatura aparente percebida pelo corpo humano, calculada pela Fórmula de Thom.</li>
              <li><strong>ICU</strong> (Intensidade da Ilha de Calor): Diferença entre a temperatura da estação urbana e o ponto de controle térmico dinâmico da cidade (estação mais fria do ciclo).</li>
              <li><strong>IDW</strong> (Inverse Distance Weighting): Método de interpolação espacial para estimar valores entre estações e gerar mapa contínuo.</li>
              <li><strong>Holt</strong>: Modelo de Suavização Exponencial Dupla para previsão de séries temporais (7 dias).</li>
            </ul>
          </div>

          {/* Seção Matemática */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
              <Calculator className="w-4 h-4" /> 4. Manuseio Matemático
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-xs text-slate-700 space-y-3">
              <div>
                <p><strong>Sensação Térmica / Índice de Calor (NOAA / Rothfusz):</strong></p>
                <code>HI = f(T, UR) → Regressão de Rothfusz (Conversão p/ °C)</code>
                <div className="mt-2 text-[11px] text-slate-500 font-sans leading-relaxed">
                  <strong>Onde:</strong><br />
                  • <strong>T (Temperatura Real):</strong> Temperatura do ar em °C captada fisicamente pelos sensores.<br />
                  • <strong>UR (Umidade Relativa):</strong> Percentual de vapor de água no ar (%).<br />
                  <strong>Como chegamos a esse número:</strong> A fórmula atualizada utiliza a Regressão do Serviço Meteorológico dos EUA (NOAA). Em climas muito úmidos e quentes como o de Fortaleza, a evaporação do suor (nosso mecanismo de resfriamento) é severamente inibida, o que faz o corpo reter calor. A fórmula reflete essa realidade projetando um número (Sensação) que, nestes cenários, é <strong>sempre maior</strong> que a temperatura real do ar. Ex: 32°C com 70% UR equivale a uma sensação superior a 40°C.
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p><strong>ICU — Intensidade da Ilha de Calor:</strong></p>
                <code>ICU = T_urbana − T_referência</code>
              </div>
              <div>
                <p><strong>IDW — Interpolação Espacial:</strong></p>
                <code>Z(x) = Σ(Zi / di²) / Σ(1 / di²)</code>
              </div>
              <div>
                <p><strong>Previsão (Holt — Suavização Exponencial Dupla):</strong></p>
                <code>S_t = α·Y_t + (1−α)·(S_{"t-1"} + b_{"t-1"})</code>
                <br />
                <code>b_t = β·(S_t − S_{"t-1"}) + (1−β)·b_{"t-1"}</code>
                <br />
                <code>F_{"t+m"} = S_t + m·b_t</code>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 font-sans">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">Classificação Oficial de Alerta (Defesa Civil):</p>
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  🟢 <strong>Nível 0:</strong> Sensação ≤ 27°C (Seguro) | 
                  🟡 <strong>Nível 1:</strong> 27.1 a 32°C (Atenção) <br/>
                  🟠 <strong>Nível 2:</strong> 32.1 a 41°C (Alerta) | 
                  🔴 <strong>Nível 3:</strong> &gt; 41.1°C (Alarme - Risco de Colapso Térmico)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Predição */}
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-violet-700 text-white rounded-lg shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-violet-900">Modelagem Preditiva</h3>
            <p className="text-violet-600 text-sm font-medium">Projeção de Séries Temporais para Prevenção</p>
          </div>
        </div>
        <p className="text-sm text-violet-800 leading-relaxed">
          O sistema utiliza o método de <strong>Holt (Suavização Exponencial Dupla)</strong> como modelo
          preditivo leve para projeções de 7 dias. Para evolução futura, recomenda-se migrar para
          <strong> ARIMAX/Prophet/LSTM</strong> via endpoint Python com regressores externos
          (radiação solar, velocidade do vento), conforme equação:
        </p>
        <div className="bg-white/60 rounded-lg p-3 mt-3 font-mono text-xs text-violet-700">
          <code>T_t = α + Σ(φi·T_{"t-i"}) + β1(Radiação) + β2(Vento) + εt</code>
        </div>
      </div>
      
      {/* Sobre o SITermal */}
      <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-slate-800 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Sobre o SITermal</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sistema de monitoramento de ilhas de calor urbana desenvolvido como iniciativa da Defesa Civil de Fortaleza. Versão 4.1.0.
            Modelos: IDT (Thom), ICU (Estação de Referência), IDW (Interpolação Espacial), Holt (Previsão).
          </p>
        </div>
      </div>
    </div>
  );
};
