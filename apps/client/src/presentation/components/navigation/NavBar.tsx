import { BookOpen, Library } from 'lucide-react';
import { useViewStore } from '../../features/navigation/store/useViewStore';
import { Button } from '../ui/button';
import { ModeToggle } from '../ui/mode-toggle';

export function NavBar() {
    const { currentView, setView } = useViewStore();

    return (
        <nav className="flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold tracking-tight text-primary">Flux</h1>

                <div className="flex items-center gap-2">
                    <Button
                        variant={currentView === 'READING' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('READING')}
                        className="gap-2"
                    >
                        <BookOpen className="w-4 h-4" />
                        Reading
                    </Button>
                    <Button
                        variant={currentView === 'WORD_MANAGER' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('WORD_MANAGER')}
                        className="gap-2"
                    >
                        <Library className="w-4 h-4" />
                        Words
                    </Button>
                </div>
            </div>

            <ModeToggle />
        </nav>
    );
}
