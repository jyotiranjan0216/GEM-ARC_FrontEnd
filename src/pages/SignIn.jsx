import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react';

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaInput: ''
  });
  const [captcha, setCaptcha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    setCaptcha(randomStr);
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any previous errors when typing
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.captchaInput !== captcha) {
      setError('CAPTCHA verification failed. Please try again.');
      generateCaptcha();
      setFormData({ ...formData, captchaInput: '' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://gem-arc-backend.onrender.com/api/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { user, token } = response.data;

      // Save token/user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on isAdmin
      if (user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      // Use error message directly from backend if available
      setError(err.response?.data?.message || 'Sign In failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            GEM-ARC
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto mt-2 rounded-full"></div>
          <p className="text-gray-600 mt-2 text-sm font-medium">Campus Event Management</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-4">
            <h3 className="text-white text-xl font-semibold text-center">Sign In</h3>
          </div>

          {/* Error message display */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-sm flex items-center">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">CAPTCHA Verification</span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-white px-4 py-2 rounded font-mono text-lg border border-gray-200 text-center shadow-sm">
                  {captcha}
                </div>
                <input
                  name="captchaInput"
                  type="text"
                  placeholder="Enter code"
                  value={formData.captchaInput}
                  onChange={handleChange}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-600 focus:ring-4 focus:ring-blue-300 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="text-center mt-6 text-xs text-gray-500">
          © 2025 GEM-ARC. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default SignIn;