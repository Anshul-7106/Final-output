import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, error: authError, setError } = useAuth();

  // Registration Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Individual Validation Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');
    setSuccessMessage('');
    setError(null);
  };

  const validateForm = () => {
    let isValid = true;
    clearErrors();

    // 1. Name Validation (No Numbers)
    if (!name.trim()) {
      setNameError('Name is required.');
      isValid = false;
    } else if (/\d/.test(name)) {
      setNameError('Name should not contain any numbers.');
      isValid = false;
    }

    // 2. Email Validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    // 3. Phone Validation (Exactly 10 digits) - Optional
    if (phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        setPhoneError('Phone number must be exactly 10 digits.');
        isValid = false;
      }
    }

    // 4. Password Validation (Complex rules)
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter.');
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter.');
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number.');
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError('Password must contain at least one special character.');
      isValid = false;
    }

    // 5. Confirm Password Validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await signup({
        name: name.trim(),
        email: email.toLowerCase(),
        phone: phone || undefined,
        password
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Welcome aboard.');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        if (result.message?.toLowerCase().includes('email')) {
          setEmailError(result.message);
        } else {
          setGeneralError(result.message || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    clearErrors();
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        setSuccessMessage('Account created successfully with Google!');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setGeneralError(result.message || 'Google Signup failed. Please try again.');
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred with Google Sign-Up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen font-sans bg-gray-50/50 dark:bg-zinc-900 transition-colors duration-300">

      {/* Left side: branding/illustration (hidden on small screens) */}
      <div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-black via-zinc-500 to-yellow-600 border-r border-yellow-600/20 overflow-hidden relative p-12 text-white fixed h-screen">
        <div className="absolute top-0 right-0 w-80 h-80 bg-black opacity-40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="z-10 max-w-md text-center">
          <div className="mb-6 w-64 h-64 lg:w-72 lg:h-72 mx-auto flex items-center justify-center p-2 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-xl leading-none">EA</span>
              <span className="block text-lg font-bold text-yellow-500 tracking-widest mt-3 uppercase">Encore Ascend</span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Start Your Journey Today
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md">
            Join thousands of learners shaping their future. Creating an account takes less than a minute.
          </p>
        </div>
      </div>

      {/* Right side: Signup form */}
      <div className="flex flex-col w-full lg:w-7/12 items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-zinc-900 ml-auto min-h-screen transition-colors duration-300">
        <div className="w-full max-w-lg space-up-8 my-8">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">
              Create Your Account
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors duration-300">Please fill in your details to get started</p>
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-green-50 text-green-700 flex items-center gap-3 border border-green-200 shadow-sm animate-pulse mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          {(generalError || authError) && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 flex items-start gap-3 border border-red-200 shadow-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-sm font-semibold">{generalError || authError}</p>
            </div>
          )}

          {/* Form container */}
          <div className="bg-transparent">
            <form onSubmit={handleSignup} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${nameError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${nameError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                    value={name}
                    onChange={(e) => {setName(e.target.value); setNameError('');}}
                    disabled={loading}
                  />
                </div>
                {nameError && <p className="mt-1.5 text-xs text-red-600 font-bold">{nameError}</p>}
              </div>

              {/* Email and Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${emailError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${emailError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                      value={email}
                      onChange={(e) => {setEmail(e.target.value); setEmailError('');}}
                      disabled={loading}
                    />
                  </div>
                  {emailError && <p className="mt-1.5 text-xs text-red-600 font-bold">{emailError}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${phoneError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <input
                      type="tel"
                      placeholder="10 digit number"
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${phoneError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if(val.length <= 10) setPhone(val);
                        setPhoneError('');
                      }}
                      disabled={loading}
                    />
                  </div>
                  {phoneError && <p className="mt-1.5 text-xs text-red-600 font-bold">{phoneError}</p>}
                </div>
              </div>

              {/* Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${passwordError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      className={`block w-full pl-11 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${passwordError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                      value={password}
                      onChange={(e) => {setPassword(e.target.value); setPasswordError('');}}
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
                  {passwordError && <p className="mt-1.5 text-xs text-red-600 font-bold">{passwordError}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${confirmPasswordError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      className={`block w-full pl-11 pr-12 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${confirmPasswordError ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 focus:border-yellow-500 focus:ring-yellow-500/30'}`}
                      value={confirmPassword}
                      onChange={(e) => {setConfirmPassword(e.target.value); setConfirmPasswordError('');}}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && <p className="mt-1.5 text-xs text-red-600 font-bold">{confirmPasswordError}</p>}
                </div>
              </div>

              <div className="pt-2">
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
                      Creating account...
                    </span>
                  ) : (
                    'Register Account'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-zinc-700 transition-colors duration-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400 font-medium transition-colors duration-300">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-zinc-700 rounded-xl shadow-sm bg-white dark:bg-zinc-800 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5 flex-shrink-0" />
                Sign up with Google
              </button>
            </div>
          </div>

          <div className="text-center mt-8 pb-8">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
