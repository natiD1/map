
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export default function ForgotPassword() {
  const { t } = useTranslation(); // Initialize useTranslation hook
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to reset password page after a short delay
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(t('network_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-wider font-classic">
            {t('forgot_password')}
          </h2>
          <p className="mt-2 text-gray-200 font-classicc">
            {t('forgot_password_description')}
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-green-400 text-lg mb-4">
              {t('reset_code_sent')}
            </div>
            <p className="text-gray-300 mb-6">
              {t('reset_code_sent_description')}
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {t('redirecting_to_reset')}
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {error && (
              <p className="text-sm text-center text-red-400">{error}</p>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-12 py-3
                  font-semibold text-white
                  bg-white/10 border border-white/20
                  rounded-lg shadow-lg
                  transition-all duration-300 ease-in-out
                  transform hover:scale-105 hover:bg-white/20
                  hover:shadow-2xl hover:shadow-cyan-500/20
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-300
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? t('sending') : t('send_reset_code')}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-sm text-center text-gray-300">
          {t('remember_password')}{' '}
          <Link
            to="/login"
            className="
              font-medium text-cyan-400
              hover:text-cyan-300 hover:underline underline-offset-4
              transition-colors duration-300
            "
          >
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}