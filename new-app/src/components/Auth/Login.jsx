
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from './AuthLayout';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);

    if (result.success && result.user) {
      // ✅ **FIX:** Make the role check case-insensitive
      const userRole = result.user.role.toLowerCase();

      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'supervisor') { 
        navigate('/supervisor-dashboard');
      } else {
       // AFTER
navigate('/', { state: { fromLogin: true, defaultLocation: 'matzuva' } });
      }
    } else {
      setError(result.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-wider font-classic">
            {t('welcome_back')}
          </h2>
          <p className="mt-2 text-gray-200 font-classicc">
            {t('sign_in_to_continue')}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-200" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email_address')}
              className="block w-full pl-10 pr-4 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-200" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="block w-full pl-10 pr-10 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? (
                <IoEyeOff className="h-5 w-5 text-gray-200" />
              ) : (
                <IoEye className="h-5 w-5 text-gray-200" /> )}
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-300"
            >
              {t('forgot_password')}
            </Link>
          </div>

          {error && (
            <p className="text-sm text-center text-red-400">{error}</p>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              className="
                px-12 py-3
                font-semibold text-white
                bg-white/10 border border-white/20
                rounded-lg shadow-lg
                transition-all duration-300 ease-in-out
                transform hover:scale-105 hover:bg-white/20
                hover:shadow-2xl hover:shadow-cyan-500/20
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-300
              "
            >
              {t('sign_in')}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-gray-300">
          {t('no_account')}{' '}
          <Link
            to="/register"
            className="
              font-medium text-cyan-400
              hover:text-cyan-300 hover:underline underline-offset-4
              transition-colors duration-300
            "
          >
            {t('sign_up')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
