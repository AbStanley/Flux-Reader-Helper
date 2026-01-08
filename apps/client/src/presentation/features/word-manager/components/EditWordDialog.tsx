import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { type CreateWordRequest, type Word } from '../../../../infrastructure/api/words';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Plus, X } from 'lucide-react';

interface EditWordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateWordRequest) => Promise<void>;
    initialData?: Word;
}

const DEFAULT_FORM_STATE: CreateWordRequest = {
    text: '',
    definition: '',
    context: '',
    imageUrl: '',
    pronunciation: '',
    sourceTitle: '',
    examples: []
};

export const EditWordDialog: React.FC<EditWordDialogProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [formData, setFormData] = useState<CreateWordRequest>(DEFAULT_FORM_STATE);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Map existing word to form DTO
                setFormData({
                    text: initialData.text,
                    definition: initialData.definition || '',
                    context: initialData.context || '',
                    imageUrl: initialData.imageUrl || '',
                    pronunciation: initialData.pronunciation || '',
                    sourceTitle: initialData.sourceTitle || '',
                    sourceLanguage: initialData.sourceLanguage || '',
                    targetLanguage: initialData.targetLanguage || '',
                    examples: initialData.examples?.map(ex => ({
                        sentence: ex.sentence,
                        translation: ex.translation || ''
                    })) || []
                });
            } else {
                setFormData(DEFAULT_FORM_STATE);
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof CreateWordRequest, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [showLimitWarning, setShowLimitWarning] = useState(false);

    const handleAddExample = () => {
        if ((formData.examples?.length || 0) >= 3) {
            setShowLimitWarning(true);
            return;
        }
        setFormData(prev => ({
            ...prev,
            examples: [...(prev.examples || []), { sentence: '', translation: '' }]
        }));
        setShowLimitWarning(false);
    };

    const handleExampleChange = (index: number, field: 'sentence' | 'translation', value: string) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples?.map((ex, i) =>
                i === index ? { ...ex, [field]: value } : ex
            )
        }));
    };

    const handleRemoveExample = (index: number) => {
        setFormData(prev => ({
            ...prev,
            examples: prev.examples?.filter((_, i) => i !== index)
        }));
        setShowLimitWarning(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Word' : 'Add New Word'}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <form onSubmit={handleSubmit} className="space-y-4 p-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="text">Word / Phrase</Label>
                                <Input
                                    id="text"
                                    value={formData.text}
                                    onChange={e => handleChange('text', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="definition">Definition</Label>
                                <Input
                                    id="definition"
                                    value={formData.definition}
                                    onChange={e => handleChange('definition', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pronunciation">Pronunciation</Label>
                                <Input
                                    id="pronunciation"
                                    value={formData.pronunciation}
                                    onChange={e => handleChange('pronunciation', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sourceTitle">Source Title</Label>
                                <Input
                                    id="sourceTitle"
                                    value={formData.sourceTitle}
                                    onChange={e => handleChange('sourceTitle', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={e => handleChange('imageUrl', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="context">Context</Label>
                            <Textarea
                                id="context"
                                value={formData.context}
                                onChange={e => handleChange('context', e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Examples</Label>
                                <div className="flex flex-col items-end">
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddExample}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Example
                                    </Button>
                                    {showLimitWarning && (
                                        <span className="text-xs text-destructive mt-1">
                                            Maximum 3 examples allowed
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {formData.examples?.map((ex, idx) => (
                                    <div key={idx} className="flex gap-2 items-start border p-2 rounded-md bg-muted/20 relative">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Sentence"
                                                value={ex.sentence}
                                                onChange={e => handleExampleChange(idx, 'sentence', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Translation"
                                                value={ex.translation}
                                                onChange={e => handleExampleChange(idx, 'translation', e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveExample(idx)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.examples?.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">No examples added.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Word'}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
