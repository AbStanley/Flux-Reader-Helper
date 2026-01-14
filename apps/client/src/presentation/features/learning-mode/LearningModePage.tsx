import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import { Database, Layers, Sparkles } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { GameShell } from './GameShell';
import { MultipleChoiceGame } from './games/MultipleChoiceGame';
import { GameConfigDialog } from './components/GameConfigDialog';
import type { GameContentParams } from '@/core/services/game/interfaces';

export const LearningModePage: React.FC = () => {
    const { status, startGame } = useGameStore();

    // Config State
    const [selectedSource, setSelectedSource] = useState<'db' | 'anki' | 'ai' | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Handler to open config
    const openConfig = (source: 'db' | 'anki' | 'ai') => {
        setSelectedSource(source);
        if (source === 'db') {
            setIsConfigOpen(true);
        } else {
            // Direct start or specific handling for others later
            // For now, these are coming soon, so do nothing or show alert
        }
    };

    const handleStartGame = (config: GameContentParams['config']) => {
        if (!selectedSource) return;

        startGame({
            source: selectedSource,
            config: config
        });
        setIsConfigOpen(false);
    };

    if (status === 'playing' || status === 'finished') {
        return (
            <GameShell>
                <MultipleChoiceGame />
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
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Learning Arena</h1>
                <p className="text-muted-foreground text-lg">Choose your opponent (Data Source) and verify your knowledge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Database Source */}
                <Card
                    className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group"
                    onClick={() => openConfig('db')}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <Database className="w-10 h-10 mb-2 text-blue-500" />
                        <CardTitle>Saved Vocabulary</CardTitle>
                        <CardDescription>Practice words you've saved while reading.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="secondary">Ready</Badge>
                    </CardContent>
                </Card>

                {/* Anki Source */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group opacity-80" onClick={() => openConfig('anki')}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <Layers className="w-10 h-10 mb-2 text-orange-500" />
                        <CardTitle>Anki Decks</CardTitle>
                        <CardDescription>Connect to local Anki (via AnkiConnect).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline">Coming Soon</Badge>
                    </CardContent>
                </Card>

                {/* AI Source */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group opacity-80" onClick={() => openConfig('ai')}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <Sparkles className="w-10 h-10 mb-2 text-purple-500" />
                        <CardTitle>AI Generated</CardTitle>
                        <CardDescription>Infinite stories and quizzes by Gemini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant="outline">Coming Soon</Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Configuration Dialog */}
            <GameConfigDialog
                isOpen={isConfigOpen}
                onOpenChange={setIsConfigOpen}
                source={selectedSource}
                onStartGame={handleStartGame}
            />
        </div>
    );
};
