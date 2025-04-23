import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captchaInput: ''
  });
  const [captcha, setCaptcha] = useState('');
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
  };

  const handleSubmit = async e => {
    e.preventDefault();
  
    if (formData.captchaInput !== captcha) {
      alert('CAPTCHA mismatch!');
      generateCaptcha();
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
  
      const { user, token } = response.data;
  
      // Optional: Save token/user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
  
      // Correctly redirect based on isAdmin
      if (user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
  
    } catch (err) {
      alert(err.response?.data?.message || 'Sign In failed');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Sign In</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <div className="flex items-center mb-2">
          <span className="bg-gray-200 px-3 py-1 rounded font-mono text-lg">{captcha}</span>
          <button
            type="button"
            onClick={generateCaptcha}
            className="ml-3 text-blue-500 hover:underline text-sm"
          >
            Refresh
          </button>
        </div>

        <input
          name="captchaInput"
          type="text"
          placeholder="Enter CAPTCHA"
          value={formData.captchaInput}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Sign In
        </button>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
