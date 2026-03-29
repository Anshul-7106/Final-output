const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'src', 'pages', 'Login.jsx'),
  path.join(__dirname, 'src', 'pages', 'Signup.jsx'),
  path.join(__dirname, 'src', 'pages', 'ResetPassword.jsx')
];

const newLogoBlock = `<div className="mb-8 w-48 h-48 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] p-6 transition-transform hover:scale-105 duration-500">
            <img src="/logo.png" alt="EA Encore Ascend Logo" className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }} />
            <div className="hidden text-center w-full">
              <span className="block text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider drop-shadow-lg leading-none">EA</span>
              <span className="block text-sm font-bold text-yellow-500 tracking-widest mt-2 uppercase">Encore Ascend</span>
            </div>
          </div>`;

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Replace the SVG Logo block
    content = content.replace(
      /<div className="w-20 h-20 mb-8 mx-auto[\s\S]*?<\/div>\s*<h1/g,
      newLogoBlock + '\n          <h1'
    );

    // 2. Left side background gradients
    content = content.replace(/from-amber-700 via-yellow-600 to-amber-500/g, 'from-black via-zinc-900 to-yellow-600 border-r border-yellow-600/20');
    content = content.replace(/bg-yellow-300 opacity-20/g, 'bg-yellow-500 opacity-20');
    content = content.replace(/bg-white opacity-10/g, 'bg-black opacity-40');
    
    // 3. Text colors on left panel
    content = content.replace(/text-amber-50/g, 'text-zinc-300');
    
    // 4. Gradient text overrides (Welcome to, Sign in to, Start your)
    content = content.replace(/from-amber-600 to-yellow-600/g, 'from-yellow-400 to-yellow-600');
    content = content.replace(/Welcome to the Future of Learning/g, 'Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Encore Ascend</span>');
    
    // 5. Button main styles
    content = content.replace(
      /bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500/g,
      'bg-black hover:bg-zinc-900 border border-yellow-500 text-yellow-500 font-extrabold rounded-xl shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
    );

    // Some buttons were amber already
    content = content.replace(
      /bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white/g,
      'bg-black hover:bg-zinc-900 border border-yellow-500 text-yellow-500'
    );
    
    // 6. Replacing remaining ambers to yellow globally
    content = content.replace(/text-amber-600/g, 'text-yellow-600');
    content = content.replace(/text-amber-700/g, 'text-yellow-400'); // hover links
    content = content.replace(/text-amber-800/g, 'text-yellow-500'); // other hovers
    
    content = content.replace(/focus:border-amber-500/g, 'focus:border-yellow-500');
    content = content.replace(/focus:ring-amber-200/g, 'focus:ring-yellow-500/30');
    content = content.replace(/focus:ring-amber-500/g, 'focus:ring-yellow-500');
    content = content.replace(/shadow-amber-200/g, 'shadow-yellow-500/20');
    
    content = content.replace(/group-focus-within:text-amber-600/g, 'group-focus-within:text-yellow-500');
    
    // Spinner
    content = content.replace(/border-amber-600/g, 'border-yellow-500');

    // Make social buttons match dark design theme or keep simple
    // they are fine as is, but we can make titles look sharp
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  } else {
    console.log("Not found", file);
  }
}
