import React from 'react';
import { Sparkles, Flame, Crown } from 'lucide-react';

export const ChakriWatermark: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center my-2 pointer-events-auto">
      
      {/* Prominent Glowing Glass Badge Watermark */}
      <div className="relative group cursor-default">
        
        {/* Shifting Gradient Glow Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-purple via-pink-500 to-amber-400 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-glow" />

        {/* Floating Glassmorphism Container */}
        <div className="relative px-5 py-2.5 bg-dark-950/80 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl flex items-center gap-3">
          
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-pink-500 p-[1px] flex items-center justify-center shadow-lg shadow-neon-cyan/20 animate-float">
            <div className="w-full h-full bg-dark-950 rounded-[11px] flex items-center justify-center">
              <Crown className="w-4 h-4 text-neon-cyan" />
            </div>
          </div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-purple via-pink-400 to-amber-300 animate-shimmer neon-text-cyan">
                IT'S JUST CHAKRI'S THINGS
              </span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Exclusive Futuristic P2P Portal
            </span>
          </div>

          <Flame className="w-4 h-4 text-pink-400 animate-pulse hidden sm:block" />

        </div>

      </div>

      {/* Subtle Background Watermark Text Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none">
        <span className="text-[10vw] font-black tracking-widest uppercase text-white font-mono-code whitespace-nowrap rotate-[-12deg] blur-[1px]">
          IT'S JUST CHAKRI'S THINGS
        </span>
      </div>

    </div>
  );
};
