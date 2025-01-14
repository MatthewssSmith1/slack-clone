import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import axios from 'axios';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setQuery('');
            const response = await axios.get('/search', {
                params: { query }
            });
            setResults(response.data.results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Search Workspace</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 border rounded-md h-[40vh] p-4">
                  {results.length > 0 ? results.map((result, index) => (
                    <div key={index} className="px-3 py-2 select-none border-border border-t first:border-t-0 last:border-t-0 last:bg-muted rounded">
                      {result}
                    </div>
                  )) : (
                    <div className="p-2 text-center text-muted-foreground select-none">
                      Results will appear here
                    </div>
                  )}
                </ScrollArea>
                <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about the workspace messages..."
                    className="min-h-[100px] resize-none focus-visible:ring-2"
                />
                <div className="flex justify-center gap-12 mt-4">
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={isLoading || (!query.trim() && results.length === 0)}
                    >
                        Clear
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!query.trim() || isLoading}
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}