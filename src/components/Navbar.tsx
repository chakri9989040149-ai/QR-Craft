import React from 'react';
import { Upload, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: 'send' | 'receive';
  setActiveTab: (tab: 'send' | 'receive') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="w-full pt-10 pb-4 px-4 flex flex-col items-center justify-center gap-6 z-20 relative">
      
      {/* High-Visibility Crisp Neon Title */}
      <div className="text-center space-y-2 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl md:text-6xl uppercase title-neon-sharp font-black leading-none pb-1">
          IT'S JUST CHAKRI'S THINGS
        </h1>
        <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-400 uppercase">
          INSTANT PEER-TO-PEER QR & 6-DIGIT DOCUMENT SHARING
        </p>
      </div>

      {/* Borderless Floating Glass Pill Navigation */}
      <div className="inline-flex items-center p-1.5 bg-slate-900/60 rounded-full backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setActiveTab('send')}
          className={`btn-saas-primary flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all ${
            activeTab === 'send'
              ? 'bg-gradient-to-r from-neon-cyan/25 to-blue-600/25 text-neon-cyan shadow-lg shadow-neon-cyan/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Upload className="w-4 h-4 text-neon-cyan" />
          <span>Upload File</span>
        </button>
        
        <button
          onClick={() => setActiveTab('receive')}
          className={`btn-saas-primary flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all ${
            activeTab === 'receive'
              ? 'bg-gradient-to-r from-neon-purple/25 to-pink-600/25 text-neon-purple shadow-lg shadow-neon-purple/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Download className="w-4 h-4 text-neon-purple" />
          <span>Receive Code</span>
        </button>
      </div>

    </header>
  );
};
