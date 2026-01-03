import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import ePub from 'epubjs';
import { Button } from '@/presentation/components/ui/button';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import { Checkbox } from '@/presentation/components/ui/checkbox';

import { Loader2, FileText } from 'lucide-react';

interface EpubPreviewProps {
    file: File;
    onExtract: (text: string) => void;
    onCancel: () => void;
}

interface Chapter {
    id: string;
    label: string;
    href: string;
    subitems?: Chapter[];
}

export const EpubPreview: React.FC<EpubPreviewProps> = ({ file, onExtract, onCancel }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [cleanToc, setCleanToc] = useState<Chapter[]>([]); // Flattened list for easier selection logic if needed, or nested
    const [selectedHrefs, setSelectedHrefs] = useState<Set<string>>(new Set());
    const [isExtracting, setIsExtracting] = useState(false);
    const [loading, setLoading] = useState(true);
    const bookRef = useRef<any>(null);

    useEffect(() => {
        const loadEpub = async () => {
            try {
                const buffer = await file.arrayBuffer();
                const book = ePub(buffer);
                bookRef.current = book;
                await book.ready;
                const navigation = await book.loaded.navigation;

                // Helper to flatten or process TOC
                const processToc = (items: any[]): Chapter[] => {
                    return items.map(item => ({
                        id: item.id,
                        label: item.label.trim(),
                        href: item.href,
                        subitems: item.subitems ? processToc(item.subitems) : undefined
                    }));
                };

                const toc = processToc(navigation.toc);
                setChapters(toc);

                // Flatten for "Select All" logic
                const flatten = (items: Chapter[]): Chapter[] => {
                    return items.reduce((acc: Chapter[], item) => {
                        acc.push(item);
                        if (item.subitems) acc.push(...flatten(item.subitems));
                        return acc;
                    }, []);
                };
                setCleanToc(flatten(toc));

                setLoading(false);
            } catch (error) {
                console.error("Error loading EPUB:", error);
                setLoading(false);
            }
        };

        loadEpub();

        return () => {
            if (bookRef.current) {
                bookRef.current.destroy();
            }
        };
    }, [file]);

    const toggleChapter = (href: string) => {
        const newSelected = new Set(selectedHrefs);
        if (newSelected.has(href)) {
            newSelected.delete(href);
        } else {
            newSelected.add(href);
        }
        setSelectedHrefs(newSelected);
    };

    const selectAll = () => {
        if (selectedHrefs.size === cleanToc.length) {
            setSelectedHrefs(new Set());
        } else {
            const all = new Set(cleanToc.map(c => c.href));
            setSelectedHrefs(all);
        }
    };

    const handleExtract = async () => {
        if (selectedHrefs.size === 0 || !bookRef.current) return;
        setIsExtracting(true);

        try {
            let fullText = '';

            // We need to fetch text for each selected chapter
            // We process them in the order they appear in the flattened TOC roughly, 
            // or we can rely on order of selection. Better to use TOC order.
            const orderedHrefs = cleanToc
                .map(c => c.href)
                .filter(href => selectedHrefs.has(href));

            for (const href of orderedHrefs) {
                // Load the chapter
                // epubjs doesn't expose a simple "getText" for a chapter URL easily without rendering or digging deep.
                // However, we can use the `load` method on the spin to get the document, then parse text.

                // Alternative: spin through the spine items.
                // Let's try locating the spine item by href.
                // Clean href (remove hash) to find the correct spine item (file)
                const hrefWithoutHash = href.split('#')[0];
                const spineItem = bookRef.current.spine.get(hrefWithoutHash);

                if (spineItem) {
                    try {
                        // load the content
                        const doc = await spineItem.load(bookRef.current.load.bind(bookRef.current));

                        let text = '';

                        if (typeof doc === 'string') {
                            // If doc is returned as a string (raw HTML/XHTML)
                            const parser = new DOMParser();
                            // Try text/xml for xhtml, fallback to text/html
                            try {
                                const parsedDoc = parser.parseFromString(doc, "application/xhtml+xml");
                                text = parsedDoc.documentElement.textContent || "";
                            } catch (e) {
                                const parsedDoc = parser.parseFromString(doc, "text/html");
                                text = parsedDoc.body.textContent || "";
                            }
                        } else if (typeof doc === 'object') {
                            // It's likely a Document or XMLDocument
                            // Try multiple strategies to get text

                            // Strategy 1: doc.body.innerText (most readable for HTML)
                            if ('body' in doc && doc.body && 'innerText' in doc.body) {
                                text = (doc.body as HTMLElement).innerText;
                            }

                            // Strategy 2: querySelector('body') -> innerText/textContent (handles XML/XHTML where .body might be missing on doc interface)
                            if (!text && 'querySelector' in doc) {
                                const bodyEl = (doc as Document).querySelector('body');
                                if (bodyEl) {
                                    text = bodyEl['innerText'] || bodyEl.textContent || "";
                                }
                            }

                            // Strategy 3: doc.documentElement.textContent (Fallback for generic XML)
                            if (!text && doc.documentElement) {
                                text = doc.documentElement.textContent || "";
                            }

                            // Strategy 4: Direct textContent on doc
                            if (!text && 'textContent' in doc) {
                                text = doc.textContent || "";
                            }
                        }

                        // Try to find the title from our TOC to ensure we label it nicely
                        const title = cleanToc.find(c => c.href === href)?.label || 'Chapter';

                        if (text && text.trim().length > 0) {
                            fullText += `### ${title}\n\n${text.trim()}\n\n`;
                        } else {
                            // Detailed Debugging
                            console.warn(`Extracted text for ${href} was empty.`);
                            console.warn(`Doc Type: ${typeof doc}, Constructor: ${doc?.constructor?.name}`);
                            if (typeof doc === 'object' && doc) {
                                try {
                                    // Log a snippet of HTML to see if it's actually empty or just structure
                                    const snippet = (doc as any).documentElement ? (doc as any).documentElement.innerHTML.substring(0, 200) : "No documentElement";
                                    console.warn(`Document snippet: ${snippet}`);
                                } catch (e) {
                                    console.warn("Could not log snippet", e);
                                }
                            }
                        }
                    } finally {
                        // Unload to save memory
                        spineItem.unload();
                    }
                } else {
                    console.warn(`Could not find spine item for href: ${href}`);
                }
            }

            onExtract(fullText);
        } catch (error) {
            console.error('Failed to extract text from EPUB', error);
        } finally {
            setIsExtracting(false);
        }
    };

    const renderChapterList = (items: Chapter[], depth = 0) => {
        return items.map((chapter, index) => (
            <div key={`${chapter.id}-${index}-${chapter.href}`} className="flex flex-col">
                <div
                    className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                    style={{ marginLeft: `${depth * 20}px` }}
                    onClick={() => toggleChapter(chapter.href)}
                >
                    <Checkbox
                        checked={selectedHrefs.has(chapter.href)}
                        onCheckedChange={() => toggleChapter(chapter.href)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{chapter.label}</span>
                </div>
                {chapter.subitems && renderChapterList(chapter.subitems, depth + 1)}
            </div>
        ));
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{file.name}</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={selectAll} disabled={loading}>
                        {selectedHrefs.size === cleanToc.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button onClick={handleExtract} disabled={selectedHrefs.size === 0 || isExtracting}>
                        {isExtracting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Import Selected ({selectedHrefs.size})
                    </Button>
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                </div>
            </div>

            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/20">
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
                ) : (
                    <div className="space-y-1">
                        {renderChapterList(chapters)}
                        {chapters.length === 0 && <div className="text-center text-muted-foreground p-4">No chapters found for this EPUB.</div>}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
