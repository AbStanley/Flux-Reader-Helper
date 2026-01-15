import { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { ollamaService } from '@/infrastructure/ai/OllamaService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/ui/select";
import { RefreshCw } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';

export const AiSetup = () => {
    const { config, updateConfig } = useGameStore();
    const [models, setModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchModels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const available = await ollamaService.getAvailableModels();
            // deduplicate
            const unique = Array.from(new Set(available));
            setModels(unique);

            // Auto-select first if none selected
            if (unique.length > 0 && !config.aiModel) {
                updateConfig({ aiModel: unique[0] });
            } else if (unique.length > 0 && config.aiModel && !unique.includes(config.aiModel)) {
                // If current model not found, maybe select first? 
                // Let's keep it but maybe show warning? For now just select first valid.
                updateConfig({ aiModel: unique[0] });
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch models. Is Ollama running?");
        } finally {
            setLoading(false);
        }
    }, [config.aiModel, updateConfig]);

    useEffect(() => {
        fetchModels();
    }, [fetchModels]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                    AI Configuration
                </h3>

                <div className="space-y-4">
                    {/* Model Selection */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={fetchModels}
                                className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                                disabled={loading}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>

                        {error ? (
                            <div className="text-xs text-red-500">{error}</div>
                        ) : (
                            <Select
                                value={config.aiModel}
                                onValueChange={(val) => updateConfig({ aiModel: val })}
                                disabled={loading || models.length === 0}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-700">
                                    <SelectValue placeholder={loading ? "Loading models..." : "Select AI Model"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map(model => (
                                        <SelectItem key={model} value={model}>{model}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <p className="text-xs text-slate-500">
                            Required: A model capable of JSON output (e.g. llama3, mistral).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                            Topic
                        </label>
                        <input
                            type="text"
                            value={config.aiTopic || ''}
                            onChange={(e) => updateConfig({ aiTopic: e.target.value })}
                            placeholder="e.g., Business, Travel, Airport..."
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            The AI will generate vocabulary based on this topic.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Level</label>
                        <Select
                            value={config.aiLevel || 'intermediate'}
                            onValueChange={(val: 'beginner' | 'intermediate' | 'advanced') => updateConfig({ aiLevel: val })}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-700">
                                <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
};
