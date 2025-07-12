import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PassengerForm() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    neighborhood: '',
    city: '',
    phone: '',
    cost_center: '',
    shift: ''
  });
  const [passengers, setPassengers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/passengers');
      setPassengers(response.data);
    } catch (error) {
      console.error('Erro ao buscar passageiros:', error);
      alert('Erro ao carregar passageiros');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/passengers/${editingId}`, form);
        alert('Passageiro atualizado com sucesso!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:3001/passengers', form);
        alert('Passageiro cadastrado com sucesso!');
      }
      
      setForm({
        name: '',
        address: '',
        neighborhood: '',
        city: '',
        phone: '',
        cost_center: '',
        shift: ''
      });
      
      fetchPassengers();
    } catch (error) {
      console.error('Erro ao salvar passageiro:', error);
      alert('Erro ao salvar passageiro');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (passenger) => {
    setForm(passenger);
    setEditingId(passenger.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este passageiro?')) {
      try {
        await axios.delete(`http://localhost:3001/passengers/${id}`);
        alert('Passageiro excluído com sucesso!');
        fetchPassengers();
      } catch (error) {
        console.error('Erro ao excluir passageiro:', error);
        alert('Erro ao excluir passageiro');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: '',
      address: '',
      neighborhood: '',
      city: '',
      phone: '',
      cost_center: '',
      shift: ''
    });
  };

  const filteredPassengers = passengers.filter(passenger =>
    passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    passenger.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    passenger.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {editingId ? 'Editar Passageiro' : 'Cadastrar Passageiro'}
        </h1>
        {editingId && (
          <button onClick={cancelEdit} className="btn-secondary">
            Cancelar Edição
          </button>
        )}
      </div>

      {/* Formulário */}
      <div className="card">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nome *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Telefone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="md:col-span-2">
            <label className="form-label">Endereço</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Bairro</label>
            <input
              type="text"
              name="neighborhood"
              value={form.neighborhood}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Cidade</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Centro de Custo</label>
            <input
              type="text"
              name="cost_center"
              value={form.cost_center}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Turno</label>
            <select
              name="shift"
              value={form.shift}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Selecione o turno</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
              <option value="Integral">Integral</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit" 
              className="btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Cadastrar')}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Passageiros */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Passageiros Cadastrados ({filteredPassengers.length})
          </h2>
          <div className="w-64">
            <input
              type="text"
              placeholder="Buscar passageiros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {filteredPassengers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Cidade</th>
                  <th>Bairro</th>
                  <th>Centro de Custo</th>
                  <th>Turno</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPassengers.map((passenger) => (
                  <tr key={passenger.id}>
                    <td className="font-medium">{passenger.name}</td>
                    <td>{passenger.phone}</td>
                    <td>{passenger.city}</td>
                    <td>{passenger.neighborhood}</td>
                    <td>{passenger.cost_center}</td>
                    <td>{passenger.shift}</td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(passenger)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(passenger.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            {searchTerm ? 'Nenhum passageiro encontrado com esse termo' : 'Nenhum passageiro cadastrado'}
          </p>
        )}
      </div>
    </div>
  );
}
