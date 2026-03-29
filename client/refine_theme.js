const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'src', 'pages', 'Login.jsx');
const signupPath = path.join(__dirname, 'src', 'pages', 'Signup.jsx');
const resetPath = path.join(__dirname, 'src', 'pages', 'ResetPassword.jsx');

// Define the exact old panels based on current file states
const oldLoginPanel = `<div className="hidden lg:flex flex-col w-1/2 justify-center items-center bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-500 overflow-hidden relative p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-300 opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 max-w-md text-center">
          <div className="w-20 h-20 mb-8 mx-auto bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-xl border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Welcome to the Future of Learning
          </h1>
          <p className="text-lg font-medium text-amber-50 opacity-90 drop-shadow-md">
            Unlock your potential with world-class courses and an amazing community. Log in to continue your journey.
          </p>
        </div>
      </div>`;

const newLoginPanel = `<div className="hidden lg:flex flex-col w-1/2 justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-yellow-600 overflow-hidden relative p-12 text-yellow-500">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500 opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-40 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 max-w-md text-center flex flex-col items-center">
          {/* Logo Container */}
          <div className="mb-8 w-48 h-48 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] p-6 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-lg leading-none">EA</span>
              <span className="block text-sm font-bold text-yellow-500 tracking-widest mt-2 uppercase">Encore Ascend</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight text-white shadow-black/50 drop-shadow-xl">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Encore Ascend</span>
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md max-w-sm">
            Learn, Leap, Lead. Log in to continue your journey and unlock your potential.
          </p>
        </div>
      </div>`;

const oldSignupPanel = `<div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-500 overflow-hidden relative p-12 text-white fixed h-screen">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="z-10 max-w-md text-center">
          <div className="w-20 h-20 mb-8 mx-auto bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-xl border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Start Your Journey Today
          </h1>
          <p className="text-lg font-medium text-amber-50 opacity-90 drop-shadow-md">
            Join thousands of learners shaping their future. Creating an account takes less than a minute.
          </p>
        </div>
      </div>`;

const newSignupPanel = `<div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-yellow-600 overflow-hidden relative p-12 text-yellow-500 fixed h-screen">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500 opacity-20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black opacity-40 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="z-10 max-w-md text-center flex flex-col items-center">
          {/* Logo Container */}
          <div className="mb-8 w-48 h-48 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] p-6 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-lg leading-none">EA</span>
              <span className="block text-sm font-bold text-yellow-500 tracking-widest mt-2 uppercase">Encore Ascend</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight text-white shadow-black/50 drop-shadow-xl">
            Start Your Journey
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md max-w-sm">
            Learn, Leap, Lead. Creating an account takes less than a minute.
          </p>
        </div>
      </div>`;

const oldResetPanel = `<div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-amber-700 via-yellow-600 to-amber-500 overflow-hidden relative p-12 text-white fixed h-screen">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 max-w-md text-center">
          <div className="w-20 h-20 mb-8 mx-auto bg-white/20 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-xl border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight shadow-black/10 drop-shadow-lg">
            Secure Your Account
          </h1>
          <p className="text-lg font-medium text-amber-50 opacity-90 drop-shadow-md">
            Create a strong new password to regain access to your dashboard and continue learning.
          </p>
        </div>
      </div>`;

const newResetPanel = `<div className="hidden lg:flex flex-col w-5/12 justify-center items-center bg-gradient-to-br from-black via-zinc-900 to-yellow-600 overflow-hidden relative p-12 text-yellow-500 fixed h-screen">
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black opacity-40 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="z-10 max-w-md text-center flex flex-col items-center">
          {/* Logo Container */}
          <div className="mb-8 w-48 h-48 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] p-6 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-lg leading-none">EA</span>
              <span className="block text-sm font-bold text-yellow-500 tracking-widest mt-2 uppercase">Encore Ascend</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight text-white shadow-black/50 drop-shadow-xl">
            Secure Your Account
          </h1>
          <p className="text-lg font-medium text-zinc-300 opacity-90 drop-shadow-md max-w-sm">
            Create a strong new password to regain access to your dashboard and continue learning.
          </p>
        </div>
      </div>`;


function replaceColors(content) {
  return content
    // Replace gradient text strings with gold tones instead of amber
    .replace(/from-amber-600 to-yellow-600/g, 'from-yellow-400 to-yellow-600')
    // Make primary buttons black with gold border/glow or gold with black text
    .replace(/bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white/g, 'bg-black border border-yellow-500 hover:bg-zinc-900 text-yellow-500')
    .replace(/\btext-amber-600\b/g, 'text-yellow-600')
    .replace(/\btext-amber-700\b/g, 'text-yellow-700')
    .replace(/\btext-amber-800\b/g, 'text-yellow-800')
    .replace(/\btext-amber-50\b/g, 'text-yellow-50')
    .replace(/\bshadow-amber-200\b/g, 'shadow-yellow-500/20')
    // Inputs focus
    .replace(/\bgroup-focus-within:text-amber-600\b/g, 'group-focus-within:text-yellow-500')
    .replace(/\bfocus:border-amber-500\b/g, 'focus:border-yellow-500')
    .replace(/\bfocus:ring-amber-200\b/g, 'focus:ring-yellow-500/30')
    .replace(/\bfocus:ring-amber-500\b/g, 'focus:ring-yellow-500')
    .replace(/\bh-12 w-12 border-b-2 border-amber-600\b/g, 'h-12 w-12 border-b-2 border-yellow-500') // spinner
    .replace(/\btext-teal-600\b/g, 'text-yellow-600')
    .replace(/\btext-teal-700\b/g, 'text-yellow-700')
    // Button styling replacing 'amber' button with gold matching
    .replace(/w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white/g, 'w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black')
    // Phone verify buttons (gray and green)
    .replace(/from-gray-800 to-gray-900 hover:from-black hover:to-black text-white/g, 'bg-black hover:bg-zinc-900 text-yellow-500 border border-yellow-500/30')
    .replace(/from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white/g, 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black')
    // Links etc
    .replace(/bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600/g, 'bg-clip-text text-transparent bg-gradient-to-r from-black to-zinc-700 drop-shadow-sm');
}

// Read and Replace
if (fs.existsSync(loginPath)) {
  let content = fs.readFileSync(loginPath, 'utf8');
  content = content.replace(oldLoginPanel, newLoginPanel);
  content = replaceColors(content);
  fs.writeFileSync(loginPath, content);
  console.log("Updated Login.jsx");
}

if (fs.existsSync(signupPath)) {
  let content = fs.readFileSync(signupPath, 'utf8');
  content = content.replace(oldSignupPanel, newSignupPanel);
  content = replaceColors(content);
  fs.writeFileSync(signupPath, content);
  console.log("Updated Signup.jsx");
}

if (fs.existsSync(resetPath)) {
  let content = fs.readFileSync(resetPath, 'utf8');
  content = content.replace(oldResetPanel, newResetPanel);
  content = replaceColors(content);
  fs.writeFileSync(resetPath, content);
  console.log("Updated ResetPassword.jsx");
}

