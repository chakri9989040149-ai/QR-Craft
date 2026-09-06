import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowLeft, QrCode, Sparkles } from 'lucide-react';
import { TiltCard } from './TiltCard';

interface ShareModalProps {
  uploadData: {
    code: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiresAt: number;
  };
  onReset: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ uploadData, onReset }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [hostBaseUrl, setHostBaseUrl] = useState<string>(window.location.origin);

  useEffect(() => {
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.localIp && data.localIp !== '127.0.0.1') {
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const port = window.location.port ? `:${window.location.port}` : '';
            setHostBaseUrl(`${window.location.protocol}//${data.localIp}${port}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const shareUrl = `${hostBaseUrl.replace(/\/$/, '')}/?code=${uploadData.code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(uploadData.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in perspective-1000">
      
      <TiltCard>
        <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl p-8 text-center shadow-2xl space-y-6">
          
          {/* Borderless Floating Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/70 text-xs font-semibold text-slate-200 max-w-full shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
            <span className="truncate">{uploadData.fileName}</span>
            <span className="text-slate-400 font-mono">({formatBytes(uploadData.fileSize)})</span>
          </div>

          {/* Animated Neon Light Beam Border QR Container - ONLY PERIMETER WITH GLOW */}
          <div className="flex justify-center py-2">
            <div className="animated-glowing-border">
              <div className="animated-glowing-border-inner flex items-center justify-center p-3">
                <QRCodeSVG
                  value={shareUrl}
                  size={190}
                  bgColor="#ffffff"
                  fgColor="#07090e"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          </div>

          {/* 6-Digit Access Code & Sleek Copy Button */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              6-DIGIT ACCESS CODE
            </p>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 shadow-xl">
              <span className="text-3xl font-black tracking-widest text-neon-cyan font-mono-code neon-text-cyan pl-2">
                {uploadData.code}
              </span>
              
              <button
                onClick={handleCopyCode}
                className="btn-saas-primary px-5 py-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan text-xs font-extrabold uppercase tracking-wider hover:bg-neon-cyan/30 flex items-center gap-1.5 shadow-md"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Subtle Note */}
          <p className="text-xs text-slate-400 font-medium pt-1 flex items-center justify-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-neon-cyan animate-pulse" />
            <span>Scan with any mobile camera to view or download instantly.</span>
          </p>

          {/* Upload Another File Button */}
          <div className="pt-2">
            <button
              onClick={onReset}
              className="btn-saas-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/60 text-xs font-bold text-slate-300 hover:text-white shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Upload Another File</span>
            </button>
          </div>

        </div>
      </TiltCard>

    </div>
  );
};
