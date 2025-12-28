import { useState, useEffect } from 'react';
import { ServiceProvider } from './contexts/ServiceContext';
import { ControlPanel } from './features/controls/ControlPanel';
import { ReaderView } from './features/reader/ReaderView';
import { useReaderStore } from './features/reader/store/useReaderStore';


import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './components/ui/button';
import { ModeToggle } from './components/ui/mode-toggle';

function App() {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [sourceLang, setSourceLang] = useState<string>('Auto');
  const [targetLang, setTargetLang] = useState<string>('English');

  // Sync state to global store (Senior Pattern: Store is Source of Truth)
  useEffect(() => {
    useReaderStore.getState().setConfig(text, sourceLang, targetLang);
  }, [text, sourceLang, targetLang]);

  const handleStartReading = () => {
    if (text.trim()) {
      setIsReading(true);
    }
  };

  const handleBackToConfig = () => {
    setIsReading(false);
  };

  return (
    <ServiceProvider>
      <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Reader Helper</h1>
          <ModeToggle />
        </header>

        <main className="flex flex-col gap-8 relative overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait">
            {!isReading ? (
              <motion.div
                key="control-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <ControlPanel
                  onTextChange={setText}
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                  setSourceLang={setSourceLang}
                  setTargetLang={setTargetLang}
                  onStartReading={handleStartReading}
                  initialText={text}
                />
              </motion.div>
            ) : (
              <motion.div
                key="reader-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col gap-4"
              >
                <Button
                  variant="ghost"
                  onClick={handleBackToConfig}
                  className="self-start mb-[-1rem] z-10 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  ← Back to Configuration
                </Button>
                <ReaderView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ServiceProvider>
  );
}

export default App;
