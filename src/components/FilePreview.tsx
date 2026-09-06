import React, { useState, useEffect } from 'react';
import { Eye, FileText, Image as ImageIcon, Film, Music, Download, Check, Code, Maximize2 } from 'lucide-react';

interface FilePreviewProps {
  code: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ code, fileName, mimeType, size }) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const downloadUrl = `/api/download/${code}`;
  const inlineUrl = `/api/download/${code}?inline=true`;

  const isImage = mimeType.startsWith('image/');
  const isPdf = mimeType.includes('pdf');
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');
  const isText = mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.json') || fileName.endsWith('.md') || fileName.endsWith('.js') || fileName.endsWith('.ts');

  useEffect(() => {
    if (isText) {
      setLoadingText(true);
      fetch(inlineUrl)
        .then((res) => res.text())
        .then((data) => {
          setTextContent(data.slice(0, 5000)); // Limit first 5000 chars for preview
          setLoadingText(false);
        })
        .catch(() => setLoadingText(false));
    }
  }, [code, isText, inlineUrl]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-neon-cyan" />
          <span>Instant File Preview</span>
        </h4>
        {isImage && (
          <button
            onClick={() => setShowFullImageModal(true)}
            className="text-xs text-neon-cyan hover:underline flex items-center gap-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Size</span>
          </button>
        )}
      </div>

      <div className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 p-4 overflow-hidden flex items-center justify-center min-h-[180px] max-h-[360px]">
        {isImage ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <img
              src={inlineUrl}
              alt={fileName}
              className="max-h-[300px] w-auto object-contain rounded-xl shadow-md cursor-pointer group-hover:opacity-95 transition-opacity"
              onClick={() => setShowFullImageModal(true)}
            />
          </div>
        ) : isPdf ? (
          <div className="w-full h-[300px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
            <iframe
              src={inlineUrl}
              title={fileName}
              className="w-full h-full border-none"
            />
          </div>
        ) : isVideo ? (
          <video controls className="w-full max-h-[280px] rounded-xl shadow-lg">
            <source src={inlineUrl} type={mimeType} />
            Your browser does not support video playback.
          </video>
        ) : isAudio ? (
          <div className="w-full p-6 flex flex-col items-center justify-center gap-3">
            <Music className="w-12 h-12 text-pink-400 animate-pulse" />
            <audio controls className="w-full max-w-md">
              <source src={inlineUrl} type={mimeType} />
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : isText ? (
          <div className="w-full text-left font-mono text-xs text-slate-300 overflow-x-auto bg-slate-900/80 p-4 rounded-xl border border-slate-800 max-h-[260px]">
            {loadingText ? (
              <p className="text-slate-500 animate-pulse">Loading text content...</p>
            ) : (
              <pre className="whitespace-pre-wrap break-words">{textContent}</pre>
            )}
          </div>
        ) : (
          /* Generic File Card Preview */
          <div className="text-center space-y-2 py-6">
            <FileText className="w-12 h-12 text-neon-cyan mx-auto" />
            <p className="text-xs text-slate-400">Preview not available for this file type.</p>
            <p className="text-xs font-semibold text-slate-300">Click download below to access complete file.</p>
          </div>
        )}
      </div>

      {/* Full Image Modal */}
      {showFullImageModal && (
        <div
          className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowFullImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <img src={inlineUrl} alt={fileName} className="max-h-[85vh] w-auto object-contain rounded-2xl border border-slate-700 shadow-2xl" />
            <button
              onClick={() => setShowFullImageModal(false)}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold border border-slate-700 hover:bg-slate-800"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
