import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, error: authError, setError } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & messaging states
  const [emailWarning, setEmailWarning] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (val) => {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(val)) {
      setEmailWarning('Warning: This email does not appear to be correct.');
      return false;
    }
    setEmailWarning('');
    return true;
  };

  const handleEmailBlur = () => {
    if (email) validateEmail(email);
  };

  const clearErrors = () => {
    setEmailWarning('');
    setPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setError(null);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!validateEmail(email)) return;
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccessMessage('Successfully logged in!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        if (result.message?.toLowerCase().includes('password')) {
          setPasswordError(result.message);
        } else {
          setGeneralError(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen font-sans bg-gray-50/50">

      {/* Left side: branding/illustration (hidden on small screens) */}
      <div className="hidden lg:flex flex-col w-1/2 justify-center items-center bg-gradient-to-br from-black via-zinc-500 to-yellow-600 border-r border-yellow-600/20 overflow-hidden relative p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-black opacity-40 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

        <div className="z-10 max-w-md text-center">
          <div className="mb-6 w-64 h-64 lg:w-72 lg:h-72 mx-auto flex items-center justify-center p-2 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-xl leading-none">EA</span>
              <span className="block text-lg font-bold text-yellow-500 tracking-widest mt-3 uppercase">Encore Ascend</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Encore Ascend</span>
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md">
            Unlock your potential with world-class courses and an amazing community. Log in to continue your journey.
          </p>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">
              Sign In to Your Account
            </h2>
            <p className="text-gray-500 mt-2 font-medium">Please enter your details to proceed</p>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-green-50 text-green-700 flex items-center gap-3 border border-green-200 shadow-sm animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          {(generalError || authError) && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 flex items-start gap-3 border border-red-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-sm font-semibold">{generalError || authError}</p>
            </div>
          )}

          {/* Form container */}
          <div className="bg-white">
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${emailWarning ? 'text-orange-400' : 'text-gray-400 group-focus-within:text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input
                    type="email"
                    placeholder="e.g., student@example.com"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all
                      ${emailWarning ? 'border-orange-300 focus:ring-orange-200 bg-orange-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    required
                    disabled={loading}
                  />
                </div>
                {emailWarning && <p className="mt-1.5 text-xs text-orange-600 font-medium flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{emailWarning}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link
                    to="/reset-password"
                    className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 hover:underline focus:outline-none transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${passwordError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`block w-full pl-11 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all
                      ${passwordError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
                {passwordError && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{passwordError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-black hover:bg-zinc-900 border border-yellow-500 text-yellow-500 font-bold rounded-xl shadow-lg shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm font-medium text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-yellow-600 font-bold hover:text-yellow-500 transition-colors hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
