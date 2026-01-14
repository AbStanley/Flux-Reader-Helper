import React, { useState, useEffect } from 'react';
import { Button } from "@/presentation/components/ui/button";
import { Switch } from "@/presentation/components/ui/switch";
import { Label } from "@/presentation/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/presentation/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select";
import { Settings2, ArrowRightLeft, Play } from 'lucide-react';
import { wordsApi } from '@/infrastructure/api/words';
import type { GameContentParams } from '@/core/services/game/interfaces';

interface GameConfigDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    source: 'db' | 'anki' | 'ai' | null;
    onStartGame: (config: GameContentParams['config']) => void;
}

export const GameConfigDialog: React.FC<GameConfigDialogProps> = ({
    isOpen,
    onOpenChange,
    source,
    onStartGame
}) => {
    const [timerEnabled, setTimerEnabled] = useState(true);
    const [allLanguages, setAllLanguages] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | 'all'>('all');
    const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<string | 'all'>('all');
    const [isLoadingLangs, setIsLoadingLangs] = useState(false);

    // Fetch languages when dialog opens for DB source
    useEffect(() => {
        const fetchLanguages = async () => {
            if (isOpen && source === 'db' && allLanguages.length === 0) {
                setIsLoadingLangs(true);
                try {
                    const result = await wordsApi.getAll({ take: 500 });
                    const langs = new Set<string>();

                    result.items.forEach(word => {
                        if (word.sourceLanguage) langs.add(word.sourceLanguage);
                        if (word.targetLanguage) langs.add(word.targetLanguage);
                    });

                    setAllLanguages(Array.from(langs).sort());
                } catch (e) {
                    console.error("Failed to fetch languages", e);
                } finally {
                    setIsLoadingLangs(false);
                }
            }
        };
        fetchLanguages();
    }, [isOpen, source, allLanguages.length]);

    const swapLanguages = () => {
        const temp = selectedLanguage;
        setSelectedLanguage(selectedTargetLanguage);
        setSelectedTargetLanguage(temp);
    };

    const handleConfirm = () => {
        onStartGame({
            limit: 10,
            gameMode: 'multiple-choice',
            timerEnabled: timerEnabled,
            language: {
                source: selectedLanguage !== 'all' ? selectedLanguage : undefined,
                target: selectedTargetLanguage !== 'all' ? selectedTargetLanguage : undefined
            }
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5" />
                        Configure Game
                    </DialogTitle>
                    <DialogDescription>
                        Customize your session settings.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="timer-mode" className="flex flex-col space-y-1">
                            <span>Speed Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable 10s timer per question</span>
                        </Label>
                        <Switch id="timer-mode" checked={timerEnabled} onCheckedChange={setTimerEnabled} />
                    </div>

                    {/* Language Selection Grid */}
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label>Source Language (Question/Learn)</Label>
                            {isLoadingLangs ? (
                                <div className="text-sm text-muted-foreground">Loading languages...</div>
                            ) : (
                                <Select
                                    value={selectedLanguage}
                                    onValueChange={(val) => {
                                        setSelectedLanguage(val);
                                        if (val !== 'all' && val === selectedTargetLanguage) {
                                            setSelectedTargetLanguage('all');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Language</SelectItem>
                                        {allLanguages.map(lang => (
                                            <SelectItem
                                                key={lang}
                                                value={lang}
                                                disabled={lang === selectedTargetLanguage}
                                                className="uppercase"
                                            >
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex justify-center -my-3 z-10">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-full h-8 w-8 bg-background shadow-sm hover:bg-muted"
                                onClick={swapLanguages}
                                title="Swap Languages"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        <div className="grid gap-2">
                            <Label>Target Language (Answer/Native)</Label>
                            {isLoadingLangs ? (
                                <div className="text-sm text-muted-foreground">Loading languages...</div>
                            ) : (
                                <Select
                                    value={selectedTargetLanguage}
                                    onValueChange={(val) => {
                                        setSelectedTargetLanguage(val);
                                        if (val !== 'all' && val === selectedLanguage) {
                                            setSelectedLanguage('all');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Language</SelectItem>
                                        {allLanguages.map(lang => (
                                            <SelectItem
                                                key={lang}
                                                value={lang}
                                                disabled={lang === selectedLanguage}
                                                className="uppercase"
                                            >
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleConfirm} className="w-full sm:w-auto">
                        <Play className="w-4 h-4 mr-2" /> Start Game
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
