import React, { useState } from 'react';
import axios from 'axios';

export default function FileImport({ onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        setFile(selectedFile);
        setPreview(null);
        setShowPreview(false);
      } else {
        alert('Apenas arquivos CSV, XLS e XLSX são permitidos');
        e.target.value = '';
      }
    }
  };

  const handlePreview = async () => {
    if (!file) {
      alert('Selecione um arquivo primeiro');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/import/passengers/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPreview(response.data.preview);
      setShowPreview(true);
    } catch (error) {
      console.error('Erro ao fazer preview:', error);
      alert(error.response?.data?.message || 'Erro ao processar arquivo para preview');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Selecione um arquivo primeiro');
      return;
    }

    if (window.confirm('Confirma a importação dos dados?')) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:3001/import/passengers/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = response.data;
        let message = `✅ Importação concluída!\n\n`;
        message += `📊 Resumo:\n`;
        message += `• Total de registros: ${result.summary.total}\n`;
        message += `• Importados: ${result.summary.imported}\n`;
        message += `• Duplicatas: ${result.summary.duplicates}\n`;
        message += `• Inválidos: ${result.summary.invalid}`;

        if (result.summary.duplicates > 0) {
          message += `\n\n⚠️ ${result.summary.duplicates} registros duplicados foram ignorados.`;
        }

        if (result.summary.invalid > 0) {
          message += `\n\n❌ ${result.summary.invalid} registros inválidos foram ignorados.`;
        }

        alert(message);

        // Limpar formulário
        setFile(null);
        setPreview(null);
        setShowPreview(false);
        document.getElementById('file-input').value = '';

        // Callback para atualizar lista de passageiros
        if (onImportSuccess) {
          onImportSuccess();
        }

      } catch (error) {
        console.error('Erro ao importar:', error);
        alert(error.response?.data?.message || 'Erro ao importar arquivo');
      } finally {
        setLoading(false);
      }
    }
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

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📁 Importar Passageiros
      </h3>

      {/* Upload de arquivo */}
      <div className="space-y-4">
        <div>
          <label className="form-label">
            Selecionar arquivo (CSV, XLS, XLSX)
          </label>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="form-input"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex space-x-3">
          <button
            onClick={handlePreview}
            disabled={!file || loading}
            className="btn-secondary"
          >
            {loading ? '🔄 Processando...' : '👁️ Visualizar'}
          </button>
          
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="btn-primary"
          >
            {loading ? '📤 Importando...' : '📤 Importar'}
          </button>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Formato do arquivo:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Nome</strong> (obrigatório)</li>
            <li>• <strong>Endereço</strong></li>
            <li>• <strong>Bairro</strong></li>
            <li>• <strong>Cidade</strong></li>
            <li>• <strong>Telefone</strong></li>
            <li>• <strong>Centro de Custo</strong></li>
            <li>• <strong>Turno</strong> (Manhã, Tarde, Noite, Integral)</li>
            <li>• <strong>Área</strong> (Produção, Warehouse, RCB, SAR)</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            💡 A primeira linha deve conter os cabeçalhos das colunas
          </p>
        </div>
      </div>

      {/* Preview dos dados */}
      {showPreview && preview && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            👀 Preview dos dados
          </h4>

          {/* Resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{preview.summary.total}</div>
              <div className="text-sm text-blue-800">Total</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{preview.summary.unique}</div>
              <div className="text-sm text-green-800">Únicos</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{preview.summary.duplicates}</div>
              <div className="text-sm text-yellow-800">Duplicatas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{preview.summary.invalid}</div>
              <div className="text-sm text-red-800">Inválidos</div>
            </div>
          </div>

          {/* Dados válidos */}
          {preview.valid.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-green-800 mb-3">
                ✅ Dados válidos (primeiros 10):
              </h5>
              <div className="overflow-x-auto">
                <table className="table text-sm">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Área</th>
                      <th>Cidade</th>
                      <th>Turno</th>
                      <th>Centro de Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.valid.map((passenger, index) => (
                      <tr key={index}>
                        <td className="font-medium">{passenger.name}</td>
                        <td>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAreaBadgeColor(passenger.area)}`}>
                            {passenger.area}
                          </span>
                        </td>
                        <td>{passenger.city}</td>
                        <td>{passenger.shift}</td>
                        <td>{passenger.cost_center}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicatas */}
          {preview.duplicates.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-yellow-800 mb-3">
                ⚠️ Duplicatas encontradas:
              </h5>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <ul className="text-sm text-yellow-800">
                  {preview.duplicates.slice(0, 5).map((passenger, index) => (
                    <li key={index}>• {passenger.name} ({passenger.area})</li>
                  ))}
                  {preview.duplicates.length > 5 && (
                    <li>• ... e mais {preview.duplicates.length - 5} duplicatas</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Dados inválidos */}
          {preview.invalid.length > 0 && (
            <div className="mb-6">
              <h5 className="font-medium text-red-800 mb-3">
                ❌ Dados inválidos:
              </h5>
              <div className="bg-red-50 p-3 rounded-lg">
                <ul className="text-sm text-red-800">
                  {preview.invalid.slice(0, 5).map((item, index) => (
                    <li key={index}>
                      • Linha {item.index}: {item.errors.join(', ')}
                    </li>
                  ))}
                  {preview.invalid.length > 5 && (
                    <li>• ... e mais {preview.invalid.length - 5} erros</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
