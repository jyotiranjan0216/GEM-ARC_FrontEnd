import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear any previous errors when typing
    setError('');

    // Check password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }

    // Check if passwords match
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const match = name === 'confirmPassword' 
        ? value === formData.password
        : value === formData.confirmPassword;
      setPasswordMatch(match);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation to match backend expectations
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post('https://gem-arc-backend.onrender.com/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword // Include confirmPassword as the backend expects it
      });
      
      const { token } = res.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      
      navigate('/skills');
    } catch (err) {
      // Use error message directly from backend if available
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  // Only name, email, phone fields use the standard rendering
  const standardFields = [
    { name: 'name', type: 'text', placeholder: 'Full Name', icon: <User size={18} className="text-gray-400" /> },
    { name: 'email', type: 'email', placeholder: 'Email Address', icon: <Mail size={18} className="text-gray-400" /> },
    { name: 'phone', type: 'tel', placeholder: 'Phone Number', icon: <Phone size={18} className="text-gray-400" /> },
  ];

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
            <h3 className="text-white text-xl font-semibold text-center">Create Account</h3>
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
            {/* Standard fields */}
            {standardFields.map((field) => (
              <div key={field.name} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {field.icon}
                </div>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            ))}

            {/* Password field with toggle */}
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
            
            {/* Password strength indicator separated from input field */}
            {formData.password && (
              <div className="mt-0">
                <div className="flex items-center gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'}`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs mt-1 text-gray-600">
                  {getPasswordStrengthText()}
                </p>
              </div>
            )}

            {/* Confirm Password field with toggle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-10 pr-10 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  !passwordMatch && formData.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password match error message */}
            {!passwordMatch && formData.confirmPassword && (
              <div className="flex items-center mt-0 text-red-500 text-xs">
                <AlertCircle size={12} className="mr-1" />
                Passwords do not match
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !passwordMatch}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-600 focus:ring-4 focus:ring-blue-300 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Sign Up'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign In
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

export default SignUp;