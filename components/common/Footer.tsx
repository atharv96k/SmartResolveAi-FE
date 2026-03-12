import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, Cpu } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900/50 backdrop-blur-md border-t border-slate-800/60 pt-12 pb-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center">
          
          {/* Brand Logo & Updated Tagline */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-2xl font-black text-white tracking-tighter hover:opacity-80 transition-opacity">
              <Cpu size={24} className="text-sky-400 mr-2" />
              SmartResolve<span className="text-sky-400">AI</span>
            </Link>
            <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto italic">
              Empowering organizations with an AI-Driven Help Desk System for rapid issue resolution.
            </p>
          </div>

       

          {/* Minimalist Social Icons */}
          <div className="flex items-center gap-4 mb-10">
            {[
              { icon: <Github size={18} />, href: "#" },
              { icon: <Linkedin size={18} />, href: "#" },
              { icon: <Twitter size={18} />, href: "#" },
              { icon: <Mail size={18} />, href: "#" }
            ].map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                className="p-2.5 bg-slate-800/40 border border-slate-700/50 rounded-full text-slate-400 hover:text-sky-400 hover:border-sky-500/50 transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Bottom Bar: Copyright and Attribution */}
          <div className="w-full border-t border-slate-800/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
            <div className="flex items-center gap-2">
              © {currentYear} <span className="text-slate-400">SmartResolve-AI</span> 
            </div>
            
            <div className="flex items-center gap-1">
              Developed with <Heart size={12} className="text-sky-500 fill-sky-500" /> by 
              <span className="text-sky-400">Atharv Mohite</span>
            </div>
           
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;