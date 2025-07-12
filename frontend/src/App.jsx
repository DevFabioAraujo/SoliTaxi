import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PassengerForm from './pages/PassengerForm';
import TaxiRequestForm from './pages/TaxiRequestForm';
import RequestList from './pages/RequestList';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">
                Sistema de Solicitação de Táxi
              </h1>
              <nav className="flex space-x-6">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/request" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Solicitar Táxi
                </Link>
                <Link 
                  to="/passengers" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Passageiros
                </Link>
                <Link 
                  to="/requests" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Solicitações
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/request" element={<TaxiRequestForm />} />
            <Route path="/passengers" element={<PassengerForm />} />
            <Route path="/requests" element={<RequestList />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-gray-600">
              © 2024 Sistema de Solicitação de Táxi. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
