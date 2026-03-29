import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { auth } from '../firebase';

const AboutUs = ({ user }) => {
  const navigate = useNavigate();
  const isAdmin = user && ["admin@gmail.com", "sudhanshray10@gmail.com", "vs5825982@gmail.com"].includes(user.email);
  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* Abstract Glows */}
        <div className="absolute top-0 left-[-10%] w-96 h-96 bg-yellow-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-[-10%] w-96 h-96 bg-yellow-600 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div 
          className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
            Learn New Skills.<br/> 
            Advance Your<br/> Career. <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Anytime<br/> Anywhere.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-zinc-400 mb-8 max-w-xl transition-colors duration-300">
            We've built this digital library to ensure our students have everything they need to succeed at their fingertips. World-class education without friction.
          </motion.p>
          
          <motion.div variants={fadeUp} className="relative w-full max-w-md">
            <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full px-6 py-4 shadow-xl focus-within:border-yellow-500/50 focus-within:ring-1 focus-within:ring-yellow-500/30 transition-all duration-300">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="bg-transparent text-gray-900 dark:text-zinc-200 placeholder-gray-500 dark:placeholder-zinc-500 w-full focus:outline-none text-lg transition-colors duration-300"
              />
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-full transition-colors ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="lg:w-1/2 w-full max-w-lg lg:max-w-full relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="aspect-[4/5] lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-yellow-500/10 border border-zinc-800/50 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="Student learning" 
              className="w-full h-full object-cover"
            />
            {/* Overlay stats card like in premium designs */}
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-zinc-800/80 backdrop-blur-md border border-gray-200 dark:border-zinc-700 p-4 rounded-2xl z-20 flex items-center gap-4 shadow-xl transition-colors duration-300">
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="font-bold text-lg">250K+</p>
                <p className="text-gray-500 dark:text-zinc-400 text-sm transition-colors duration-300">Active Learners</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. OUR STORY / PURPOSE */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20 md:mb-32"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
        >
          <motion.h2 variants={fadeUp} className="text-sm font-bold text-yellow-500 tracking-widest uppercase mb-4">Our Story</motion.h2>
          <motion.h3 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">Empowering Learners,<br/>Elevating Futures.</motion.h3>
          <motion.p variants={fadeUp} className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-medium transition-colors duration-300">
            Encore Ascend Private Limited is an education and technology company based in Haryana, India, built with the simple belief that quality education should be accessible to everyone. We are dedicated to helping individuals grow through skill development, coaching, training, and digital education that is practical, engaging, and built for the real world.
          </motion.p>
        </motion.div>

        {/* BRIDGING THE GAP */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center mb-24 md:mb-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="order-2 md:order-1">
            <motion.div variants={fadeUp} className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </motion.div>
            <motion.h4 variants={fadeUp} className="text-3xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-300">Bridging the Gap in Modern Education</motion.h4>
            <motion.p variants={fadeUp} className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed mb-6 transition-colors duration-300">
              At Encore Ascend, we understand that the way people learn is changing. Traditional classrooms are no longer the only path to knowledge, and we are here to bridge the gap between where learners are today and where they want to be tomorrow.
            </motion.p>
            <motion.p variants={fadeUp} className="text-gray-600 dark:text-zinc-400 text-lg leading-relaxed transition-colors duration-300">
              Through our online education programs, digital learning solutions, and carefully developed content, we bring education directly to you, wherever you are, whenever you need it.
            </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} viewport={{ once: true }} className="order-1 md:order-2">
            <div className="aspect-square md:aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-yellow-500/10 relative border border-zinc-800/50 group">
               <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Online Education" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/80 to-transparent"></div>
               <div className="absolute inset-0 bg-yellow-500/10 mix-blend-overlay"></div>
            </div>
          </motion.div>
        </div>

        {/* 3. CORE PILLARS GRID */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-24 md:mb-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/80 p-8 lg:p-10 rounded-[2rem] hover:border-yellow-500/50 transition-colors duration-300 group shadow-sm">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Comprehensive Materials</h4>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed transition-colors duration-300">
              We create and distribute educational materials including video courses, e-books, written guides, and interactive content that makes complex topics simple and easy to understand.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/80 p-8 lg:p-10 rounded-[2rem] hover:border-yellow-500/50 transition-colors duration-300 group shadow-sm">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Practical Skills</h4>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed transition-colors duration-300">
              We don't just teach theory; we focus on giving learners the tools, knowledge, and confidence they need to apply what they have learned in the real world, aligned with industry demands.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/80 p-8 lg:p-10 rounded-[2rem] hover:border-yellow-500/50 transition-colors duration-300 group shadow-sm">
            <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h4 className="text-xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors duration-300">EdTech Innovation</h4>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed transition-colors duration-300">
              We continuously explore new ways to use technology to improve how knowledge is delivered, consumed, and retained, building platforms that make learning engaging and efficient.
            </p>
          </motion.div>
        </div>

        {/* 4. FINAL CTA / PERSONAL APPROACH */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-[2.5rem] p-10 md:p-16 lg:p-20 relative overflow-hidden shadow-2xl transition-colors duration-300">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-600 opacity-5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight transition-colors duration-300">Education is not a one-size-fits-all journey.</h3>
            <p className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl mb-8 leading-relaxed transition-colors duration-300">
              That's why we work hard to offer diverse learning experiences that suit different goals, backgrounds, and learning styles. From structured coaching programs to self-paced digital courses, our offerings are built to meet learners where they are.
            </p>
            <div className="h-px w-32 bg-yellow-500/30 mx-auto mb-8"></div>
            <p className="text-gray-900 dark:text-white font-medium text-xl md:text-2xl px-4 transition-colors duration-300">
              Whether you are discovering us for the first time or have been part of our growing community, we welcome you.<br/><span className="text-yellow-500 font-bold mt-4 inline-block">At Encore Ascend, your growth is our goal and we are just getting started.</span>
            </p>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 py-12 text-center relative z-10 transition-colors duration-300">
        <div className="flex items-center justify-center gap-3 mb-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" onError={(e) => e.target.style.display='none'}/>
          <span className="font-extrabold text-xl tracking-tight">Encore Ascend</span>
        </div>
        <p className="text-gray-500 dark:text-zinc-600 text-sm font-medium transition-colors duration-300">© {new Date().getFullYear()} Encore Ascend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;
