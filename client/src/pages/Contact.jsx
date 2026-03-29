import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { auth } from '../firebase';

const Contact = ({ user }) => {
  const navigate = useNavigate();
  const isAdmin = user && ["admin@gmail.com", "sudhanshray10@gmail.com", "vs5825982@gmail.com"].includes(user.email);
  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👉 IMPORTANT: UPDATE THIS WITH YOUR ACTUAL FORMSPREE ID
    const FORMSPREE_ID = "YOUR_FORMSPREE_ID"; 
    const formspreeEndpoint = `https://formspree.io/f/${FORMSPREE_ID}`;

    if (FORMSPREE_ID === "YOUR_FORMSPREE_ID") {
      alert("Admin: Please replace YOUR_FORMSPREE_ID on line 10 in Contact.jsx with your real Formspree string!");
      return; 
    }

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message
        })
      });
      
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setForm({ name: '', email: '', message: '' }); }, 3000);
      } else {
        alert("Oops! There was a problem sending your message.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to the mail server.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans overflow-x-hidden">
      {/* Header */}
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="py-20 relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-600 opacity-5 rounded-full blur-[100px]"></div>
        
        <div className="max-w-xl w-full mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Touch</span>
          </h1>
          <p className="text-center text-zinc-400 mb-10 font-medium">Have questions about our resources? We're here to help.</p>

          <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            
            {submitted ? (
              <div className="text-center py-12 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Your Name</label>
                  <input 
                    type="text" required
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Email Address</label>
                  <input 
                    type="email" required
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-300 mb-2">Your Message</label>
                  <textarea 
                    required rows="4"
                    value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 mt-2">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      <footer className="bg-zinc-900 border-t border-yellow-500/20 py-8 text-center mt-12 w-full">
        <p className="text-zinc-600 text-sm font-medium">© {new Date().getFullYear()} Encore Ascend. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;
