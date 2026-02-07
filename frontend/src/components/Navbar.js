import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">EMS</Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/" className="hover:text-blue-200">Dashboard</Link>
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <>
                  <Link to="/employees" className="hover:text-blue-200">Employees</Link>
                  <Link to="/departments" className="hover:text-blue-200">Departments</Link>
                </>
              )}
              <Link to="/projects" className="hover:text-blue-200">Projects</Link>
              <Link to="/invoices" className="hover:text-blue-200">Invoices</Link>
              <Link to="/leaves" className="hover:text-blue-200">Leaves</Link>
              <Link to="/reports" className="hover:text-blue-200">Reports</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-blue-700 px-3 py-1 rounded">{user?.role}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
