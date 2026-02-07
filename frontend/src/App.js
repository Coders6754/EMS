import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Departments from './pages/Departments';
import Projects from './pages/Projects';
import Invoices from './pages/Invoices';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmployeeLinkModal from './components/EmployeeLinkModal';
import { AuthContext } from './context/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmployeeLinkModal, setShowEmployeeLinkModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Show link modal if employee doesn't have employeeId
      if (parsedUser.role === 'Employee' && !parsedUser.employeeId) {
        setShowEmployeeLinkModal(true);
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Show link modal if employee doesn't have employeeId
    if (userData.role === 'Employee' && !userData.employeeId) {
      setShowEmployeeLinkModal(true);
    } else {
      setShowEmployeeLinkModal(false);
    }
  };
  
  const handleLinkSuccess = () => {
    // Refresh user data
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    setShowEmployeeLinkModal(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Toaster position="top-right" />
        {user ? (
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64">
              <Header />
              <main className="flex-1 overflow-auto mt-20 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/forms/employees" element={<Employees />} />
                  <Route path="/forms/employees/:id" element={<EmployeeDetails />} />
                  <Route path="/forms/departments" element={<Departments />} />
                  <Route path="/forms/projects" element={<Projects />} />
                  <Route path="/forms/invoices" element={<Invoices />} />
                  <Route path="/forms/leaves" element={<Leaves />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
            <EmployeeLinkModal
              isOpen={showEmployeeLinkModal}
              onClose={() => setShowEmployeeLinkModal(false)}
              onLinkSuccess={handleLinkSuccess}
            />
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
