const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class FileImportService {
  constructor() {
    this.validAreas = ['Produção', 'Warehouse', 'RCB', 'SAR'];
  }

  // Processar arquivo CSV
  processCSV(filePath) {
    try {
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      const lines = csvContent.split('\n');
      const passengers = [];

      // Assumir que a primeira linha é o cabeçalho
      const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(';');
        
        if (columns.length >= headers.length && columns[0] && columns[0].trim()) {
          const passenger = this.mapColumnsToPassenger(headers, columns);
          if (passenger.name) {
            passengers.push(passenger);
          }
        }
      }

      return passengers;
    } catch (error) {
      throw new Error(`Erro ao processar CSV: ${error.message}`);
    }
  }

  // Processar arquivo Excel
  processExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Arquivo Excel deve ter pelo menos 2 linhas (cabeçalho + dados)');
      }

      const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
      const passengers = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const passenger = this.mapColumnsToPassenger(headers, row);
        if (passenger.name) {
          passengers.push(passenger);
        }
      }

      return passengers;
    } catch (error) {
      throw new Error(`Erro ao processar Excel: ${error.message}`);
    }
  }

  // Mapear colunas para objeto passageiro
  mapColumnsToPassenger(headers, columns) {
    const passenger = {
      name: '',
      address: '',
      neighborhood: '',
      city: '',
      phone: '',
      cost_center: '',
      shift: '',
      area: 'RCB' // Default
    };

    // Mapeamento flexível de colunas
    const columnMapping = {
      'nome': 'name',
      'name': 'name',
      'endereco': 'address',
      'endereço': 'address',
      'address': 'address',
      'bairro': 'neighborhood',
      'neighborhood': 'neighborhood',
      'cidade': 'city',
      'city': 'city',
      'telefone': 'phone',
      'phone': 'phone',
      'centro_custo': 'cost_center',
      'centro de custo': 'cost_center',
      'cost_center': 'cost_center',
      'turno': 'shift',
      'shift': 'shift',
      'area': 'area',
      'área': 'area'
    };

    headers.forEach((header, index) => {
      const mappedField = columnMapping[header];
      if (mappedField && columns[index] !== undefined) {
        passenger[mappedField] = String(columns[index]).trim();
      }
    });

    // Validar e normalizar área
    if (passenger.area && !this.validAreas.includes(passenger.area)) {
      // Tentar encontrar área similar
      const normalizedArea = this.normalizeArea(passenger.area);
      passenger.area = normalizedArea || 'RCB';
    }

    return passenger;
  }

  // Normalizar nome da área
  normalizeArea(area) {
    const areaLower = area.toLowerCase().trim();
    
    const areaMap = {
      'producao': 'Produção',
      'produção': 'Produção',
      'production': 'Produção',
      'warehouse': 'Warehouse',
      'armazem': 'Warehouse',
      'armazém': 'Warehouse',
      'rcb': 'RCB',
      'sar': 'SAR'
    };

    return areaMap[areaLower] || null;
  }

  // Validar dados do passageiro
  validatePassenger(passenger) {
    const errors = [];

    if (!passenger.name || passenger.name.trim().length < 2) {
      errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
    }

    if (passenger.area && !this.validAreas.includes(passenger.area)) {
      errors.push(`Área deve ser uma das seguintes: ${this.validAreas.join(', ')}`);
    }

    return errors;
  }

  // Processar arquivo baseado na extensão
  async processFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    let passengers = [];
    
    switch (ext) {
      case '.csv':
        passengers = this.processCSV(filePath);
        break;
      case '.xlsx':
      case '.xls':
        passengers = this.processExcel(filePath);
        break;
      default:
        throw new Error('Formato de arquivo não suportado. Use CSV, XLS ou XLSX');
    }

    // Validar todos os passageiros
    const validationResults = passengers.map((passenger, index) => ({
      index: index + 1,
      passenger,
      errors: this.validatePassenger(passenger)
    }));

    const validPassengers = validationResults
      .filter(result => result.errors.length === 0)
      .map(result => result.passenger);

    const invalidPassengers = validationResults
      .filter(result => result.errors.length > 0);

    return {
      valid: validPassengers,
      invalid: invalidPassengers,
      summary: {
        total: passengers.length,
        valid: validPassengers.length,
        invalid: invalidPassengers.length
      }
    };
  }

  // Verificar duplicatas
  checkDuplicates(passengers, existingPassengers) {
    const duplicates = [];
    const unique = [];

    passengers.forEach(passenger => {
      const isDuplicate = existingPassengers.some(existing => 
        existing.name.toLowerCase().trim() === passenger.name.toLowerCase().trim() &&
        existing.area === passenger.area
      );

      if (isDuplicate) {
        duplicates.push(passenger);
      } else {
        unique.push(passenger);
      }
    });

    return { unique, duplicates };
  }
}

module.exports = new FileImportService();
