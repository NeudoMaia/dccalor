/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, Calculator, Database, PenTool, GitBranch, TrendingUp, 
  ChevronDown, ChevronUp, Stethoscope, HeartPulse, Bug, Activity, ShieldCheck, FileText, Minimize2, Maximize2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface TechnicalManualProps {
  defaultExpanded?: boolean;
}

export const TechnicalManual: React.FC<TechnicalManualProps> = ({ defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner & Collapse Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-700 text-white rounded-xl shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-slate-800 tracking-tight">
                Documentação Técnica Detalhada: DCCALOR v4.0
              </h2>
              <p className="text-slate-500 font-medium text-xs lg:text-sm">
                Fundamentos Climatológicos, Modelagem Fisiológica e Lógica de Inferência da IA
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer border border-slate-700 group"
          >
            <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span>{isExpanded ? "Retrair Documentação" : "Relatório Técnico Detalhado"}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Resumo compacto quando retraído */}
        {!isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Cálculo de Sensação Térmica</span>
              <p className="text-xs text-slate-600 font-medium">Índice IDT via Fórmula de Thom e Temperatura Aparente de Steadman (calibrada para a umidade de Fortaleza).</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest block mb-1">Motor de Patologias da IA</span>
              <p className="text-xs text-slate-600 font-medium">Inferência médica de riscos cardiovasculares, respiratórios, vetoriais e ligadas ao calor extremo.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Status da Documentação</span>
                <p className="text-xs text-slate-600 font-medium">Visão retraída para concisão. Clique em "Relatório Técnico Detalhado" para expandir.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Conteúdo Completo (Expandido) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Seção 1: Planejamento */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> 1. Planejamento e Escopo
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                    O projeto foi planejado como uma iniciativa estratégica da Defesa Civil de Fortaleza.
                    O objetivo central é o monitoramento em tempo real de Ilhas de Calor (ICU) e emissão preditiva de alertas para mitigação de riscos à saúde pública e otimização da infraestrutura urbana.
                    O sistema utiliza o <strong>Índice de Desconforto Térmico (IDT)</strong>, a <strong>Intensidade da ICU</strong> comparada a uma estação de referência dinâmica e <strong>interpolação IDW</strong> para espacialização contínua.
                  </p>
                </div>

                {/* Seção 2: Metodologia */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> 2. Metodologia e Física Térmica
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-justify font-medium">
                    Utilizamos a metodologia de <strong>Referência Térmica Dinâmica</strong>. O sistema identifica dinamicamente a estação mais fria da rede no ciclo de leitura (T_mín) como controle natural.
                    A intensidade da ICU de cada bairro é dada por <code className="bg-slate-100 px-1 rounded font-mono text-[11px]">ICU = T_urbana − T_mín</code>. 
                    O conforto térmico é calibrado para a zona tropical de Fortaleza (temperaturas normais entre 24°C e 27°C).
                  </p>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700">
                    e = (RH / 100) * 6.105 * exp(17.27 * Ta / (237.7 + Ta))<br/>
                    AT = Ta + 0.348 * e - 0.70 * ws + 0.70 * (Q / (ws + 10)) - 4.25
                  </div>
                </div>

                {/* Seção 3: Dicionário de Variáveis */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> 3. Dicionário de Variáveis Telemétricas
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-medium">
                    <li><strong>T</strong> (Temperatura): Temperatura ambiente (°C) captada fisicamente pelos sensores das estações automáticas.</li>
                    <li><strong>UR</strong> (Umidade Relativa): Percentual de vapor de água retido na atmosfera (%).</li>
                    <li><strong>IDT / Sensação Térmica</strong>: Temperatura aparente percebida pelo corpo humano (Fórmula de Thom / Rothfusz).</li>
                    <li><strong>ICU</strong> (Intensidade da Ilha de Calor): Sobreaquecimento urbano em relação à estação de controle (Messejana/Costeira).</li>
                    <li><strong>Holt</strong>: Modelo de Suavização Exponencial Dupla para projeção de tendências nos próximos 3 dias.</li>
                  </ul>
                </div>

                {/* Seção 4: Manuseio Matemático */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> 4. Formulação Matemática e Sensação Térmica
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-lg font-mono text-[11px] text-slate-700 space-y-3">
                    <div>
                      <p className="font-bold text-slate-900">Sensação Térmica / Índice de Calor (NOAA / Rothfusz):</p>
                      <code>HI = f(T, UR) → Regressão de Rothfusz (Conversão p/ °C)</code>
                      <p className="mt-1 text-[10px] text-slate-500 font-sans leading-relaxed">
                        Em climas tropicais úmidos como o de Fortaleza (UR &gt; 65%), a taxa de evaporação do suor (resfriamento cutâneo) cai drasticamente. A fórmula recalcula a sensação projetando um valor significativamente mais elevado que a temperatura real do ar. Ex: 35°C com 65% UR equivale a 41°C de Sensação Térmica.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* SEÇÃO ESPECIAL 5: COMO A IA PROCESSA E EMITE PROTOCOLOS DE PATOLOGIAS */}
              <div className="pt-6 border-t border-slate-200 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 text-white rounded-lg shadow-md">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      5. Como a Análise de IA Chega aos Protocolos e Patologias (Motor de Decisão Epidemiológica)
                    </h3>
                    <p className="text-slate-500 text-xs font-medium">
                      Detalhamento do algoritmo de inferência médica e resposta de Defesa Civil
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Passo A */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block">Passo A • Ingestão & Validação Telemétrica</span>
                    <h4 className="text-xs font-bold text-slate-900">Leitura Contínua das Estações Automáticas</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      A IA recebe a carga útil das 11 estações automáticas da Defesa Civil (Temperatura Real, Umidade, IDT, ICU) e cruza com a tendência preditiva de 72h gerada pela equação de Holt. A estação que apresenta maior valor de Temperatura e IDT é marcada como <strong>Ponto de Atenção Prioritário</strong>.
                    </p>
                  </div>

                  {/* Passo B */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest block">Passo B • Doenças Relacionadas ao Calor</span>
                    <h4 className="text-xs font-bold text-slate-900">Falha da Termorregulação Fisiológica</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Quando a sensação térmica supera 38°C a 40°C, o sistema detecta sobrecarga do centro termorregulador hipotalâmico. A IA emite alertas imediatos para <strong>Insolação aguda</strong>, <strong>Exaustão pelo calor</strong>, <strong>Desidratação severa</strong> e <strong>Estresse térmico</strong>. Se o IDT for maior ou igual a 40°C, a severidade é elevada obrigatoriamente para <code>EXTREMO</code>.
                    </p>
                  </div>

                  {/* Passo C */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block">Passo C • Descompensação Cardiorrespiratória</span>
                    <h4 className="text-xs font-bold text-slate-900">Mecanismos Sistêmicos de Vasodilatação</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Para dissipar calor, o organismo promove acentuada vasodilatação periférica, acelerando a frequência cardíaca. Pacientes cardiopatas ou hipertensos entram em estresse circulatório, elevando o risco de <strong>Infarto Agudo do Miocárdio</strong>, <strong>AVC</strong> e <strong>Insuficiência Cardíaca</strong>. O ar aquecido provoca broncoespasmo, agravando <strong>Asma</strong>, <strong>DPOC</strong> e <strong>Pneumonia</strong>.
                    </p>
                  </div>

                  {/* Passo D */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block">Passo D • Proliferação de Vetores Epidemiológicos</span>
                    <h4 className="text-xs font-bold text-slate-900">Encurtamento do Ciclo Reprodutivo dos Mosquitos</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      A combinação de temperaturas entre 28°C e 35°C com umidade alta reduz o ciclo gonotrófico do <em>Aedes aegypti</em> de 14 para 7 dias. A IA identifica essa aceleração e gera alertas de risco epidemiológico para <strong>Dengue</strong>, <strong>Zika</strong>, <strong>Chikungunya</strong>, <strong>Febre do Oropouche</strong>, <strong>Malária</strong>, <strong>Leishmaniose</strong> e <strong>Febre Amarela</strong>.
                    </p>
                  </div>

                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-blue-900">Emissão Final dos Protocolos de Defesa Civil</h4>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                      Após correlacionar os indicadores climáticos com as tabelas patológicas e os grupos vulneráveis (idosos, crianças &lt; 5 anos, gestantes, cardiopatas, trabalhadores ao ar livre e população de rua), o Gemini formula de 3 a 5 recomendações acionáveis organizadas por prazos (Imediato, 24h, 48h, 72h) com direcionamento para as estações e bairros alvo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção 6: Predição */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-700 text-white rounded-lg shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-purple-900 uppercase tracking-widest">
                      6. Modelagem Preditiva (Suavização Exponencial Dupla de Holt)
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  O modelo calcula a tendência do Índice de Desconforto Térmico para os próximos 3 dias. Se a projeção indicar que um bairro subirá de faixa de alerta (ex: Nível 1 para Nível 2), o sistema dispara os protocolos preventivos antecedendo o pico térmico.
                </p>
              </div>

              {/* Botão para retrair no final da leitura */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>Retrair Documentação Técnica</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
