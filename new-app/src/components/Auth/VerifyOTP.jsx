import React, { useState, useEffect, useRef } from 'react';
import AuthLayout from './AuthLayout';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function VerifyOTP({ email, onBack, onVerificationSuccess }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const submitTimeoutRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    // Clean up timeout on component unmount
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isLoading || otp.length !== 6) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Awaiting admin approval.');
        setTimeout(() => {
          if (onVerificationSuccess) {
            onVerificationSuccess();
          }
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setIsAutoSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setCanResend(false);
    setCountdown(60);
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
      } else {
        setSuccess('New OTP sent to your email.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError(''); // Clear any previous errors when typing
    
    // Auto-submit when 6 digits are entered with a small delay
    if (value.length === 6 && !isAutoSubmitting) {
      setIsAutoSubmitting(true);
      
      // Clear any existing timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      
      // Add a small delay to ensure the input is fully updated
      submitTimeoutRef.current = setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 space-y-8 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20">
        <button 
          onClick={onBack}
          className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white tracking-wider font-classic">
            Verify Email
          </h2>
          <p className="mt-2 text-gray-200 font-classicc">
            Enter the OTP sent to {email}
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-200" />
            </div>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              className="block w-full pl-10 pr-4 py-3 text-white bg-white/10 placeholder-gray-300 border border-white/20 rounded-lg shadow-inner backdrop-blur-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-white/20 sm:text-sm text-center tracking-widest text-xl"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-center text-red-400 animate-pulse">{error}</p>
          )}
          
          {success && (
            <div className="flex items-center justify-center text-sm text-center text-green-400">
              <FaCheckCircle className="mr-2" /> {success}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`
                px-12 py-3 font-semibold text-white bg-white/10 border border-white/20 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20 hover:shadow-2xl hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-300
                ${(isLoading || otp.length !== 6) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-300">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-300 disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-gray-400">
                Resend in {countdown}s
              </span>
            )}
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}