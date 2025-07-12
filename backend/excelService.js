const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelService {
  constructor() {
    // Criar diretório exports se não existir
    this.exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  async generateExcel(requests, filename = 'solicitacoes_taxi.xlsx') {
    const filePath = path.join(this.exportsDir, filename);
    
    // Limpar dados de codificação antes de processar
    const cleanedRequests = requests.map(request => this.cleanData(request));
    
    // Criar workbook e worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitações de Táxi');

    // Configurar largura das colunas
    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 25 },
      { header: 'Endereço', key: 'address', width: 35 },
      { header: 'Bairro', key: 'neighborhood', width: 20 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Centro de Custo', key: 'cost_center', width: 18 },
      { header: 'Turno', key: 'shift', width: 15 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Horário', key: 'time', width: 10 },
      { header: 'Origem', key: 'origin', width: 25 },
      { header: 'Destino', key: 'destination', width: 25 }
    ];

    // Estilo para cabeçalho principal
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Estilo para linha do carro
    const carHeaderStyle = {
      font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9534F' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      }
    };

    // Estilo para dados dos passageiros
    const passengerStyle = {
      font: { size: 11 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Adicionar cabeçalho principal
    const headerRow = worksheet.getRow(1);
    headerRow.values = ['Nome', 'Endereço', 'Bairro', 'Cidade', 'Telefone', 'Centro de Custo', 'Turno', 'Data', 'Horário', 'Origem', 'Destino'];
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    let currentRow = 2;

    // Agrupar solicitações por carro
    const requestsByCar = this.groupRequestsByCar(cleanedRequests);

    // Processar cada carro
    Object.keys(requestsByCar).forEach((carNumber, carIndex) => {
      const carRequests = requestsByCar[carNumber];
      
      // Adicionar informações do solicitante primeiro
      if (carRequests.length > 0) {
        const firstRequest = carRequests[0];
        const requesterRow = worksheet.getRow(currentRow);
        requesterRow.values = [`Solicitante: ${firstRequest.requester || 'N/A'} | Data: ${this.formatDate(firstRequest.date)} | Horário: ${firstRequest.time || 'N/A'} | ${firstRequest.origin || 'N/A'} → ${firstRequest.destination || 'N/A'}`, '', '', '', '', '', '', '', '', '', ''];
        
        // Mesclar células para as informações do solicitante
        worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
        
        // Estilo para linha do solicitante
        requesterRow.getCell(1).style = {
          font: { bold: true, size: 11, color: { argb: '000000' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F4FD' } },
          alignment: { horizontal: 'left', vertical: 'middle' },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
        requesterRow.height = 25;
        currentRow++;
      }
      
      // Adicionar linha do carro
      const carRow = worksheet.getRow(currentRow);
      const carLabel = carNumber || `CARRO ${carIndex + 1}`;
      carRow.values = [carLabel, '', '', '', '', '', '', '', '', '', ''];
      
      // Mesclar células para o nome do carro
      worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
      
      // Aplicar estilo ao cabeçalho do carro
      carRow.eachCell((cell) => {
        cell.style = carHeaderStyle;
      });
      carRow.height = 30;
      
      currentRow++;

      // Adicionar linha de cabeçalho das colunas abaixo do carro
      const carHeaderRow = worksheet.getRow(currentRow);
      carHeaderRow.values = ['Nome', 'Endereço', 'Bairro', 'Cidade', 'Telefone', 'Centro de Custo', 'Turno', 'Data', 'Horário', 'Origem', 'Destino'];
      carHeaderRow.eachCell((cell) => {
        cell.style = {
          font: { bold: true, size: 10, color: { argb: 'FFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '6C757D' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      });
      carHeaderRow.height = 20;
      
      currentRow++;

      // Adicionar passageiros deste carro
      carRequests.forEach(request => {
        const passengersDetails = request.passengersDetails || [];
        
        if (passengersDetails.length === 0) {
          // Se não há passageiros específicos, adicionar linha com dados da solicitação
          const row = worksheet.getRow(currentRow);
          row.values = [
            request.requester || 'N/A',
            request.origin || 'N/A',
            '',
            '',
            '',
            request.cost_center || 'N/A',
            '',
            this.formatDate(request.date),
            request.time || 'N/A',
            request.origin || 'N/A',
            request.destination || 'N/A'
          ];
          
          row.eachCell((cell) => {
            cell.style = passengerStyle;
          });
          row.height = 20;
          currentRow++;
        } else {
          // Adicionar cada passageiro
          passengersDetails.forEach(passenger => {
            const row = worksheet.getRow(currentRow);
            row.values = [
              passenger.name || 'N/A',
              passenger.address || 'N/A',
              passenger.neighborhood || 'N/A',
              passenger.city || 'N/A',
              passenger.phone || 'N/A',
              passenger.cost_center || 'N/A',
              passenger.shift || 'N/A',
              this.formatDate(request.date),
              request.time || 'N/A',
              request.origin || 'N/A',
              request.destination || 'N/A'
            ];
            
            row.eachCell((cell) => {
              cell.style = passengerStyle;
            });
            row.height = 20;
            currentRow++;
          });
        }
      });

      // Adicionar linha em branco entre carros (exceto no último)
      if (carIndex < Object.keys(requestsByCar).length - 1) {
        currentRow++;
      }
    });

    // Adicionar informações de resumo no final
    currentRow += 2;
    const summaryRow = worksheet.getRow(currentRow);
    summaryRow.values = [`Relatório gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, '', '', '', '', '', '', '', '', '', ''];
    worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    summaryRow.getCell(1).style = {
      font: { italic: true, size: 10 },
      alignment: { horizontal: 'center' }
    };

    currentRow++;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.values = [`Total de solicitações: ${requests.length}`, '', '', '', '', '', '', '', '', '', ''];
    worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    totalRow.getCell(1).style = {
      font: { bold: true, size: 10 },
      alignment: { horizontal: 'center' }
    };

    // Salvar arquivo
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  groupRequestsByCar(requests) {
    const grouped = {};
    
    requests.forEach(request => {
      const carNumber = this.fixEncoding(request.car_number) || 'SEM CARRO DEFINIDO';
      
      if (!grouped[carNumber]) {
        grouped[carNumber] = [];
      }
      
      grouped[carNumber].push(request);
    });

    return grouped;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      // Garantir que a data seja interpretada como horário local brasileiro
      const date = new Date(dateString + 'T00:00:00-03:00');
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }

  translateStatus(status) {
    const statusMap = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  // Função para corrigir caracteres com acentuação
  fixEncoding(text) {
    if (!text || typeof text !== 'string') return text;
    
    let fixedText = text;
    
    // Correções mais comuns de codificação UTF-8
    fixedText = fixedText.replace(/Ã¡/g, 'á');
    fixedText = fixedText.replace(/Ã /g, 'à');
    fixedText = fixedText.replace(/Ã¢/g, 'â');
    fixedText = fixedText.replace(/Ã£/g, 'ã');
    fixedText = fixedText.replace(/Ã©/g, 'é');
    fixedText = fixedText.replace(/Ã¨/g, 'è');
    fixedText = fixedText.replace(/Ãª/g, 'ê');
    fixedText = fixedText.replace(/Ã­/g, 'í');
    fixedText = fixedText.replace(/Ã³/g, 'ó');
    fixedText = fixedText.replace(/Ã²/g, 'ò');
    fixedText = fixedText.replace(/Ã´/g, 'ô');
    fixedText = fixedText.replace(/Ãµ/g, 'õ');
    fixedText = fixedText.replace(/Ãº/g, 'ú');
    fixedText = fixedText.replace(/Ã¹/g, 'ù');
    fixedText = fixedText.replace(/Ã§/g, 'ç');
    fixedText = fixedText.replace(/Ã‡/g, 'Ç');
    
    // Maiúsculas
    fixedText = fixedText.replace(/Ã‰/g, 'É');
    fixedText = fixedText.replace(/Ã"/g, 'Ó');
    fixedText = fixedText.replace(/Ã/g, 'Á');
    fixedText = fixedText.replace(/Ã/g, 'À');
    fixedText = fixedText.replace(/Ã‚/g, 'Â');
    fixedText = fixedText.replace(/Ãƒ/g, 'Ã');
    fixedText = fixedText.replace(/ÃŠ/g, 'Ê');
    fixedText = fixedText.replace(/Ã/g, 'Í');
    fixedText = fixedText.replace(/Ã"/g, 'Ô');
    fixedText = fixedText.replace(/Ã•/g, 'Õ');
    fixedText = fixedText.replace(/Ãš/g, 'Ú');
    
    // Correções adicionais para caracteres problemáticos específicos
    fixedText = fixedText.replace(/�/g, 'ô'); // � -> ô
    fixedText = fixedText.replace(/Ã¼/g, 'ü'); // Ã¼ -> ü
    fixedText = fixedText.replace(/Ã¶/g, 'ö'); // Ã¶ -> ö
    
    // Correções específicas para palavras e nomes comuns problemáticos
    fixedText = fixedText.replace(/COL�NIA/g, 'COLÔNIA');
    fixedText = fixedText.replace(/IP�S/g, 'IPÊS');
    fixedText = fixedText.replace(/C�LIO/g, 'CÉLIO');
    fixedText = fixedText.replace(/TAUBAT�/g, 'TAUBATÉ');
    fixedText = fixedText.replace(/JACARE�/g, 'JACAREÍ');
    fixedText = fixedText.replace(/COMERCI�RIOS/g, 'COMERCIÁRIOS');
    fixedText = fixedText.replace(/GON�ALO/g, 'GONÇALO');
    fixedText = fixedText.replace(/CA�APAVA/g, 'CAÇAPAVA');
    fixedText = fixedText.replace(/ISM�NIA/g, 'ISMÊNIA');
    fixedText = fixedText.replace(/J�LIA/g, 'JÚLIA');
    fixedText = fixedText.replace(/EUCAL�PTOS/g, 'EUCALIPTOS');
    fixedText = fixedText.replace(/JOS�/g, 'JOSÉ');
    fixedText = fixedText.replace(/S�telite/g, 'Satélite');
    fixedText = fixedText.replace(/Magalh�es/g, 'Magalhães');
    fixedText = fixedText.replace(/Tubar�o/g, 'Tubarão');
    fixedText = fixedText.replace(/S�o/g, 'São');
    fixedText = fixedText.replace(/Geraldo/g, 'Geraldo');
    
    // Correções adicionais baseadas nos dados vistos
    fixedText = fixedText.replace(/JD\. COL�NIA/g, 'JD. COLÔNIA');
    fixedText = fixedText.replace(/BOSQUE DOS IP�S/g, 'BOSQUE DOS IPÊS');
    fixedText = fixedText.replace(/C�LIO RODRIGO/g, 'CÉLIO RODRIGO');
    fixedText = fixedText.replace(/VILA DOS COMERCI�RIOS/g, 'VILA DOS COMERCIÁRIOS');
    fixedText = fixedText.replace(/S�O GON�ALO/g, 'SÃO GONÇALO');
    fixedText = fixedText.replace(/CA�APAVA/g, 'CAÇAPAVA');
    fixedText = fixedText.replace(/JARDIM ISM�NIA/g, 'JARDIM ISMÊNIA');
    fixedText = fixedText.replace(/JARDIM SANTA J�LIA/g, 'JARDIM SANTA JÚLIA');
    fixedText = fixedText.replace(/BOSQUE DOS EUCAL�PTOS/g, 'BOSQUE DOS EUCALIPTOS');
    fixedText = fixedText.replace(/PALMEIRAS DE S�O JOS�/g, 'PALMEIRAS DE SÃO JOSÉ');
    fixedText = fixedText.replace(/JD ISM�NIA/g, 'JD ISMÊNIA');
    fixedText = fixedText.replace(/Jd S�telite/g, 'Jd Satélite');
    fixedText = fixedText.replace(/Vila S�o Geraldo/g, 'Vila São Geraldo');
    
    // Correções para caracteres isolados mais comuns
    fixedText = fixedText.replace(/�/g, 'ã');
    fixedText = fixedText.replace(/�/g, 'ç');
    fixedText = fixedText.replace(/�/g, 'é');
    fixedText = fixedText.replace(/�/g, 'í');
    fixedText = fixedText.replace(/�/g, 'ó');
    fixedText = fixedText.replace(/�/g, 'ú');
    fixedText = fixedText.replace(/�/g, 'â');
    fixedText = fixedText.replace(/�/g, 'ê');
    fixedText = fixedText.replace(/�/g, 'ô');
    fixedText = fixedText.replace(/�/g, 'õ');
    
    // Tentar decodificar UTF-8 mal interpretado
    try {
      if (fixedText.includes('%')) {
        fixedText = decodeURIComponent(fixedText);
      }
    } catch (e) {
      // Se falhar, manter o texto original
    }

    return fixedText;
  }

  // Função para limpar e corrigir todos os dados de um objeto
  cleanData(obj) {
    if (!obj) return obj;
    
    // Se for um array, processar cada item
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanData(item));
    }
    
    // Se for um objeto, processar cada propriedade
    if (typeof obj === 'object' && obj !== null) {
      const cleaned = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value === 'string') {
          cleaned[key] = this.fixEncoding(value);
        } else if (Array.isArray(value)) {
          cleaned[key] = value.map(item => 
            typeof item === 'object' ? this.cleanData(item) : 
            typeof item === 'string' ? this.fixEncoding(item) : item
          );
        } else if (typeof value === 'object' && value !== null) {
          cleaned[key] = this.cleanData(value);
        } else {
          cleaned[key] = value;
        }
      });
      return cleaned;
    }
    
    // Se for string, aplicar correção
    if (typeof obj === 'string') {
      return this.fixEncoding(obj);
    }
    
    // Para outros tipos, retornar como está
    return obj;
  }

  // Método para gerar Excel em buffer (para envio por email)
  async generateExcelBuffer(requests) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitações de Táxi');

    // Usar a mesma lógica de geração, mas retornar buffer
    // (Reutilizando a lógica do método generateExcel)
    
    // Configurar largura das colunas
    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 25 },
      { header: 'Endereço', key: 'address', width: 35 },
      { header: 'Bairro', key: 'neighborhood', width: 20 },
      { header: 'Cidade', key: 'city', width: 20 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Centro de Custo', key: 'cost_center', width: 18 },
      { header: 'Turno', key: 'shift', width: 15 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Horário', key: 'time', width: 10 },
      { header: 'Origem', key: 'origin', width: 25 },
      { header: 'Destino', key: 'destination', width: 25 }
    ];

    // Estilos
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const carHeaderStyle = {
      font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9534F' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' }
      }
    };

    const passengerStyle = {
      font: { size: 11 },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Adicionar cabeçalho principal
    const headerRow = worksheet.getRow(1);
    headerRow.values = ['Nome', 'Endereço', 'Bairro', 'Cidade', 'Telefone', 'Centro de Custo', 'Turno', 'Data', 'Horário', 'Origem', 'Destino'];
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });
    headerRow.height = 25;

    let currentRow = 2;

    // Agrupar solicitações por carro
    const requestsByCar = this.groupRequestsByCar(requests);

    // Processar cada carro
    Object.keys(requestsByCar).forEach((carNumber, carIndex) => {
      const carRequests = requestsByCar[carNumber];
      
      // Adicionar informações do solicitante primeiro
      if (carRequests.length > 0) {
        const firstRequest = carRequests[0];
        const requesterRow = worksheet.getRow(currentRow);
        requesterRow.values = [`Solicitante: ${firstRequest.requester || 'N/A'} | Data: ${this.formatDate(firstRequest.date)} | Horário: ${firstRequest.time || 'N/A'} | ${firstRequest.origin || 'N/A'} → ${firstRequest.destination || 'N/A'}`, '', '', '', '', '', '', '', '', '', ''];
        
        // Mesclar células para as informações do solicitante
        worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
        
        // Estilo para linha do solicitante
        requesterRow.getCell(1).style = {
          font: { bold: true, size: 11, color: { argb: '000000' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F4FD' } },
          alignment: { horizontal: 'left', vertical: 'middle' },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
        requesterRow.height = 25;
        currentRow++;
      }
      
      // Adicionar linha do carro
      const carRow = worksheet.getRow(currentRow);
      const carLabel = carNumber || `CARRO ${carIndex + 1}`;
      carRow.values = [carLabel, '', '', '', '', '', '', '', '', '', ''];
      
      // Mesclar células para o nome do carro
      worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
      
      // Aplicar estilo ao cabeçalho do carro
      carRow.eachCell((cell) => {
        cell.style = carHeaderStyle;
      });
      carRow.height = 30;
      
      currentRow++;

      // Adicionar linha de cabeçalho das colunas abaixo do carro
      const carHeaderRow = worksheet.getRow(currentRow);
      carHeaderRow.values = ['Nome', 'Endereço', 'Bairro', 'Cidade', 'Telefone', 'Centro de Custo', 'Turno', 'Data', 'Horário', 'Origem', 'Destino'];
      carHeaderRow.eachCell((cell) => {
        cell.style = {
          font: { bold: true, size: 10, color: { argb: 'FFFFFF' } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '6C757D' } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      });
      carHeaderRow.height = 20;
      
      currentRow++;

      // Adicionar passageiros deste carro
      carRequests.forEach(request => {
        const passengersDetails = request.passengersDetails || [];
        
        if (passengersDetails.length === 0) {
          // Se não há passageiros específicos, adicionar linha com dados da solicitação
          const row = worksheet.getRow(currentRow);
          row.values = [
            request.requester || 'N/A',
            request.origin || 'N/A',
            '',
            '',
            '',
            request.cost_center || 'N/A',
            '',
            this.formatDate(request.date),
            request.time || 'N/A',
            request.origin || 'N/A',
            request.destination || 'N/A'
          ];
          
          row.eachCell((cell) => {
            cell.style = passengerStyle;
          });
          row.height = 20;
          currentRow++;
        } else {
          // Adicionar cada passageiro
          passengersDetails.forEach(passenger => {
            const row = worksheet.getRow(currentRow);
            row.values = [
              passenger.name || 'N/A',
              passenger.address || 'N/A',
              passenger.neighborhood || 'N/A',
              passenger.city || 'N/A',
              passenger.phone || 'N/A',
              passenger.cost_center || 'N/A',
              passenger.shift || 'N/A',
              this.formatDate(request.date),
              request.time || 'N/A',
              request.origin || 'N/A',
              request.destination || 'N/A'
            ];
            
            row.eachCell((cell) => {
              cell.style = passengerStyle;
            });
            row.height = 20;
            currentRow++;
          });
        }
      });

      // Adicionar linha em branco entre carros (exceto no último)
      if (carIndex < Object.keys(requestsByCar).length - 1) {
        currentRow++;
      }
    });

    // Adicionar informações de resumo no final
    currentRow += 2;
    const summaryRow = worksheet.getRow(currentRow);
    summaryRow.values = [`Relatório gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, '', '', '', '', '', '', '', '', '', ''];
    worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    summaryRow.getCell(1).style = {
      font: { italic: true, size: 10 },
      alignment: { horizontal: 'center' }
    };

    currentRow++;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.values = [`Total de solicitações: ${requests.length}`, '', '', '', '', '', '', '', '', '', ''];
    worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    totalRow.getCell(1).style = {
      font: { bold: true, size: 10 },
      alignment: { horizontal: 'center' }
    };

    // Retornar buffer
    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new ExcelService();
