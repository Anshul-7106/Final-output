import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [email, setEmail] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Verify the link is valid when the page loads
  useEffect(() => {
    if (!oobCode) {
      setGeneralError('Invalid or missing password reset code. Please request a new link.');
      setIsVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setIsValidCode(true);
        setIsVerifying(false);
      })
      .catch((error) => {
        setGeneralError('This password reset link has expired or is invalid. Please request a new one.');
        setIsVerifying(false);
      });
  }, [oobCode]);

  const clearErrors = () => {
    setPasswordError('');
    setConfirmError('');
    setGeneralError('');
    setSuccessMessage('');
  };

  const validatePassword = () => {
    clearErrors();
    let valid = true;

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      valid = false;
    } else if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one uppercase alphabet.');
      valid = false;
    } else if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase alphabet.');
      valid = false;
    } else if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Password must contain at least one number.');
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('Password must contain at least one special character.');
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Password and Confirm Password must match.');
      valid = false;
    }

    return valid;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage('Password successfully changed! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      setGeneralError('An error occurred while resetting your password. Please try again.');
    }
  };

  if (isVerifying) {
    return (
      <div className="flex w-full h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying your secure link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen font-sans bg-gray-50/50">
      
      {/* Left side: Beautiful branding */}
      <div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-yellow-600 border-r border-yellow-600/20 overflow-hidden relative p-12 text-white fixed h-screen">
        <div className="absolute top-0 left-0 w-80 h-80 bg-black opacity-40 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500 opacity-20 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 max-w-md text-center">
          <div className="mb-6 w-64 h-64 lg:w-72 lg:h-72 mx-auto flex items-center justify-center p-2 transition-transform hover:scale-105 duration-500">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-xl leading-none">EA</span>
              <span className="block text-lg font-bold text-yellow-500 tracking-widest mt-3 uppercase">Encore Ascend</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Secure Your Account
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md">
            Create a strong new password to regain access to your dashboard and continue learning.
          </p>
        </div>
      </div>

      {/* Right side: Reset form */}
      <div className="flex flex-col w-full lg:w-7/12 items-center justify-center p-6 sm:p-12 relative bg-white ml-auto min-h-screen">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">
              Create New Password
            </h2>
            {isValidCode && email && (
              <p className="text-gray-500 mt-2 font-medium">For account: <span className="font-bold text-amber-800">{email}</span></p>
            )}
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-green-50 text-amber-700 flex items-center gap-3 border border-green-200 shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          )}
          
          {generalError && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 flex flex-col items-start gap-2 border border-red-200 shadow-sm">
              <div className="flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-sm font-semibold">{generalError}</p>
              </div>
              <Link to="/login" className="mt-2 text-sm font-bold text-red-800 hover:underline">← Return to Login</Link>
            </div>
          )}

          {isValidCode && !successMessage && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-in fade-in zoom-in duration-300">
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${passwordError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    className={`block w-full pl-11 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${passwordError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                    value={newPassword}
                    onChange={(e) => {setNewPassword(e.target.value); setPasswordError('');}}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-600 hover:text-yellow-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-600 font-bold">{passwordError}</p>}
                <p className="text-xs text-gray-500 mt-2 font-medium">Must be 8+ chars and include uppercase, lowercase, number, and special character.</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${confirmError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${confirmError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                    value={confirmPassword}
                    onChange={(e) => {setConfirmPassword(e.target.value); setConfirmError('');}}
                  />
                </div>
                {confirmError && <p className="mt-1.5 text-xs text-red-600 font-bold">{confirmError}</p>}
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-3 px-4 bg-black hover:bg-zinc-900 border border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
