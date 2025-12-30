import { ServiceProvider } from './contexts/ServiceContext';
import { ControlPanel } from './features/controls/ControlPanel';
import { ReaderView } from './features/reader/ReaderView';
import { useReaderStore } from './features/reader/store/useReaderStore';
import { ModeToggle } from './components/ui/mode-toggle';
import { FocusLayout } from './layouts/FocusLayout';
import { useFocusMode } from './features/reader/hooks/useFocusMode';

function App() {
  // Use the selector to subscribe to updates
  const isReading = useReaderStore(state => state.isReading);

  return (
    <ServiceProvider>
      <div className={`container mx-auto py-8 px-4 min-h-screen ${isReading ? 'max-w-[95vw]' : 'max-w-4xl'}`}>
        <AppContent />
      </div>
    </ServiceProvider>
  );
}

function AppContent() {
  const { isReading, hasText, exitReaderMode } = useFocusMode();

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Reader Helper</h1>
        <ModeToggle />
      </header>

      <FocusLayout
        isReading={isReading}
        hasText={hasText}
        onBackToConfig={exitReaderMode}
        controlPanelSlot={<ControlPanel />}
        readerViewSlot={<ReaderView />}
      />
    </>
  );
}

export default App;
