import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Visão geral das solicitações e estatísticas do sistema',
      icon: '📊',
      path: '/dashboard',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Solicitar Táxi',
      description: 'Criar uma nova solicitação de táxi',
      icon: '🚖',
      path: '/request',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Cadastrar Passageiros',
      description: 'Gerenciar cadastro de passageiros',
      icon: '👥',
      path: '/passengers',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Solicitações',
      description: 'Visualizar e gerenciar todas as solicitações',
      icon: '📋',
      path: '/requests',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Solicitação de Táxi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie solicitações de transporte corporativo de forma simples e eficiente
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100">
                <div className="flex items-center justify-center mb-6">
                  <div className={`${item.color} text-white rounded-full p-4 text-4xl transition-colors duration-300`}>
                    {item.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  {item.description}
                </p>
                
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Acessar
                    <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Principais Funcionalidades
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Rápido e Eficiente</h3>
              <p className="text-gray-600 text-sm">Interface intuitiva para solicitações rápidas</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Relatórios Completos</h3>
              <p className="text-gray-600 text-sm">Exportação em Excel e envio por email</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Controle Total</h3>
              <p className="text-gray-600 text-sm">Acompanhamento de status em tempo real</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
