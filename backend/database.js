const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taxi_system.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
      } else {
        console.log('Conectado ao banco SQLite.');
      }
    });
  }

  // Função para obter data/hora local brasileira
  getBrazilianDateTime() {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    return brazilTime.toISOString().replace('T', ' ').substring(0, 19);
  }

  // Função para formatar data para exibição local
  formatDateForDisplay(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00-03:00'); // Força timezone brasileiro
    return date.toLocaleDateString('pt-BR');
  }

  async initTables() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Tabela de passageiros
        this.db.run(`
          CREATE TABLE IF NOT EXISTS passengers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT,
            neighborhood TEXT,
            city TEXT,
            phone TEXT,
            cost_center TEXT,
            shift TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime', '-3 hours'))
          )
        `);

        // Tabela de solicitações de táxi
        this.db.run(`
          CREATE TABLE IF NOT EXISTS taxi_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            requester TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            time TEXT NOT NULL,
            car_number TEXT,
            cost_center TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT (datetime('now', 'localtime', '-3 hours'))
          )
        `);

        // Tabela de relacionamento entre solicitações e passageiros
        this.db.run(`
          CREATE TABLE IF NOT EXISTS request_passengers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id INTEGER,
            passenger_id INTEGER,
            FOREIGN KEY (request_id) REFERENCES taxi_requests (id),
            FOREIGN KEY (passenger_id) REFERENCES passengers (id)
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Tabelas criadas com sucesso.');
            resolve();
          }
        });
      });
    });
  }

  // Métodos para passageiros
  getAllPassengers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM passengers ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getPassengerById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM passengers WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createPassenger(passenger) {
    return new Promise((resolve, reject) => {
      const { name, address, neighborhood, city, phone, cost_center, shift } = passenger;
      const createdAt = this.getBrazilianDateTime();
      this.db.run(
        'INSERT INTO passengers (name, address, neighborhood, city, phone, cost_center, shift, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, address, neighborhood, city, phone, cost_center, shift, createdAt],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...passenger, created_at: createdAt });
        }
      );
    });
  }

  updatePassenger(id, passenger) {
    return new Promise((resolve, reject) => {
      const { name, address, neighborhood, city, phone, cost_center, shift } = passenger;
      this.db.run(
        'UPDATE passengers SET name = ?, address = ?, neighborhood = ?, city = ?, phone = ?, cost_center = ?, shift = ? WHERE id = ?',
        [name, address, neighborhood, city, phone, cost_center, shift, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...passenger });
        }
      );
    });
  }

  deletePassenger(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM passengers WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }

  // Métodos para solicitações de táxi
  getAllRequests() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          tr.*,
          GROUP_CONCAT(p.name) as passenger_names,
          GROUP_CONCAT(p.id) as passenger_ids,
          GROUP_CONCAT(p.address) as passenger_addresses,
          GROUP_CONCAT(p.neighborhood) as passenger_neighborhoods,
          GROUP_CONCAT(p.city) as passenger_cities,
          GROUP_CONCAT(p.phone) as passenger_phones,
          GROUP_CONCAT(p.cost_center) as passenger_cost_centers,
          GROUP_CONCAT(p.shift) as passenger_shifts
        FROM taxi_requests tr
        LEFT JOIN request_passengers rp ON tr.id = rp.request_id
        LEFT JOIN passengers p ON rp.passenger_id = p.id
        GROUP BY tr.id
        ORDER BY tr.created_at DESC
      `;
      this.db.all(query, (err, rows) => {
        if (err) reject(err);
        else {
          const requests = rows.map(row => {
            const passengerNames = row.passenger_names ? row.passenger_names.split(',') : [];
            const passengerIds = row.passenger_ids ? row.passenger_ids.split(',').map(id => parseInt(id)) : [];
            const passengerAddresses = row.passenger_addresses ? row.passenger_addresses.split(',') : [];
            const passengerNeighborhoods = row.passenger_neighborhoods ? row.passenger_neighborhoods.split(',') : [];
            const passengerCities = row.passenger_cities ? row.passenger_cities.split(',') : [];
            const passengerPhones = row.passenger_phones ? row.passenger_phones.split(',') : [];
            const passengerCostCenters = row.passenger_cost_centers ? row.passenger_cost_centers.split(',') : [];
            const passengerShifts = row.passenger_shifts ? row.passenger_shifts.split(',') : [];

            // Criar array de objetos com dados completos dos passageiros
            const passengersDetails = passengerNames.map((name, index) => ({
              id: passengerIds[index] || '',
              name: name || '',
              address: passengerAddresses[index] || '',
              neighborhood: passengerNeighborhoods[index] || '',
              city: passengerCities[index] || '',
              phone: passengerPhones[index] || '',
              cost_center: passengerCostCenters[index] || '',
              shift: passengerShifts[index] || ''
            }));

            return {
              ...row,
              passengers: passengerNames,
              passengerIds: passengerIds,
              passengersDetails: passengersDetails
            };
          });
          resolve(requests);
        }
      });
    });
  }

  createRequest(request) {
    return new Promise((resolve, reject) => {
      const { date, requester, origin, destination, time, car_number, cost_center, passengerIds } = request;
      const createdAt = this.getBrazilianDateTime();
      const self = this; // Salvar referência para usar dentro do callback
      
      this.db.run(
        'INSERT INTO taxi_requests (date, requester, origin, destination, time, car_number, cost_center, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [date, requester, origin, destination, time, car_number, cost_center, createdAt],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const requestId = this.lastID;
            
            // Adicionar passageiros à solicitação
            if (passengerIds && passengerIds.length > 0) {
              const stmt = self.db.prepare('INSERT INTO request_passengers (request_id, passenger_id) VALUES (?, ?)');
              passengerIds.forEach(passengerId => {
                stmt.run(requestId, passengerId);
              });
              stmt.finalize();
            }
            
            resolve({ id: requestId, ...request, created_at: createdAt });
          }
        }
      );
    });
  }

  updateRequestStatus(id, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE taxi_requests SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, status });
        }
      );
    });
  }

  deleteRequest(id) {
    return new Promise((resolve, reject) => {
      // Primeiro deletar os relacionamentos
      this.db.run('DELETE FROM request_passengers WHERE request_id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          // Depois deletar a solicitação
          this.db.run('DELETE FROM taxi_requests WHERE id = ?', [id], function(err) {
            if (err) reject(err);
            else resolve({ deleted: this.changes });
          });
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar o banco de dados:', err.message);
      } else {
        console.log('Conexão com o banco de dados fechada.');
      }
    });
  }
}

const db = new Database();
module.exports = db;
