/**
 * Endpoint de API: Observatório Climático de Fortaleza (IPPLAN)
 * Sistema DCCALOR - Defesa Civil de Fortaleza
 *
 * Rotas atendidas:
 *  - GET /api/observatorio/atual   (ou ?tipo=atual)
 *  - GET /api/observatorio/diario  (ou ?tipo=diario&data=YYYY-MM-DD&dias=30)
 *  - GET /api/observatorio/predicao (ou ?tipo=predicao&data=YYYY-MM-DD&dias=7)
 *  - GET /api/observatorio/info    (documentação técnica da API)
 *  - GET /api/observatorio         (suporta ?tipo=todos ou qualquer tipo acima)
 */

import {
  obterEstacoesAtuais,
  obterSensacaoDiaria,
  obterPredicaoDiaria,
  obterDocumentacaoObservatorio
} from './observatorioService.js';

export default async function handler(req: any, res: any) {
  // Configuração de CORS para permitir integração externa do IPPLAN
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      sucesso: false,
      erro: `Método ${req.method} não suportado. Utilize GET.`
    });
    return;
  }

  try {
    const url = req.url || '';
    const query = req.query || {};

    // Extrair parâmetros de query
    const tipo = (query.tipo as string || '').toLowerCase().trim();
    const dataParam = query.data as string | undefined;
    const diasParam = query.dias ? parseInt(query.dias as string, 10) : undefined;

    // Rota 1: Info / Documentação
    if (url.includes('/info') || url.includes('/docs') || tipo === 'info' || tipo === 'docs') {
      res.status(200).json({
        sucesso: true,
        documentacao: obterDocumentacaoObservatorio()
      });
      return;
    }

    // Rota 2: Tempo Real (Mais Atual)
    if (url.includes('/atual') || tipo === 'atual') {
      const dadosAtuais = await obterEstacoesAtuais();
      res.status(200).json({
        sucesso: true,
        tipo: 'tempo_real',
        timestamp: dadosAtuais.timestamp,
        fonte_dados: dadosAtuais.fonte,
        total_estacoes: dadosAtuais.estacoes.length,
        estacoes: dadosAtuais.estacoes
      });
      return;
    }

    // Rota 3: Histórico Diário
    if (url.includes('/diario') || tipo === 'diario') {
      const dias = diasParam || 30;
      const dadosDiarios = await obterSensacaoDiaria(dataParam, dias);
      res.status(200).json({
        sucesso: true,
        tipo: 'historico_diario',
        ...dadosDiarios
      });
      return;
    }

    // Rota 4: Predição Diária Futura
    if (url.includes('/predicao') || tipo === 'predicao') {
      const dias = diasParam || 7;
      const dadosPredicao = await obterPredicaoDiaria(dataParam, dias);
      res.status(200).json({
        sucesso: true,
        tipo: 'predicao_diaria',
        ...dadosPredicao
      });
      return;
    }

    // Rota 5: Todos / Consolidado (ou rota base /api/observatorio)
    if (tipo === 'todos') {
      const [atuais, diarios, predicoes] = await Promise.all([
        obterEstacoesAtuais(),
        obterSensacaoDiaria(dataParam, diasParam || 7),
        obterPredicaoDiaria(dataParam, diasParam || 7)
      ]);

      res.status(200).json({
        sucesso: true,
        tipo: 'consolidado_completo',
        timestamp: new Date().toISOString(),
        atual: {
          timestamp: atuais.timestamp,
          fonte_dados: atuais.fonte,
          total_estacoes: atuais.estacoes.length,
          estacoes: atuais.estacoes
        },
        diario: diarios,
        predicao: predicoes
      });
      return;
    }

    // Caso a rota base seja chamada sem parâmetros específicos, retorna o tempo real por padrão com links úteis
    const dadosAtuais = await obterEstacoesAtuais();
    res.status(200).json({
      sucesso: true,
      mensagem: "API DCCALOR para o Observatório Climático de Fortaleza (IPPLAN)",
      instrucao: "Use ?tipo=atual, ?tipo=diario, ?tipo=predicao, ?tipo=todos ou acesse os sub-endpoints dedicados.",
      documentacao_url: "/api/observatorio/info",
      tipo: 'tempo_real',
      timestamp: dadosAtuais.timestamp,
      fonte_dados: dadosAtuais.fonte,
      total_estacoes: dadosAtuais.estacoes.length,
      estacoes: dadosAtuais.estacoes
    });

  } catch (error: any) {
    console.error("[Observatório API] Erro ao processar requisição:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Falha interna ao processar requisição do Observatório Climático",
      detalhes: error?.message || String(error)
    });
  }
}
