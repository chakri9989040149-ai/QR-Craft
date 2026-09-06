import React from 'react';
import { Lock, Timer, ShieldCheck, Zap } from 'lucide-react';

export const SecurityBadges: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
      
      <div className="glass-card rounded-2xl p-5 space-y-2">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-neon-cyan" />
        </div>
        <h4 className="text-sm font-bold text-white">End-to-End Security</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Direct browser-to-browser WebRTC data channels protected with TLS 1.3 transport encryption.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-2">
        <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
          <Timer className="w-5 h-5 text-neon-purple" />
        </div>
        <h4 className="text-sm font-bold text-white">Auto-Destruct Timers</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Files automatically purge from memory & disk immediately upon expiration or maximum download limit.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-2">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        </div>
        <h4 className="text-sm font-bold text-white">Zero Account Required</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          No signups, no trackers, and no persistent logs. Instant peer pairing via 6-digit alphanumeric codes.
        </p>
      </div>

    </div>
  );
};
