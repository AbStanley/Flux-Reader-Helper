import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';

@Injectable()
export class OllamaService {
    private ollama: Ollama;
    private readonly logger = new Logger(OllamaService.name);

    constructor() {
        const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
        this.ollama = new Ollama({ host });
        this.logger.log(`Ollama Service initialized with host: ${host}`);
    }

    async chat(model: string, messages: any[], stream: boolean = false) {
        try {
            this.logger.log(`Sending chat request to model: ${model}`);
            if (stream) {
                return await this.ollama.chat({
                    model,
                    messages,
                    stream: true,
                });
            } else {
                return await this.ollama.chat({
                    model,
                    messages,
                    stream: false,
                });
            }
        } catch (error) {
            this.logger.error('Error in chat request', error);
        }
    }

    async generate(model: string, prompt: string, stream: boolean = false) {
        try {
            this.logger.log(`Sending generate request to model: ${model}`);
            if (stream) {
                return await this.ollama.generate({
                    model,
                    prompt,
                    stream: true,
                });
            } else {
                return await this.ollama.generate({
                    model,
                    prompt,
                    stream: false,
                });
            }
        } catch (error) {
            this.logger.error('Error in generate request', error);
            throw error;
        }
    }

    async listTags() {
        try {
            this.logger.log('Sending list tags request');
            return await this.ollama.list();
        } catch (error) {
            this.logger.error('Error in list tags request', error);
            throw error;
        }
    }
}
