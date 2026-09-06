import React, { useState, useEffect } from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { Navbar } from './components/Navbar';
import { UploadDashboard } from './components/UploadDashboard';
import { ShareModal } from './components/ShareModal';
import { ReceiverView } from './components/ReceiverView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [urlCode, setUrlCode] = useState<string>('');
  const [uploadData, setUploadData] = useState<{
    code: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiresAt: number;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam && codeParam.length === 6) {
      setUrlCode(codeParam.toUpperCase());
      setActiveTab('receive');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between relative bg-[#07090e] text-slate-100 selection:bg-neon-cyan/30 selection:text-neon-cyan overflow-x-hidden">
      
      {/* Interactive Floating Particle Canvas */}
      <BackgroundCanvas />

      {/* Clean Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workflow Area */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6 z-10 relative flex-1 flex items-center justify-center">
        {activeTab === 'send' ? (
          !uploadData ? (
            <UploadDashboard onUploadSuccess={(data) => setUploadData(data)} />
          ) : (
            <ShareModal
              uploadData={uploadData}
              onReset={() => setUploadData(null)}
            />
          )
        ) : (
          <ReceiverView initialCode={urlCode} />
        )}
      </main>

      {/* Borderless Footer */}
      <footer className="z-10 py-6 px-4 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 • <span className="text-neon-cyan font-bold">IT'S JUST CHAKRI'S THINGS</span></p>
      </footer>

    </div>
  );
};

export default App;
