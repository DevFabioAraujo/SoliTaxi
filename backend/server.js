require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const emailService = require('./emailService');
const excelService = require('./excelService');
const fileImportService = require('./services/fileImportService');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV, XLS e XLSX são permitidos'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas para passageiros
app.get('/passengers', async (req, res) => {
  try {
    const passengers = await db.getAllPassengers();
    // Formatar datas para exibição local
    const formattedPassengers = passengers.map(passenger => ({
      ...passenger,
      created_at_formatted: passenger.created_at ? new Date(passenger.created_at + ' UTC-3').toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    }));
    // Corrigir codificação dos dados
    const cleanedPassengers = excelService.cleanData(formattedPassengers);
    res.json(cleanedPassengers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/passengers/:id', async (req, res) => {
  try {
    const passenger = await db.getPassengerById(req.params.id);
    if (passenger) {
      res.json(passenger);
    } else {
      res.status(404).json({ error: 'Passageiro não encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/passengers', async (req, res) => {
  try {
    const passenger = await db.createPassenger(req.body);
    res.status(201).json(passenger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/passengers/:id', async (req, res) => {
  try {
    const passenger = await db.updatePassenger(req.params.id, req.body);
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/passengers/:id', async (req, res) => {
  try {
    const result = await db.deletePassenger(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas para solicitações de táxi
app.get('/requests', async (req, res) => {
  try {
    const requests = await db.getAllRequests();
    // Formatar datas para exibição local
    const formattedRequests = requests.map(request => ({
      ...request,
      created_at_formatted: request.created_at ? new Date(request.created_at + ' UTC-3').toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    }));
    // Corrigir codificação dos dados
    const cleanedRequests = excelService.cleanData(formattedRequests);
    res.json(cleanedRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/requests', async (req, res) => {
  try {
    const request = await db.createRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.updateRequestStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/requests/:id', async (req, res) => {
  try {
    const result = await db.deleteRequest(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para importar dados do CSV (mantida para compatibilidade)
app.post('/import/passengers', async (req, res) => {
  try {
    const { passengers } = req.body;
    const results = [];
    
    for (const passengerData of passengers) {
      if (passengerData.name && passengerData.name.trim()) {
        const passenger = await db.createPassenger({
          name: passengerData.name.trim(),
          address: passengerData.address || '',
          neighborhood: passengerData.neighborhood || '',
          city: passengerData.city || '',
          phone: passengerData.phone || '',
          cost_center: passengerData.cost_center || '',
          shift: passengerData.shift || '',
          area: passengerData.area || 'RCB'
        });
        results.push(passenger);
      }
    }
    
    res.json({ 
      message: `${results.length} passageiros importados com sucesso`,
      imported: results 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nova rota para upload e importação de arquivos
app.post('/import/passengers/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const filePath = req.file.path;
    
    try {
      // Processar arquivo
      const result = await fileImportService.processFile(filePath);
      
      if (result.valid.length === 0) {
        return res.status(400).json({
          error: 'Nenhum passageiro válido encontrado no arquivo',
          invalid: result.invalid,
          summary: result.summary
        });
      }

      // Verificar duplicatas
      const existingPassengers = await db.getAllPassengers();
      const duplicateCheck = fileImportService.checkDuplicates(result.valid, existingPassengers);

      // Importar apenas passageiros únicos
      const imported = [];
      for (const passengerData of duplicateCheck.unique) {
        const passenger = await db.createPassenger(passengerData);
        imported.push(passenger);
      }

      res.json({
        success: true,
        message: `${imported.length} passageiros importados com sucesso`,
        imported: imported,
        duplicates: duplicateCheck.duplicates,
        invalid: result.invalid,
        summary: {
          total: result.summary.total,
          imported: imported.length,
          duplicates: duplicateCheck.duplicates.length,
          invalid: result.summary.invalid
        }
      });

    } finally {
      // Limpar arquivo temporário
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

  } catch (error) {
    console.error('Erro ao importar arquivo:', error);
    
    // Limpar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar arquivo',
      message: error.message 
    });
  }
});

// Rota para preview do arquivo antes da importação
app.post('/import/passengers/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const filePath = req.file.path;
    
    try {
      // Processar arquivo para preview
      const result = await fileImportService.processFile(filePath);
      
      // Verificar duplicatas
      const existingPassengers = await db.getAllPassengers();
      const duplicateCheck = fileImportService.checkDuplicates(result.valid, existingPassengers);

      res.json({
        success: true,
        preview: {
          valid: result.valid.slice(0, 10), // Mostrar apenas os primeiros 10 para preview
          invalid: result.invalid,
          duplicates: duplicateCheck.duplicates,
          summary: {
            total: result.summary.total,
            valid: result.summary.valid,
            invalid: result.summary.invalid,
            duplicates: duplicateCheck.duplicates.length,
            unique: duplicateCheck.unique.length
          }
        }
      });

    } finally {
      // Limpar arquivo temporário
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

  } catch (error) {
    console.error('Erro ao fazer preview do arquivo:', error);
    
    // Limpar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar arquivo para preview',
      message: error.message 
    });
  }
});

// Rotas para exportação e email
app.post('/export/requests', async (req, res) => {
  try {
    const { email, filters = {} } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email de destino é obrigatório' });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Buscar todas as solicitações
    const requests = await db.getAllRequests();
    
    // Formatar datas para exibição local
    const formattedRequests = requests.map(request => ({
      ...request,
      created_at_formatted: request.created_at ? new Date(request.created_at + ' UTC-3').toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    }));

    // Exportar e enviar por email
    const result = await emailService.exportAndSendRequests(formattedRequests, email, filters);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao exportar e enviar solicitações:', error);
    
    // Verificar se é erro de configuração de email
    if (error.message.includes('Email não configurado')) {
      return res.status(400).json({ 
        error: 'Email não configurado',
        message: 'Configure as variáveis EMAIL_USER e EMAIL_PASS no arquivo .env',
        suggestion: 'Para Gmail, você precisa usar uma SENHA DE APLICATIVO. Veja o arquivo .env.example para instruções.'
      });
    }
    
    // Verificar se é erro de autenticação
    if (error.message.includes('SENHA DE APLICATIVO')) {
      return res.status(400).json({ 
        error: 'Erro de autenticação de email',
        message: error.message,
        suggestion: 'Gere uma senha de aplicativo do Gmail e atualize o arquivo .env'
      });
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Rota para download direto do Excel
app.post('/export/download', async (req, res) => {
  try {
    const { filters = {} } = req.body;

    // Buscar todas as solicitações
    const requests = await db.getAllRequests();
    
    // Formatar datas para exibição local
    const formattedRequests = requests.map(request => ({
      ...request,
      created_at_formatted: request.created_at ? new Date(request.created_at + ' UTC-3').toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    }));

    // Aplicar filtros
    let filteredRequests = formattedRequests;
    
    if (filters.status && filters.status !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === filters.status);
    }
    
    if (filters.dateFrom) {
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.date) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.dateTo) {
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.date) <= new Date(filters.dateTo)
      );
    }

    // Gerar Excel usando o excelService
    const excelService = require('./excelService');
    const excelBuffer = await excelService.generateExcelBuffer(filteredRequests);
    
    // Gerar nome do arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `solicitacoes_taxi_${timestamp}.xlsx`;
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    // Enviar buffer do Excel
    res.end(excelBuffer);
    
  } catch (error) {
    console.error('Erro ao gerar Excel para download:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});


// Rota para testar configuração de email
app.get('/test-email', async (req, res) => {
  try {
    const result = await emailService.testEmailConfiguration();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao testar configuração de email',
      message: error.message 
    });
  }
});

// Rota para enviar email de teste
app.post('/test-email/send', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email de destino é obrigatório' });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    const result = await emailService.sendTestEmail(email);
    res.json({
      success: true,
      message: `Email de teste enviado com sucesso para ${email}`,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({ 
      error: 'Erro ao enviar email de teste',
      message: error.message 
    });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Solicitação de Táxi funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nFechando servidor...');
  db.close();
  process.exit(0);
});
