import React from 'react';
import { type Word } from '../../../../infrastructure/api/words';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface WordListProps {
    words: Word[];
    onEdit: (word: Word) => void;
    onDelete: (id: string) => void;
}

export const WordList: React.FC<WordListProps> = ({ words, onEdit, onDelete }) => {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead>Definition</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {words.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No words found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        words.map((word) => (
                            <TableRow key={word.id}>
                                <TableCell className="font-medium">{word.text}</TableCell>
                                <TableCell>{word.definition || '-'}</TableCell>
                                <TableCell>
                                    {word.targetLanguage && word.sourceLanguage
                                        ? `${word.sourceLanguage} → ${word.targetLanguage}`
                                        : '-'}
                                </TableCell>
                                <TableCell>{word.sourceTitle || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(word)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => onDelete(word.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
