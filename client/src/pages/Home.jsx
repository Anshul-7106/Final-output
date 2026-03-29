import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden transition-colors duration-300">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border-b border-yellow-500/10 transition-colors duration-300">
        {/* Soft abstract waves in background */}
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[300px] bg-yellow-500/10 rounded-[100%] blur-3xl rotate-12 -z-10 animate-pulse"></div>
        <div className="absolute top-[40%] -right-[10%] w-[50%] h-[300px] bg-amber-600/10 rounded-[100%] blur-3xl -rotate-12 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center mb-10"
          >
            <div className="w-48 h-48 md:w-56 md:h-56 bg-black/40 rounded-[2.5rem] border border-yellow-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.2)] relative overflow-hidden backdrop-blur-xl group">
              <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent group-hover:from-yellow-500/20 transition-all duration-500"></div>
              <img src="/logo.png" alt="Encore Ascend Logo" className="w-36 h-36 md:w-44 md:h-44 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.style.display='none'; }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] px-4 py-2 rounded-full text-yellow-500 font-bold text-sm transition-colors duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
            Elevate your academic journey
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-black mb-6 tracking-tighter text-gray-900 dark:text-white leading-[1.1] drop-shadow-md transition-colors duration-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Think better with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Encore Ascend</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium mb-10 leading-relaxed drop-shadow-sm transition-colors duration-300"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Organize notes, assignments and schedules all together. Premium courses and materials designed to help you build real skills and progress faster.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {!user ? (
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-2xl text-lg shadow-[0_10px_20px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_30px_rgba(234,179,8,0.4)] hover:-translate-y-1 transition-all duration-300">
                  Get started
                </Link>
            ) : (
                <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-2xl text-lg shadow-[0_10px_20px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_30px_rgba(234,179,8,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  Go to Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* About Us Animated Phone Section */}
      <section className="py-24 bg-white dark:bg-zinc-900 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-600 opacity-5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 transition-colors duration-300">
                Our vision is to organize effortlessly.
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed mb-8 transition-colors duration-300">
                We believe learning should be accessible, organized, and beautifully designed. Our platform bridges the gap between raw information and true understanding seamlessly.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Stay organized", desc: "Access folders, notes, and curriculum instantly. No messy links." },
                  { title: "Document everything", desc: "Your resources are safely stored in the cloud, always ready." },
                  { title: "Streamline workflow", desc: "Focus purely on learning while we handle the organization." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-yellow-500/20 text-yellow-500 flex items-center justify-center shadow-lg transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-yellow-500 mb-1">{item.title}</h4>
                      <p className="text-gray-500 dark:text-zinc-500 font-medium transition-colors duration-300">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Animated Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
              className="flex justify-center"
            >
              <div className="relative w-[320px] max-w-[90vw] h-[650px] bg-gray-50 dark:bg-zinc-900 rounded-[3.5rem] border-[8px] border-gray-300 dark:border-zinc-700 shadow-[0_0_50px_rgba(234,179,8,0.15)] flex flex-col items-center transition-colors duration-300">
                
                {/* Screen Content */}
                <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 flex flex-col items-center justify-center p-6 relative rounded-[2.8rem] transition-colors duration-300">
                  
                  {/* Notch (Inside screen styling for effect) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-50 dark:bg-zinc-900 border-b border-l border-r border-gray-300 dark:border-zinc-700 rounded-b-3xl z-20 transition-colors duration-300"></div>

                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="z-10 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(234,179,8,0.1)] border border-yellow-500/20 flex items-center justify-center relative overflow-hidden transition-colors duration-300"
                  >
                    <div className="absolute inset-0 bg-yellow-500 opacity-5"></div>
                    <img src="/logo.png" alt="EA Logo" className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" onError={(e) => { e.target.style.display='none'; }} />
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="z-10 mt-10 text-center w-full px-4"
                  >
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 tracking-wider mb-2 drop-shadow-md">
                      ENCORE ASCEND
                    </h3>
                    <p className="text-sm font-bold text-yellow-500 bg-yellow-500/10 py-1.5 rounded-lg inline-block px-4 shadow-sm border border-yellow-500/20">
                      Your Library
                    </p>
                  </motion.div>

                  {/* Fake UI cards */}
                  <div className="w-full mt-10 space-y-4 px-2">
                    <motion.div 
                       initial={{ opacity: 0, x: 20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.7 }}
                       className="w-full h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-3 relative overflow-hidden transition-colors duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                         <div className="w-4 h-4 rounded-sm bg-yellow-500"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded-full w-full transition-colors duration-300"></div>
                        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full w-2/3 transition-colors duration-300"></div>
                      </div>
                    </motion.div>
                    <motion.div 
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.9 }}
                       className="w-full h-16 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 flex items-center px-4 gap-3 relative overflow-hidden transition-colors duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-300">
                        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-zinc-600 transition-colors duration-300"></div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded-full w-5/6 transition-colors duration-300"></div>
                        <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full w-1/2 transition-colors duration-300"></div>
                      </div>
                    </motion.div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-yellow-500/20 py-12 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-4">
             <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" onError={(e) => { e.target.style.display='none'; }} />
             <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Encore Ascend</span>
          </div>
          <p className="text-zinc-500 font-medium">© {new Date().getFullYear()} Encore Ascend. Education evolved.</p>
        </div>
      </footer>
    </div>
  );
}
