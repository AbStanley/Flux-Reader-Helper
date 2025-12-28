import type { IAudioService } from "../../core/interfaces/IAudioService";

export class WebSpeechAudioService implements IAudioService {
    private synthesis: SpeechSynthesis;
    private utterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        this.synthesis = window.speechSynthesis;
    }

    getVoices(): SpeechSynthesisVoice[] {
        return this.synthesis.getVoices();
    }

    play(
        text: string,
        voice: SpeechSynthesisVoice | null,
        rate: number,
        onBoundary: (charIndex: number) => void,
        onEnd: () => void
    ): void {
        this.stop();

        this.utterance = new SpeechSynthesisUtterance(text);
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
            onEnd();
        };

        this.synthesis.speak(this.utterance);
    }

    pause(): void {
        this.synthesis.pause();
    }

    resume(): void {
        this.synthesis.resume();
    }

    stop(): void {
        this.synthesis.cancel();
        this.utterance = null;
    }
}
