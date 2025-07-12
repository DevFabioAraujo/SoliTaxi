import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmail, setExportEmail] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      alert('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:3001/requests/${id}/status`, { status });
      alert(`Solicitação ${status === 'completed' ? 'concluída' : 'atualizada'} com sucesso!`);
      fetchRequests();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da solicitação');
    }
  };

  const deleteRequest = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      try {
        await axios.delete(`http://localhost:3001/requests/${id}`);
        alert('Solicitação excluída com sucesso!');
        fetchRequests();
      } catch (error) {
        console.error('Erro ao excluir solicitação:', error);
        alert('Erro ao excluir solicitação');
      }
    }
  };

  const handleExport = async () => {
    if (!exportEmail) {
      alert('Por favor, informe o email de destino');
      return;
    }

    setExportLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/export/requests', {
        email: exportEmail,
        filters: exportFilters
      });

      alert(`Relatório enviado com sucesso para ${exportEmail}!\nTotal de registros: ${response.data.recordsCount}`);
      setShowExportModal(false);
      setExportEmail('');
      setExportFilters({ status: 'all', dateFrom: '', dateTo: '' });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert(error.response?.data?.error || 'Erro ao enviar relatório por email');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownload = async () => {
    setExportLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/export/download', {
        filters: exportFilters
      }, {
        responseType: 'blob'
      });

      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Gerar nome do arquivo com timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `solicitacoes_taxi_${timestamp}.xlsx`);
      
      // Fazer download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Download do relatório Excel iniciado com sucesso!');
      setShowExportModal(false);
      setExportFilters({ status: 'all', dateFrom: '', dateTo: '' });
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao gerar arquivo para download');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = 
      request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.passengers && request.passengers.some(p => 
        p.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: 'Pendente',
      completed: 'Concluída',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || badges.pending}`}>
        {labels[status] || 'Pendente'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Solicitações de Táxi</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowExportModal(true)} 
            className="btn-secondary"
          >
            📧 Exportar e Enviar
          </button>
          <button onClick={fetchRequests} className="btn-primary">
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas ({requests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendentes ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Concluídas ({requests.filter(r => r.status === 'completed').length})
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.origin} → {request.destination}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Data:</span> {
                        (() => {
                          // Garantir que a data seja interpretada como horário local brasileiro
                          const date = new Date(request.date + 'T00:00:00-03:00');
                          return date.toLocaleDateString('pt-BR');
                        })()
                      }
                    </div>
                    <div>
                      <span className="font-medium">Horário:</span> {request.time}
                    </div>
                    <div>
                      <span className="font-medium">Solicitante:</span> {request.requester}
                    </div>
                    <div>
                      <span className="font-medium">Carro:</span> {request.car_number || 'Não definido'}
                    </div>
                  </div>

                  {request.created_at_formatted && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="font-medium">Criado em:</span> {request.created_at_formatted}
                    </div>
                  )}

                  {request.passengers && request.passengers.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-sm text-gray-700">Passageiros:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.passengers.map((passenger, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {passenger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                      className="btn-success text-sm"
                    >
                      Concluir
                    </button>
                  )}
                  
                  {request.status === 'completed' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'pending')}
                      className="btn-secondary text-sm"
                    >
                      Reabrir
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteRequest(request.id)}
                    className="btn-danger text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma solicitação encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Tente ajustar os filtros ou termo de busca' 
                : 'Comece criando uma nova solicitação de táxi'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Exportar e Enviar Relatório</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Email de Destino *</label>
                <input
                  type="email"
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                  className="form-input"
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">Filtrar por Status</label>
                <select
                  value={exportFilters.status}
                  onChange={(e) => setExportFilters({...exportFilters, status: e.target.value})}
                  className="form-input"
                >
                  <option value="all">Todas</option>
                  <option value="pending">Pendentes</option>
                  <option value="completed">Concluídas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Data Inicial</label>
                  <input
                    type="date"
                    value={exportFilters.dateFrom}
                    onChange={(e) => setExportFilters({...exportFilters, dateFrom: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Data Final</label>
                  <input
                    type="date"
                    value={exportFilters.dateTo}
                    onChange={(e) => setExportFilters({...exportFilters, dateTo: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <p><strong>Opções de Exportação:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Baixar Excel:</strong> Download direto do arquivo formatado</li>
                  <li><strong>Enviar por Email:</strong> Arquivo Excel enviado para o email informado</li>
                </ul>
                <p className="mt-2"><strong>Formato Excel:</strong> Organizado por carro com passageiros listados abaixo</p>
                <p className="mt-1">Total de solicitações que serão exportadas: <strong>{filteredRequests.length}</strong></p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setExportEmail('');
                  setExportFilters({ status: 'all', dateFrom: '', dateTo: '' });
                }}
                className="btn-secondary"
                disabled={exportLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary"
                disabled={exportLoading}
              >
                {exportLoading ? 'Gerando...' : '📥 Baixar Excel'}
              </button>
              <button
                onClick={handleExport}
                className="btn-success"
                disabled={exportLoading || !exportEmail}
              >
                {exportLoading ? 'Enviando...' : '📧 Enviar por Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
