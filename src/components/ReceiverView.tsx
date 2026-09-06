import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Download, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { FilePreview } from './FilePreview';

interface ReceiverViewProps {
  initialCode?: string;
}

interface FileMetadata {
  code: string;
  fileName: string;
  mimeType: string;
  size: number;
  expiresAt: number;
  isP2POnly: boolean;
}

export const ReceiverView: React.FC<ReceiverViewProps> = ({ initialCode = '' }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [fileMeta, setFileMeta] = useState<FileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      const charArr = initialCode.toUpperCase().split('');
      setDigits(charArr);
      fetchFileByCode(initialCode.toUpperCase());
    }
  }, [initialCode]);

  const handleDigitChange = (index: number, value: string) => {
    const uppercaseVal = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!uppercaseVal && value !== '') return;

    const newDigits = [...digits];
    newDigits[index] = uppercaseVal.slice(-1);
    setDigits(newDigits);
    setErrorMsg(null);

    if (uppercaseVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      fetchFileByCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (pastedText.length > 0) {
      const charArr = pastedText.padEnd(6, '').split('');
      setDigits(charArr);
      if (pastedText.length === 6) {
        fetchFileByCode(pastedText);
      }
    }
  };

  const fetchFileByCode = async (code: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setFileMeta(null);
    setDownloadComplete(false);

    try {
      const res = await fetch(`/api/file/${code.toUpperCase()}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Code not found or file has expired.');
        }
        throw new Error('Failed to retrieve file details.');
      }

      const data = await res.json();
      setFileMeta(data);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Error fetching file.');
    }
  };

  const handleDownload = () => {
    if (!fileMeta) return;

    setDownloading(true);
    setDownloadProgress(20);

    const downloadUrl = `/api/download/${fileMeta.code}`;

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileMeta.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadProgress(100);
      setDownloading(false);
      setDownloadComplete(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 700);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 animate-fade-in">
      
      {/* Borderless Glass Card */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl p-8 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">Enter 6-Digit Access Code</h2>
          <p className="text-xs text-slate-400">Type or paste code to unlock shared file</p>
        </div>

        {/* 6 Auto-advancing Digits */}
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-14 text-center text-xl font-black font-mono-code rounded-2xl transition-all outline-none ${
                digit
                  ? 'bg-slate-950 text-neon-cyan shadow-lg shadow-neon-cyan/20'
                  : 'bg-slate-950/60 text-white focus:bg-slate-950'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* File Found & Ready View */}
        {fileMeta && (
          <div className="space-y-6 pt-4 animate-fade-in">
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 shadow-lg">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-6 h-6 text-neon-cyan flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{fileMeta.fileName}</p>
                  <p className="text-xs text-slate-400 font-mono">{formatBytes(fileMeta.size)}</p>
                </div>
              </div>
            </div>

            {/* Instant File Preview */}
            <FilePreview
              code={fileMeta.code}
              fileName={fileMeta.fileName}
              mimeType={fileMeta.mimeType}
              size={fileMeta.size}
            />

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={`btn-saas-primary w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 ${
                downloadComplete
                  ? 'bg-emerald-500 text-dark-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-neon-cyan via-neon-purple to-pink-500 text-dark-950 shadow-neon-cyan/20'
              }`}
            >
              {downloadComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Downloaded! Download Again</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Downloading...' : 'Download File'}</span>
                </>
              )}
            </button>

          </div>
        )}

      </div>

    </div>
  );
};
