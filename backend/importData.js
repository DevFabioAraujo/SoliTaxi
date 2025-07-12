const db = require('./database');
const fs = require('fs');
const path = require('path');

// Função para importar passageiros do CSV
async function importPassengersFromCSV() {
  try {
    // Garantir que as tabelas existam
    await db.initTables();
    
    const csvPath = path.join(__dirname, '..', 'Solicitação Taxi.CSV');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const lines = csvContent.split('\n');
    const imported = [];
    
    for (let i = 2; i < lines.length; i++) { // Pular cabeçalho e primeira linha vazia
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      
      // Verificar se tem dados válidos
      if (columns.length >= 8 && columns[1] && columns[1].trim()) {
        const passengerData = {
          name: columns[1].trim(),
          address: columns[2] ? columns[2].trim() : '',
          neighborhood: columns[3] ? columns[3].trim() : '',
          city: columns[4] ? columns[4].trim() : '',
          phone: columns[5] ? columns[5].trim() : '',
          cost_center: columns[6] ? columns[6].trim() : '',
          shift: columns[7] ? columns[7].trim() : ''
        };
        
        // Verificar se o passageiro já existe
        const existingPassengers = await db.getAllPassengers();
        const exists = existingPassengers.find(p => p.name.toLowerCase() === passengerData.name.toLowerCase());
        
        if (!exists) {
          const passenger = await db.createPassenger(passengerData);
          imported.push(passenger);
          console.log(`Importado: ${passengerData.name}`);
        } else {
          console.log(`Já existe: ${passengerData.name}`);
        }
      }
    }
    
    console.log(`\nImportação concluída: ${imported.length} passageiros importados`);
    return imported;
    
  } catch (error) {
    console.error('Erro ao importar passageiros:', error);
    throw error;
  }
}

// Função para criar dados de exemplo de solicitações
async function createSampleRequests() {
  try {
    const passengers = await db.getAllPassengers();
    
    if (passengers.length === 0) {
      console.log('Nenhum passageiro encontrado. Importe os passageiros primeiro.');
      return;
    }
    
    const sampleRequests = [
      {
        date: '2024-01-15',
        requester: 'FABIO ARAUJO',
        origin: 'CASA',
        destination: 'ERICSSON',
        time: '14:00',
        car_number: 'Carro 1',
        cost_center: '4088',
        passengerIds: passengers.slice(0, 3).map(p => p.id)
      },
      {
        date: '2024-01-15',
        requester: 'FABIO ARAUJO',
        origin: 'ERICSSON',
        destination: 'CASA',
        time: '18:00',
        car_number: 'Carro 2',
        cost_center: '4088',
        passengerIds: passengers.slice(3, 6).map(p => p.id)
      },
      {
        date: '2024-01-16',
        requester: 'FABIO ARAUJO',
        origin: 'CASA',
        destination: 'ERICSSON',
        time: '07:00',
        car_number: 'Carro 3',
        cost_center: '4088',
        passengerIds: passengers.slice(6, 10).map(p => p.id)
      }
    ];
    
    const created = [];
    for (const requestData of sampleRequests) {
      const request = await db.createRequest(requestData);
      created.push(request);
      console.log(`Solicitação criada: ${requestData.origin} -> ${requestData.destination} às ${requestData.time}`);
    }
    
    console.log(`\n${created.length} solicitações de exemplo criadas`);
    return created;
    
  } catch (error) {
    console.error('Erro ao criar solicitações de exemplo:', error);
    throw error;
  }
}

// Executar importação se chamado diretamente
if (require.main === module) {
  async function runImport() {
    try {
      console.log('Iniciando importação de dados...\n');
      
      // Importar passageiros
      await importPassengersFromCSV();
      
      // Criar solicitações de exemplo
      await createSampleRequests();
      
      console.log('\nImportação concluída com sucesso!');
      process.exit(0);
    } catch (error) {
      console.error('Erro durante a importação:', error);
      process.exit(1);
    }
  }
  
  runImport();
}

module.exports = {
  importPassengersFromCSV,
  createSampleRequests
};
