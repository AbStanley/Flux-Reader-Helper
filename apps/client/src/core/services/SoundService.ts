export class SoundService {
    private static instance: SoundService;
    private audioCtx: AudioContext | null = null;
    private isMuted: boolean = false;

    private constructor() {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn("Web Audio API not supported in this browser.", e);
        }
    }

    public static getInstance(): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService();
        }
        return SoundService.instance;
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    public isAudioMuted(): boolean {
        return this.isMuted;
    }

    private playTone(frequency: number, type: OscillatorType, duration: number, startTime: number = 0, volume: number = 0.1) {
        if (this.isMuted || !this.audioCtx) return;

        // Resume context if suspended (browser policy)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime + startTime);

        gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime + startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start(this.audioCtx.currentTime + startTime);
        oscillator.stop(this.audioCtx.currentTime + startTime + duration);
    }

    public playClick() {
        // Short, high-pitched "tick"
        this.playTone(800, 'sine', 0.05, 0, 0.05);
    }

    public playCorrect() {
        // Ascending major triad (C5, E5, G5)
        const now = 0;
        this.playTone(523.25, 'sine', 0.1, now, 0.1);       // C5
        this.playTone(659.25, 'sine', 0.1, now + 0.1, 0.1); // E5
        this.playTone(783.99, 'sine', 0.2, now + 0.2, 0.1); // G5
    }

    public playWrong() {
        // Descending low tone / buzz
        if (this.isMuted || !this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.3);
    }

    public playBackspace() {
        // Soft, lower-pitched "thud" or "tick" for deletion
        this.playTone(400, 'sine', 0.05, 0, 0.05);
    }
}

export const soundService = SoundService.getInstance();
