import { useState } from 'react';
import { ServiceProvider } from './contexts/ServiceContext';
import { ControlPanel } from './features/controls/ControlPanel';
import { ReaderView } from './features/reader/ReaderView';


function App() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState<string>('Auto');
  const [targetLang, setTargetLang] = useState<string>('English');

  return (
    <ServiceProvider>
      <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Reader Helper</h1>
        </header>

        <main className="flex flex-col gap-8">
          <ControlPanel
            onTextChange={setText}
            sourceLang={sourceLang}
            targetLang={targetLang}
            setSourceLang={setSourceLang}
            setTargetLang={setTargetLang}
          />
          {text && <ReaderView
            text={text}
            sourceLang={sourceLang}
            targetLang={targetLang}
          />}
        </main>
      </div>
    </ServiceProvider>
  );
}

export default App;
