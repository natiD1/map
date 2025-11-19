
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook
import AuthLayout from './AuthLayout';
import { FaLock, FaInfoCircle } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function ResetPassword() {
  const { t } = useTranslation(); // Initialize the hook
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    setPasswordValidation({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = () => Object.values(passwordValidation).every(req => req === true);

  const getMissingRequirements = () => {
    const missing = [];
    if (!passwordValidation.length) missing.push(t('pass_req_length'));
    if (!passwordValidation.uppercase) missing.push(t('pass_req_uppercase'));
    if (!passwordValidation.lowercase) missing.push(t('pass_req_lowercase'));
    if (!passwordValidation.number) missing.push(t('pass_req_number'));
    if (!passwordValidation.specialChar) missing.push(t('pass_req_special'));
    return missing;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otp || !newPassword || !confirmPassword) {
      setError(t('all_fields_required'));
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid()) {
      const missing = getMissingRequirements();
      setError(t('password_needs', { requirements: missing.join(', ') }));
      setShowPasswordHint(true);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(t('network_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => navigate(`/forgot-password?email=${encodeURIComponent(email)}`);
  const handleBackToLogin = () => navigate('/login');
  const handlePasswordFocus = () => { setPasswordFocused(true); if (!isPasswordValid() && newPassword.length > 0) setShowPasswordHint(true); };
  const handlePasswordBlur = () => { setPasswordFocused(false); if (!error) setShowPasswordHint(false); };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-wider font-classic">
            {t('reset_password_title')}
          </h2>
          <p className="mt-2 text-gray-200 font-classicc">
            {t('reset_password_subtitle')}
          </p>
        </div>
        
        {success ? (
          <div className="text-center py-6">
            <div className="text-green-400 text-lg mb-4">
              {t('password_reset_success_title')}
            </div>
            <p className="text-gray-300 mb-6">
              {t('password_reset_success_subtitle')}
            </p>
            <button
              onClick={handleBackToLogin}
              className="px-6 py-2 font-semibold text-white bg-cyan-500 rounded-lg shadow-md hover:bg-cyan-600 transition-colors duration-300"
            >
              {t('back_to_login')}
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="text-center">
              <p className="text-gray-300">{t('resetting_for')}</p>
              <p className="text-cyan-400 font-medium">{email}</p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-1">
                {t('reset_code')}
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t('enter_6_digit_code')}
                className="block w-full px-4 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm text-center tracking-widest"
                maxLength={6}
              />
              <div className="mt-2 text-sm text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-300"
                >
                  {t('didnt_receive_code')}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-200" /></div>
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                placeholder={t('new_password')}
                className="block w-full pl-10 pr-10 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>{showPassword ? <IoEyeOff className="h-5 w-5 text-gray-200" /> : <IoEye className="h-5 w-5 text-gray-200" />}</div>
            </div>

            {(showPasswordHint || (passwordFocused && !isPasswordValid())) && (
              <div className="text-xs bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 flex items-start">
                <FaInfoCircle className="text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-300 font-medium mb-1">{t('password_requirements')}</p>
                  <p className="text-blue-200">{t('password_must_include', { requirements: getMissingRequirements().join(', ') })}</p>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-200" /></div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirm_new_password')}
                className="block w-full pl-10 pr-10 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={toggleConfirmPasswordVisibility}>{showConfirmPassword ? <IoEyeOff className="h-5 w-5 text-gray-200" /> : <IoEye className="h-5 w-5 text-gray-200" />}</div>
            </div>

            {confirmPassword && (
              <div className="flex items-center text-xs">
                {newPassword === confirmPassword ? <span className="text-green-400">{t('passwords_match')}</span> : <span className="text-red-400">{t('passwords_do_not_match')}</span>}
              </div>
            )}

            {error && <p className="text-sm text-center text-red-400">{error}</p>}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid() || newPassword !== confirmPassword}
                className={`px-12 py-3 font-semibold text-white bg-white/10 border border-white/20 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20 hover:shadow-2xl hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-300 ${isLoading || !isPasswordValid() || newPassword !== confirmPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? t('resetting') : t('reset_password_button')}
              </button>
            </div>
          </form>
        )}

        <p className="mt-8 text-sm text-center text-gray-300">
          {t('remember_password')}{' '}
          <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-300">
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}