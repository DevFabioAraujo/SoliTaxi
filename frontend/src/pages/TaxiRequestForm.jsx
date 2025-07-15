import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TaxiRequestForm() {
  const [form, setForm] = useState({
    date: '',
    requester: '',
    origin: '',
    destination: 'ERICSSON',
    time: '',
    car_number: '',
    cost_center: '4088',
    passengerIds: []
  });

  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedArea, setSelectedArea] = useState('all');

  const areas = ['Produção', 'Warehouse', 'RCB', 'SAR'];

  useEffect(() => {
    fetchPassengers();
    // Definir data atual como padrão (horário local brasileiro)
    const today = new Date();
    const brazilDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const formattedDate = brazilDate.toISOString().split('T')[0];
    setForm(prev => ({ ...prev, date: formattedDate }));
  }, []);

  const fetchPassengers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/passengers');
      setPassengers(response.data);
      setFilteredPassengers(response.data);
    } catch (error) {
      console.error('Erro ao buscar passageiros:', error);
      alert('Erro ao carregar passageiros');
    }
  };

  const handleAreaChange = (area) => {
    setSelectedArea(area);
    
    if (area === 'all') {
      setFilteredPassengers(passengers);
    } else {
      const filtered = passengers.filter(passenger => passenger.area === area);
      setFilteredPassengers(filtered);
    }
    
    // Limpar passageiros selecionados quando mudar de área
    setSelectedPassengers([]);
    setForm(prev => ({ ...prev, passengerIds: [] }));
  };

  const getAreaBadgeColor = (area) => {
    const colors = {
      'Produção': 'bg-blue-100 text-blue-800',
      'Warehouse': 'bg-green-100 text-green-800',
      'RCB': 'bg-purple-100 text-purple-800',
      'SAR': 'bg-orange-100 text-orange-800'
    };
    return colors[area] || 'bg-gray-100 text-gray-800';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePassengerSelect = (passengerId) => {
    const passenger = filteredPassengers.find(p => p.id === parseInt(passengerId));
    if (!passenger) return;

    if (selectedPassengers.find(p => p.id === passenger.id)) {
      // Remove passageiro se já estiver selecionado
      setSelectedPassengers(prev => prev.filter(p => p.id !== passenger.id));
      setForm(prev => ({
        ...prev,
        passengerIds: prev.passengerIds.filter(id => id !== passenger.id)
      }));
    } else if (selectedPassengers.length < 4) {
      // Adiciona passageiro se não exceder o limite
      setSelectedPassengers(prev => [...prev, passenger]);
      setForm(prev => ({
        ...prev,
        passengerIds: [...prev.passengerIds, passenger.id]
      }));
    } else {
      alert('Máximo de 4 passageiros por táxi');
    }
  };

  const removePassenger = (passengerId) => {
    setSelectedPassengers(prev => prev.filter(p => p.id !== passengerId));
    setForm(prev => ({
      ...prev,
      passengerIds: prev.passengerIds.filter(id => id !== passengerId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPassengers.length === 0) {
      alert('Selecione pelo menos um passageiro');
      return;
    }

    setLoading(true);

    try {
      await axios.post('http://localhost:3001/requests', form);
      alert('Solicitação enviada com sucesso!');
      
      // Reset form
      const today = new Date();
      const brazilDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const formattedDate = brazilDate.toISOString().split('T')[0];
      
      setForm({
        date: formattedDate,
        requester: '',
        origin: '',
        destination: 'ERICSSON',
        time: '',
        car_number: '',
        cost_center: '4088',
        passengerIds: []
      });
      setSelectedPassengers([]);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const carOptions = Array.from({ length: 12 }, (_, i) => `Carro ${i + 1}`);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Solicitar Táxi</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Dados da Solicitação</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Data *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Horário *</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Solicitante *</label>
              <input
                type="text"
                name="requester"
                value={form.requester}
                onChange={handleChange}
                className="form-input"
                placeholder="Nome do solicitante"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Origem *</label>
                <input
                  type="text"
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Local de origem"
                  required
                />
              </div>

              <div>
                <label className="form-label">Destino *</label>
                <input
                  type="text"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Local de destino"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Número do Carro</label>
                <select
                  name="car_number"
                  value={form.car_number}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Selecione o carro</option>
                  {carOptions.map(car => (
                    <option key={car} value={car}>{car}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Centro de Custo</label>
                <input
                  type="text"
                  name="cost_center"
                  value={form.cost_center}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Centro de custo"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-success w-full"
              disabled={loading || selectedPassengers.length === 0}
            >
              {loading ? 'Enviando...' : 'Solicitar Táxi'}
            </button>
          </form>
        </div>

        {/* Seleção de Passageiros */}
        <div className="space-y-6">
          {/* Passageiros Selecionados */}
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Passageiros Selecionados ({selectedPassengers.length}/4)
            </h3>
            
            {selectedPassengers.length > 0 ? (
              <div className="space-y-2">
                {selectedPassengers.map((passenger) => (
                  <div key={passenger.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{passenger.name}</p>
                      <p className="text-sm text-gray-600">{passenger.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePassenger(passenger.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum passageiro selecionado</p>
            )}
          </div>

          {/* Lista de Passageiros Disponíveis */}
          <div className="card">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 space-y-3 md:space-y-0">
              <h3 className="text-lg font-bold text-gray-900">
                Passageiros Disponíveis ({filteredPassengers.length})
              </h3>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="form-input w-full md:w-40"
                >
                  <option value="all">Todas as áreas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredPassengers.length > 0 ? (
                filteredPassengers.map((passenger) => {
                  const isSelected = selectedPassengers.find(p => p.id === passenger.id);
                  return (
                    <div
                      key={passenger.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-100 border-blue-300' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handlePassengerSelect(passenger.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-900">{passenger.name}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAreaBadgeColor(passenger.area)}`}>
                              {passenger.area}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {passenger.city} - {passenger.neighborhood}
                          </p>
                          <p className="text-sm text-gray-500">{passenger.phone}</p>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {selectedArea === 'all' 
                    ? 'Nenhum passageiro cadastrado' 
                    : `Nenhum passageiro encontrado na área ${selectedArea}`
                  }
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
