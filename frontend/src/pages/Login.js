import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { validateEmail, validatePhone, validatePassword } from '../utils/validators';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Employee',
    contactNumber: '',
    department: ''
  });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isRegister) {
      fetchDepartments();
    }
  }, [isRegister]);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments/public');
      console.log('Fetched departments:', res.data);
      setDepartments(res.data || []);
      
      if (!res.data || res.data.length === 0) {
        console.warn('No departments available');
        toast.error('No departments found. Please contact administrator.');
      } else {
        console.log(`Loaded ${res.data.length} department(s) for selection`);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments. Please try again.');
    }
  };

  const fixedCredentials = {
    Admin: {
      email: 'admin@ems.com',
      password: 'admin123'
    },
    Manager: {
      email: 'manager@ems.com',
      password: 'manager123'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return;
    }
    
    const normalizedEmail = emailValidation.email;
    
    if (isRegister) {
      if (!formData.contactNumber) {
        toast.error('Contact number is required');
        return;
      }
      const phoneValidation = validatePhone(formData.contactNumber);
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.message);
        return;
      }
      
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        toast.error(passwordValidation.message);
        return;
      }
    }
    
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const requestData = {
        ...formData,
        email: normalizedEmail
      };
      const response = await API.post(endpoint, requestData);
      
      login(response.data.token, response.data.user);
      toast.success(isRegister ? 'Registration successful!' : 'Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else if (isRegister) {
        toast.error('Registration failed. Please check your information and try again.');
      } else {
        toast.error('Login failed. Please check your email and password.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full -ml-40 -mb-40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">E</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">EMS</h1>
              <p className="text-blue-100 text-sm">Management System</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-16">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Welcome to the<br />Future of Management
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Streamline your organization's workflow with our comprehensive employee and project management solution.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-blue-200 text-sm">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10K+</div>
            <div className="text-blue-200 text-sm">Employees</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
            <div className="text-blue-200 text-sm">Uptime</div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">EMS</h1>
              <p className="text-gray-500 text-xs">Management System</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500">
                {isRegister 
                  ? 'Sign up to get started with EMS' 
                  : 'Sign in to continue to your account'}
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2.5 rounded-md font-semibold transition-all ${
                  !isRegister 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setFormData({ ...formData, role: 'Employee' });
                }}
                className={`flex-1 py-2.5 rounded-md font-semibold transition-all ${
                  isRegister 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Register (Employee Only)
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) => {
                      const email = e.target.value.toLowerCase();
                      setFormData({ ...formData, email });
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="1234567890"
                        pattern="\d+"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department {departments.length > 0 ? '' : '*'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      {departments.length > 0 ? (
                        <select
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                          <option value="">Select Department (Optional)</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full pl-10 pr-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50">
                          <p className="text-sm text-yellow-800">
                            ⚠️ No departments available. Please contact administrator to create departments first.
                          </p>
                        </div>
                      )}
                    </div>
                    {departments.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">Select your department (optional)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        disabled
                        value="Employee"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only Employee registration is allowed</p>
                    </div>
                  </div>
                </>
              )}

              {!isRegister && (
                <div className="flex items-center text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isRegister ? '🚀 Create Account' : '🔓 Sign In'}
              </button>
            </form>

            {!isRegister && (
              <div className="mt-6 space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
                    Fixed Login Credentials
                  </p>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">👑</span>
                        <span className="font-semibold text-gray-800">Admin</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            email: fixedCredentials.Admin.email,
                            password: fixedCredentials.Admin.password,
                            role: 'Admin'
                          });
                        }}
                        className="text-xs bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Email:</span> {fixedCredentials.Admin.email}</p>
                      <p><span className="font-medium">Password:</span> {fixedCredentials.Admin.password}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">👔</span>
                        <span className="font-semibold text-gray-800">Manager</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            email: fixedCredentials.Manager.email,
                            password: fixedCredentials.Manager.password,
                            role: 'Manager'
                          });
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><span className="font-medium">Email:</span> {fixedCredentials.Manager.email}</p>
                      <p><span className="font-medium">Password:</span> {fixedCredentials.Manager.password}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              {isRegister ? (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Employee?{' '}
                  <button
                    onClick={() => {
                      setIsRegister(true);
                      setFormData({ ...formData, role: 'Employee' });
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}
            </div>

            {isRegister && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-blue-600 text-2xl mb-1">🔒</div>
              <p className="text-xs text-gray-600 font-medium">Secure</p>
            </div>
            <div>
              <div className="text-purple-600 text-2xl mb-1">⚡</div>
              <p className="text-xs text-gray-600 font-medium">Fast</p>
            </div>
            <div>
              <div className="text-indigo-600 text-2xl mb-1">💼</div>
              <p className="text-xs text-gray-600 font-medium">Professional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
