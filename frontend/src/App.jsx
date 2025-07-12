import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import PassengerForm from './pages/PassengerForm';
import TaxiRequestForm from './pages/TaxiRequestForm';
import RequestList from './pages/RequestList';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Only show on non-home pages */}
      {!isHomePage && (
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                Sistema de Solicitação de Táxi
              </Link>
              <nav className="flex space-x-6">
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Início
                </Link>
                <Link 
                  to="/dashboard" 
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
      )}

      {/* Main Content */}
      <main className={!isHomePage ? "container mx-auto px-4 py-8" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/request" element={<TaxiRequestForm />} />
          <Route path="/passengers" element={<PassengerForm />} />
          <Route path="/requests" element={<RequestList />} />
        </Routes>
      </main>

      {/* Footer - Only show on non-home pages */}
      {!isHomePage && (
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-gray-600">
              © 2024 Sistema de Solicitação de Táxi. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router basename="/Solicitartaxi">
      <AppContent />
    </Router>
  );
}
