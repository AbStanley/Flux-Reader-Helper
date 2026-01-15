import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Flag } from 'lucide-react';
import type { LetterParams } from '../types';

interface LetterPoolProps {
    letterPool: LetterParams[];
    isComplete: boolean;
    isRevealed: boolean;
    onInput: (char: string, id: string) => void;
    onGiveUp: () => void;
    onNext: () => void;
}

export const LetterPool: React.FC<LetterPoolProps> = ({
    letterPool,
    isComplete,
    isRevealed,
    onInput,
    onGiveUp,
    onNext
}) => {
    return (
        <div className="w-full mt-auto p-4 bg-card/30 rounded-2xl border border-white/5 min-h-[120px] flex flex-col justify-center">
            {isRevealed ? (
                <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-4">
                    <div className="text-xl font-bold text-blue-400">Time's Up! / Answer Revealed</div>
                    <Button size="lg" className="w-full md:w-auto px-8" onClick={onNext}>
                        Next Word <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <>
                    {/* Letter Pool */}
                    <div className="grid grid-cols-6 md:grid-cols-8 gap-2 w-full mb-4">
                        {letterPool.map((item) => (
                            <Button
                                key={item.id}
                                variant={item.isUsed ? "ghost" : "outline"}
                                className={cn(
                                    "h-12 text-xl font-bold transition-all",
                                    item.isUsed ? "opacity-20 scale-90" : "hover:scale-110 hover:-translate-y-1 bg-background"
                                )}
                                disabled={item.isUsed || isComplete}
                                onClick={() => onInput(item.char, item.id)}
                            >
                                {item.char}
                            </Button>
                        ))}
                    </div>

                    {/* Give Up Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={onGiveUp}
                        >
                            <Flag className="w-4 h-4 mr-2" /> Give Up
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
