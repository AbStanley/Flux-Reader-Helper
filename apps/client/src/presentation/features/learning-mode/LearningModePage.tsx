import React from 'react';
import { Layers } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { GameShell } from './GameShell';
import { MultipleChoiceGame } from './games/MultipleChoiceGame';
import { BuildWordGame } from './games/build-word/BuildWordGame';
import { GameSetup } from './components/GameSetup';

export const LearningModePage: React.FC = () => {
    const { status, config } = useGameStore();

    if (status === 'playing' || status === 'finished') {
        return (
            <GameShell>
                {config.mode === 'build-word' ? <BuildWordGame /> : <MultipleChoiceGame />}
            </GameShell>
        );
    }

    if (status === 'loading') {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin text-primary">
                    <Layers size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8 animate-in fade-in">
            <GameSetup />
        </div>
    );
};
