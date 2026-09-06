import React, { useState, useRef } from 'react';
import { Upload, FileUp, AlertCircle } from 'lucide-react';
import { TiltCard } from './TiltCard';

interface UploadDashboardProps {
  onUploadSuccess: (uploadData: {
    code: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiresAt: number;
  }) => void;
}

export const UploadDashboard: React.FC<UploadDashboardProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    if (selectedFile.size > 250 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 250MB.');
      return;
    }
    setFile(selectedFile);
    startUpload(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const startUpload = async (targetFile: File) => {
    setIsUploading(true);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', targetFile);
    formData.append('ttlMinutes', '10');

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 20 : prev));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      const data = await response.json();
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess({
          code: data.code,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          expiresAt: data.expiresAt,
        });
      }, 350);

    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setErrorMessage(err.message || 'Failed to process file.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in perspective-1000">
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      <TiltCard>
        <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl p-8 sm:p-12 text-center shadow-2xl space-y-6">
          
          {!isUploading ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer flex flex-col items-center justify-center gap-6 py-6 transition-all duration-300 ${
                isDragging ? 'scale-105' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Floating Glowing Icon */}
              <div className="btn-saas-primary w-20 h-20 rounded-3xl bg-slate-950/80 flex items-center justify-center shadow-2xl shadow-neon-cyan/20">
                <Upload className="w-9 h-9 text-neon-cyan" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Drag & Drop or Click to Upload Document/Image
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Supports Images, PDFs, Videos & Documents up to 250MB
                </p>
              </div>
            </div>
          ) : (
            /* Upload Progress State */
            <div className="py-8 space-y-5 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-neon-cyan/20">
                <FileUp className="w-8 h-8 text-neon-cyan animate-bounce" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-bold text-white truncate max-w-xs mx-auto">{file?.name}</p>
                <p className="text-xs text-slate-400 font-mono">{file && formatBytes(file.size)}</p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between text-xs font-semibold text-neon-cyan">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>
      </TiltCard>

    </div>
  );
};
