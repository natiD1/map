

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import the hook
import AuthLayout from './AuthLayout';
import VerifyOTP from './VerifyOTP';

// Import icons
import { FaUser, FaEnvelope, FaLock, FaInfoCircle, FaRandom } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

export default function Register() {
  const { t } = useTranslation(); // Initialize the hook
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const generateStrongPassword = () => {
    // ... (this function has no user-facing text, so no changes are needed)
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    let newPassword = 
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length)) +
      specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    const allChars = lowercase + uppercase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return newPassword.split('').sort(() => Math.random() - 0.5).join('');
  };

  const suggestPassword = () => {
    const suggestedPassword = generateStrongPassword();
    setPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
    setShowPassword(true);
    setShowConfirmPassword(true);
  };

  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

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

    if (!fullName || !email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      setError(t('passwords_do_not_match'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegisteredEmail(email);
        setShowOTPVerification(true);
      } else {
        setError(data.message || t('registration_failed'));
      }
    } catch (error) {
      setError(t('network_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = () => navigate('/login', { state: { message: t('registration_successful_approval') } });
  const handleOTPBack = () => { setShowOTPVerification(false); setError(''); };
  const handlePasswordFocus = () => { setPasswordFocused(true); if (!isPasswordValid() && password.length > 0) setShowPasswordHint(true); };
  const handlePasswordBlur = () => { setPasswordFocused(false); if (!error) setShowPasswordHint(false); };

  if (showOTPVerification) {
    return <VerifyOTP email={registeredEmail} onBack={handleOTPBack} onVerificationSuccess={handleOTPVerificationSuccess} />;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-wider font-classic">{t('create_account')}</h2>
          <p className="mt-2 text-gray-200 font-classicc">{t('join_us_journey')}</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Inputs for Full Name, Email, Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="h-5 w-5 text-gray-200" /></div>
            <input id="fullName" name="fullName" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('full_name')} className="block w-full pl-10 pr-4 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="h-5 w-5 text-gray-200" /></div>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email_address')} className="block w-full pl-10 pr-4 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm" />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaLock className="h-5 w-5 text-gray-200" /></div>
            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={handlePasswordFocus} onBlur={handlePasswordBlur} placeholder={t('password')} className="block w-full pl-10 pr-10 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={togglePasswordVisibility}>{showPassword ? <IoEyeOff className="h-5 w-5 text-gray-200" /> : <IoEye className="h-5 w-5 text-gray-200" />}</div>
          </div>

          <div className="top-0 right-0">
            <button type="button" onClick={suggestPassword} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center transition-colors duration-300">
              <FaRandom className="mr-1" /> {t('suggest_strong_password')}
            </button>
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
            <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t('confirm_password')} className="block w-full pl-10 pr-10 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={toggleConfirmPasswordVisibility}>{showConfirmPassword ? <IoEyeOff className="h-5 w-5 text-gray-200" /> : <IoEye className="h-5 w-5 text-gray-200" />}</div>
          </div>

          {confirmPassword && (
            <div className="flex items-center text-xs">
              {password === confirmPassword ? <span className="text-green-400">{t('passwords_match')}</span> : <span className="text-red-400">{t('passwords_do_not_match')}</span>}
            </div>
          )}

          {error && <p className="text-sm text-center text-red-400">{error}</p>}

          <div className="flex justify-center pt-2">
            <button type="submit" disabled={isLoading || !isPasswordValid() || password !== confirmPassword} className={`px-12 py-3 font-semibold text-white bg-white/10 border border-white/20 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20 hover:shadow-2xl hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-300 ${isLoading || !isPasswordValid() || password !== confirmPassword ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isLoading ? t('processing') : t('sign_up')}
            </button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-gray-300">
          {t('already_have_account')}{' '}
          <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-300">
            {t('sign_in')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}