import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, isAdmin, onLogout, searchBar }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <nav className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-yellow-500/20 sticky top-0 z-40 shadow-md transition-colors duration-300">
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-24">
          
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-10">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display='none'; }}/>
              </div>
              <div className="hidden sm:block">
                <span className="block text-2xl lg:text-3xl xl:text-4xl font-black text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-yellow-300 dark:to-yellow-600 tracking-wider leading-none drop-shadow-md transition-colors">EA</span>
                <span className="block text-[10px] md:text-xs xl:text-sm font-extrabold text-yellow-600 dark:text-yellow-500/80 tracking-widest mt-0.5 xl:mt-1 uppercase">Encore Ascend</span>
              </div>
            </Link>
            
            <div className="hidden lg:flex items-center gap-4 xl:gap-8 border-l border-gray-200 dark:border-zinc-800 pl-4 lg:pl-6 xl:pl-10 transition-colors">
              <Link to="/" className="text-[15px] font-bold text-gray-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors whitespace-nowrap">Home</Link>
              <Link to="/notes" className="text-[15px] font-bold text-gray-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors whitespace-nowrap">Resources & Notes</Link>
              <Link to="/video" className="text-[15px] font-bold text-gray-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors whitespace-nowrap">Video</Link>
              <Link to="/about" className="text-[15px] font-bold text-gray-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors whitespace-nowrap">About Us</Link>
              <Link to="/contact" className="text-[15px] font-bold text-gray-600 dark:text-zinc-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors whitespace-nowrap">Contact</Link>
              
              <div className="ml-2 xl:ml-4">
                {searchBar}
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 flex-shrink-0">

            {!user ? (
               <div className="flex items-center gap-4">
                 <Link to="/login" className="text-sm font-bold text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors">Sign In</Link>
                 <Link to="/signup" className="text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-5 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                   Sign Up
                 </Link>
               </div>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group" title="Go to Dashboard">
                   <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 flex items-center justify-center font-bold text-sm border border-yellow-200 dark:border-yellow-500/30 group-hover:bg-yellow-200 transition-colors">
                     {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                   </div>
                   <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{user.name || user.email}</span>
                </Link>
                {isAdmin && (
                  <span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs font-bold px-2 py-1 rounded border border-yellow-200 dark:border-yellow-500/30 mr-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                    Admin
                  </span>
                )}
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   {mobileMenuOpen ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                   )}
                </svg>
             </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 border-b border-zinc-800 px-4 pt-2 pb-4 space-y-2">
           <Link to="/" className="block text-zinc-300 font-bold hover:text-yellow-500 py-2">Home</Link>
           <Link to="/notes" className="block text-zinc-300 font-bold hover:text-yellow-500 py-2">Resources & Notes</Link>
           <Link to="/video" className="block text-zinc-300 font-bold hover:text-yellow-500 py-2">Video</Link>
           <Link to="/about" className="block text-zinc-300 font-bold hover:text-yellow-500 py-2">About Us</Link>
           <Link to="/contact" className="block text-zinc-300 font-bold hover:text-yellow-500 py-2">Contact</Link>
           {searchBar && <div className="py-2">{searchBar}</div>}
           <hr className="border-zinc-800 my-2" />
           {!user && (
             <div className="flex flex-col gap-2">
               <Link to="/login" className="text-center text-sm font-bold text-zinc-300 hover:text-white transition-colors py-2 border border-zinc-700 rounded-lg">Sign In</Link>
               <Link to="/signup" className="text-center text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 py-2 rounded-lg transition-colors">Sign Up</Link>
             </div>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
