import { useEffect, useCallback } from 'react';

export const useGameAudio = () => {
    const playAudio = useCallback((text: string, lang?: string, url?: string): Promise<void> => {
        return new Promise((resolve) => {
            if (url) {
                const audio = new Audio(url);
                audio.onended = () => resolve();
                audio.onerror = () => resolve(); // Fail gracefully
                audio.play().catch(console.error);
            } else if ('speechSynthesis' in window) {
                // Cancel previous to avoid queue buildup
                window.speechSynthesis.cancel();

                const u = new SpeechSynthesisUtterance(text);
                if (lang) u.lang = lang;

                // Fallback timeout in case onend doesn't fire (some browsers buggy)
                const timeoutId = setTimeout(() => {
                    resolve();
                }, 3000);

                u.onend = () => {
                    clearTimeout(timeoutId);
                    resolve();
                };
                u.onerror = () => {
                    clearTimeout(timeoutId);
                    resolve();
                };

                window.speechSynthesis.speak(u);
            } else {
                resolve();
            }
        });
    }, []);

    const stopAudio = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    return { playAudio, stopAudio };
};
