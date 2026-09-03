import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import stationsHandler from './api/stations';
import analyzeHandler from './api/analyze';

// Carregar variáveis de ambiente do .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middleware de parsing de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rota de Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'DCCALOR - Monitoramento Térmico Fortaleza',
    timestamp: new Date().toISOString()
  });
});

// Rotas de API
app.all('/api/stations', async (req, res) => {
  try {
    await stationsHandler(req, res);
  } catch (err: any) {
    console.error('Erro ao processar /api/stations:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro interno ao processar estações', details: err?.message });
    }
  }
});

app.all('/api/analyze', async (req, res) => {
  try {
    await analyzeHandler(req, res);
  } catch (err: any) {
    console.error('Erro ao processar /api/analyze:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro interno ao processar análise', details: err?.message });
    }
  }
});

// Servir arquivos estáticos do frontend (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use('/dccalor', express.static(distPath));

// Fallback para SPA (qualquer rota desconhecida direciona para index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Inicialização do servidor
app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`  DCCALOR - Defesa Civil de Fortaleza               `);
  console.log(`  Servidor de Produção rodando com sucesso!         `);
  console.log(`  Endereço: http://${HOST}:${PORT}                  `);
  console.log(`  Healthcheck: http://${HOST}:${PORT}/api/health    `);
  console.log(`====================================================`);
});
