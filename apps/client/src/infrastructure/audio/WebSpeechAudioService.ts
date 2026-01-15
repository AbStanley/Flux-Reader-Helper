import type { IAudioService } from "../../core/interfaces/IAudioService";

// Extend window interface for speech utterance reference
declare global {
    interface Window {
        _speechUtterance?: SpeechSynthesisUtterance | null;
    }
}

export class WebSpeechAudioService implements IAudioService {
    private synthesis: SpeechSynthesis;
    private utterance: SpeechSynthesisUtterance | null = null;

    constructor(synthesis: SpeechSynthesis = window.speechSynthesis) {
        this.synthesis = synthesis;
    }

    getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    play(
        text: string,
        voice: SpeechSynthesisVoice | null,
        rate: number,
        onBoundary: (charIndex: number) => void,
        onEnd: () => void
    ): void {
        if (!this.synthesis) {
            console.error("SpeechSynthesis not supported");
            onEnd();
            return;
        }

        this.stop();

        // Mobile Safari/Chrome quirk: sometimes need to resume before playing if it was paused/interrupted
        this.synthesis.resume();

        const safeText = text.replace(/\*/g, ' ');
        this.utterance = new SpeechSynthesisUtterance(safeText);
        // HACK: Assign to window to prevent garbage collection in Chrome/Safari
        window._speechUtterance = this.utterance;

        if (voice) {
            this.utterance.voice = voice;
        }
        this.utterance.rate = rate;

        this.utterance.onboundary = (event) => {
            if (event.name === 'word') {
                onBoundary(event.charIndex);
            }
        };

        this.utterance.onend = () => {
            // Mobile fix: ensure we clear the reference to allow GC and reset state
            this.utterance = null;
            onEnd();
        };

        this.utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') {
                return;
            }
            // Attempt to recover or notify
            onEnd();
        };

        try {
            this.synthesis.speak(this.utterance);
        } catch (e) {
            console.error("Error calling speak:", e);
            onEnd();
        }
    }

    pause(): void {
        this.synthesis?.pause();
    }

    resume(): void {
        this.synthesis?.resume();
    }

    stop(): void {
        if (!this.synthesis) return;

        // Prevent existing utterance from firing callbacks during manual cancel
        if (this.utterance) {
            this.utterance.onend = null;
            this.utterance.onerror = null;
        }

        this.synthesis.cancel();
        this.utterance = null;
        if (window._speechUtterance) {
            window._speechUtterance = null;
        }
    }
}
