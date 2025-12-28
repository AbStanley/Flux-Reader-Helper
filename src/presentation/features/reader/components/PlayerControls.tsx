import React, { useEffect } from 'react';
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Slider } from "../../../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { useAudioStore } from '../store/useAudioStore';
import { useReaderStore } from '../store/useReaderStore';

export const PlayerControls: React.FC = () => {
    const {
        isPlaying,
        isPaused,
        playbackRate,
        selectedVoice,
        availableVoices,
        play,
        pause,
        resume,
        stop,
        setRate,
        setVoice,
        init,
        setTokens // We need to sync tokens to audio store
    } = useAudioStore();

    const { text, tokens } = useReaderStore();

    useEffect(() => {
        init();
    }, [init]);

    // Sync tokens when they change
    useEffect(() => {
        setTokens(tokens);
    }, [tokens, setTokens]);

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            play(text);
        }
    };

    const handleStop = () => {
        stop();
    };

    if (!text.trim()) return null;

    return (
        <Card className="sticky top-0 w-full p-4 mb-6 glass border-b border-border/40 backdrop-blur-xl shadow-md z-50 flex flex-col md:flex-row gap-4 items-center justify-between rounded-xl">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={handlePlayPause}
                >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStop}
                    disabled={!isPlaying && !isPaused}
                >
                    <Square className="h-4 w-4 fill-current" />
                </Button>
            </div>

            <div className="flex items-center gap-4 flex-1 w-full md:w-auto overflow-hidden">
                <div className="flex items-center gap-2 min-w-[200px] flex-1">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Select
                        value={selectedVoice?.name || ""}
                        onValueChange={(val: string) => {
                            const voice = availableVoices.find(v => v.name === val);
                            if (voice) setVoice(voice);
                        }}
                    >
                        <SelectTrigger className="h-8 text-xs bg-secondary/50 border-0">
                            <SelectValue placeholder="Select Voice" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableVoices.map(voice => (
                                <SelectItem key={voice.name} value={voice.name} className="text-xs">
                                    {voice.name} ({voice.lang})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-[120px]">
                    <span className="text-xs text-muted-foreground w-8">{playbackRate}x</span>
                    <Slider
                        value={[playbackRate]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={(vals: number[]) => setRate(vals[0])}
                        className="flex-1"
                    />
                </div>
            </div>
        </Card>
    );
};
