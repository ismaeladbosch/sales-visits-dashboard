import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MessagesSquare, Phone, Video, Users, FileSpreadsheet, Filter, X, PlusCircle, LogOut } from 'lucide-react';

// Simular base de datos con localStorage
const DB = {
  saveVisits: (visits) => localStorage.setItem('visits', JSON.stringify(visits)),
  getVisits: () => JSON.parse(localStorage.getItem('visits') || '[]'),
  saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
  getUsers: () => JSON.parse(localStorage.getItem('users') || JSON.stringify([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrador' },
    { id: 2, username: 'vendedor', password: 'vendedor123', role: 'vendedor', name: 'Juan Pérez' }
  ]))
};

// Componente de Login
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = () => {
    const users = DB.getUsers();
    const user = users.find(u => 
      u.username === credentials.username && 
      u.password === credentials.password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-2xl font-bold">AD BOSCH - Dashboard</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full p-2 border rounded"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

const SalesVisitsDashboard = () => {
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState(null);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [suggestions, setSuggestions] = useState({
    vendors: [],
    clients: [],
    managers: []
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    vendor: '',
    client: '',
    manager: '',
    dateFrom: '',
    dateTo: ''
  });

  // Nueva visita form state
  const [newVisit, setNewVisit] = useState({
    date: '',
    type: '',
    client: '',
    vendor: '',
    manager: '',
    division: '',
    status: 'Pendiente',
    details: {
      subject: '',
      requestedProducts: [],
      offeredProducts: [],
      incidents: '',
      additionalInfo: ''
    }
  });

  // Cargar datos al inicio
  useEffect(() => {
    const storedVisits = DB.getVisits();
    setVisits(storedVisits);
    setFilteredVisits(storedVisits);
    
    // Extraer sugerencias únicas
    const vendors = [...new Set(storedVisits.map(v => v.vendor))];
    const clients = [...new Set(storedVisits.map(v => v.client))];
    const managers = [...new Set(storedVisits.map(v => v.manager))];
    
    setSuggestions({ vendors, clients, managers });
  }, []);

  // Filtrar visitas según el rol del usuario
  useEffect(() => {
    if (user) {
      const userVisits = user.role === 'admin' 
        ? visits 
        : visits.filter(v => v.vendor === user.name);
      setFilteredVisits(userVisits);
    }
  }, [user, visits]);

  const handleCreateVisit = () => {
    const visitToAdd = {
      ...newVisit,
      id: visits.length + 1,
      vendor: user.role === 'vendedor' ? user.name : newVisit.vendor
    };
    
    const updatedVisits = [...visits, visitToAdd];
    setVisits(updatedVisits);
    DB.saveVisits(updatedVisits);
    setIsNewVisitModalOpen(false);
    setNewVisit({
      date: '',
      type: '',
      client: '',
      vendor: '',
      manager: '',
      division: '',
      status: 'Pendiente',
      details: {
        subject: '',
        requestedProducts: [],
        offeredProducts: [],
        incidents: '',
        additionalInfo: ''
      }
    });
  };

  const handleApplyFilters = () => {
    let filtered = [...visits];
    
    if (filters.vendor) {
      filtered = filtered.filter(v => v.vendor.toLowerCase().includes(filters.vendor.toLowerCase()));
    }
    if (filters.client) {
      filtered = filtered.filter(v => v.client.toLowerCase().includes(filters.client.toLowerCase()));
    }
    if (filters.manager) {
      filtered = filtered.filter(v => v.manager.toLowerCase().includes(filters.manager.toLowerCase()));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(v => new Date(v.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(v => new Date(v.date) <= new Date(filters.dateTo));
    }

    setFilteredVisits(filtered);
    setIsFilterModalOpen(false);
  };

  const handleExportToExcel = () => {
    // Aquí iría la lógica de exportación a Excel
    alert('Funcionalidad de exportación a Excel pendiente de implementación');
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Visitas Comerciales - AD BOSCH</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {user.role === 'admin' ? 'Administrador' : 'Vendedor'}: {user.name}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Salir
            </button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Visitas Físicas"
            value="45"
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <StatsCard
            title="Visitas Online"
            value="32"
            icon={<Video className="h-6 w-6 text-green-500" />}
          />
          <StatsCard
            title="Llamadas"
            value="78"
            icon={<Phone className="h-6 w-6 text-purple-500" />}
          />
          <StatsCard
            title="WhatsApp"
            value="120"
            icon={<MessagesSquare className="h-6 w-6 text-teal-500" />}
          />
        </div>

        {/* Sección de Visitas */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 flex justify-between items-center border-b">
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center px-3 py-2 border rounded text-sm hover:bg-gray-100"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
              <button 
                onClick={handleExportToExcel}
                className="flex items-center px-3 py-2 border rounded text-sm hover:bg-gray-100"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
            </div>
            <button 
              onClick={() => setIsNewVisitModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nueva Visita
            </button>
          </div>

          {/* Tabla de Visitas */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {['Fecha', 'Tipo', 'Cliente', 'Vendedor', 'Responsable', 'División', 'Estado', 'Acciones'].map((header) => (
                    <th key={header} className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">{visit.date}</td>
                    <td className="p-3 whitespace-nowrap">{visit.type}</td>
                    <td className="p-3 whitespace-nowrap">{visit.client}</td>
                    <td className="p-3 whitespace-nowrap">{visit.vendor}</td>
                    <td className="p-3 whitespace-nowrap">{visit.manager}</td>
                    <td className="p-3 whitespace-nowrap">{visit.division}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        visit.status === 'Completada' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button 
                        onClick={() => handleViewDetails(visit)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Filtros con Autocompletado */}
        {isFilterModalOpen && (
          <Modal onClose={() => setIsFilterModalOpen(false)}>
            <h2 className="text-xl font-bold mb-4">Filtros de Búsqueda</h2>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Vendedor" 
                  className="w-full p-2 border rounded"
                  value={filters.vendor}
                  onChange={(e) => {
                    setFilters({...filters, vendor: e.target.value});
                    setSuggestions({
                      ...suggestions,
                      vendors: suggestions.vendors.filter(v => 
                        v.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    });
                  }}
                />
                {filters.vendor && suggestions.vendors.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-b mt-1">
                    {suggestions.vendors.map((vendor, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setFilters({...filters, vendor})}
                      >
                        {vendor}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Campos autocompletados para cliente y responsable */}
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cliente" 
                  className="w-full p-2 border rounded"
                  value={filters.client}
                  onChange={(e) => {
                    setFilters({...filters, client: e.target.value});
                    setSuggestions({
                      ...suggestions,
                      clients: suggestions.clients.filter(c => 
                        c.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    });
                  }}
                />
                {filters.client && suggestions.clients.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-b mt-1">
                    {suggestions.clients.map((client, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setFilters({...filters, client})}
                      >
                        {client}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Responsable" 
                  className="w-full p-2 border rounded"
                  value={filters.manager}
                  onChange={(e) => {
                    setFilters({...filters, manager: e.target.value});
                    setSuggestions({
                      ...suggestions,
                      managers: suggestions.managers.filter(m => 
                        m.toLowerCase().includes(e.target.value.toLowerCase())
                      )
                    });
                  }}
                />
                {filters.manager && suggestions.managers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded-b mt-1">
                    {suggestions.managers.map((manager, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setFilters({...filters, manager})}
                      >
                        {manager}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <input 
                  type="date" 
                  className="w-full p-2 border rounded"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
                <input 
                  type="date" 
                  className="w-full p-2 border rounded"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
              <button 
                onClick={handleApplyFilters}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Aplicar Filtros
              </button>
            </div>
          </Modal>
        )}

        {/* Modal de Nueva Visita */}
        {isNewVisitModalOpen && (
          <Modal onClose={() => setIsNewVisitModalOpen(false)}>
            <h2 className="text-xl font-bold mb-4">Nueva Visita</h2>
            <div className="space-y-4">
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                placeholder="Fecha"
                value={newVisit.date}
                onChange={(e) => setNewVisit({...newVisit, date: e.target.value})}
              />
              <select 
                className="w-full p-2 border rounded"
                value={newVisit.type}
                onChange={(e) => setNewVisit({...newVisit, type: e.target.value})}
              >
                <option value="">Tipo de Visita</option>
                <option value="física">Física</option>
                <option value="online">Online</option>
                <option value="telefónica">Telefónica</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <input 
                type="text" 
                placeholder="Cliente" 
                className="w-full p-2 border rounded"
                value={newVisit.client}
                onChange={(e) => setNewVisit({...newVisit, client: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Vendedor" 
                className="w-full p-2 border rounded"
                value={newVisit.vendor}
                onChange={(e) => setNewVisit({...newVisit, vendor: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Responsable" 
                className="w-full p-2 border rounded"
                value={newVisit.manager}
                onChange={(e) => setNewVisit({...newVisit, manager: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="División" 
                className="w-full p-2 border rounded"
                value={newVisit.division}
                onChange={(e) => setNewVisit({...newVisit, division: e.target.value})}
              />
              <textarea 
                placeholder="Detalles de la visita" 
                className="w-full p-2 border rounded h-24"
                value={newVisit.details.subject}
                onChange={(e) => setNewVisit({...newVisit, details: {...newVisit.details, subject: e.target.value}})}
              ></textarea>
              <button 
                onClick={handleCreateVisit}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Guardar Visita
              </button>
            </div>
          </Modal>
        )}

        {/* Modal de Detalles de Visita */}
        {isDetailsModalOpen && selectedVisitDetails && (
          <Modal onClose={() => setIsDetailsModalOpen(false)}>
            <h2 className="text-xl font-bold mb-4">Detalles de Visita</h2>
            <div className="space-y-4">
              <p><strong>Fecha:</strong> {selectedVisitDetails.date}</p>
              <p><strong>Cliente:</strong> {selectedVisitDetails.client}</p>
              <p><strong>Vendedor:</strong> {selectedVisitDetails.vendor}</p>
              <p><strong>Responsable:</strong> {selectedVisitDetails.manager}</p>
              <p><strong>División:</strong> {selectedVisitDetails.division}</p>
              <p><strong>Asunto:</strong> {selectedVisitDetails.details.subject}</p>
              <div>
                <strong>Productos Solicitados:</strong>
                <ul className="list-disc pl-5">
                  {selectedVisitDetails.details.requestedProducts.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Productos Ofrecidos:</strong>
                <ul className="list-disc pl-5">
                  {selectedVisitDetails.details.offeredProducts.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              </div>
              <p><strong>Incidencias:</strong> {selectedVisitDetails.details.incidents}</p>
              <p><strong>Información Adicional:</strong> {selectedVisitDetails.details.additionalInfo}</p>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Componente de Modal Reutilizable
const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl relative max-w-md w-full">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div className="bg-white border rounded-lg shadow-sm p-4 flex justify-between items-center">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
    <div>{icon}</div>
  </div>
);

ReactDOM.render(<SalesVisitsDashboard />, document.getElementById('root'));