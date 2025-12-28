import { ServiceProvider } from './contexts/ServiceContext';
import { ControlPanel } from './features/controls/ControlPanel';
import { ReaderView } from './features/reader/ReaderView';
import { useReaderStore } from './features/reader/store/useReaderStore';
import { ModeToggle } from './components/ui/mode-toggle';
import { FocusLayout } from './layouts/FocusLayout';

function App() {
  const isReading = useReaderStore(state => state.isReading);
  const text = useReaderStore(state => state.text);
  const setIsReading = useReaderStore(state => state.setIsReading);

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

        <FocusLayout
          isReading={isReading}
          hasText={!!text}
          onBackToConfig={handleBackToConfig}
          controlPanelSlot={<ControlPanel />}
          readerViewSlot={<ReaderView />}
        />
      </div>
    </ServiceProvider>
  );
}

export default App;
