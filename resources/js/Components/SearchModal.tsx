import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// DEPRECATED
// export default 
function SearchModal({ open, onOpenChange }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setQuery('');
            setResults([]);
            setIsLoading(true);
            const response = await axios.get(route('search'), {
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
            <DialogContent className="w-[80vw] max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Workspace RAG</DialogTitle>
                    <DialogDescription>Ask questions about messages and files in this workspace.</DialogDescription>
                </DialogHeader>
                <SearchResults results={results} isLoading={isLoading} />
                <Textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about the workspace messages..."
                    className="min-h-[100px] resize-none focus-visible:ring-2"
                />
                <div className="flex justify-center gap-8 mt-2">
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

const SearchResults = ({ results, isLoading }: { results: string[], isLoading: boolean }) => {
    if (results.length > 0) {
        return (
            <ScrollArea className="flex-1 border rounded-md min-h-[40vh] max-h-[60vh] p-4">
                {results.map((result, index) => (
                    <ResponseMessage text={result} key={index} isAnswer={index === 0} />
                ))}
            </ScrollArea>
        );
    }

    return (
        <div className="flex items-center justify-center h-[40vh]">
            {isLoading ? <Loader2 className="size-12 animate-spin text-muted-foreground" />
                : <p className="text-muted-foreground">Results will appear here</p>}
        </div>
    );
};

const ResponseMessage = ({ text, isAnswer }: { text: string, isAnswer: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (<>
        {!isAnswer && <Divider />}
        <div className={cn(
            "group relative px-3 py-2 rounded",
            isAnswer ? "bg-primary text-primary-foreground cursor-text" : "hover:bg-muted cursor-pointer"
        )}>
            <p onClick={() => setIsExpanded(!isExpanded)} className={isExpanded || isAnswer ? "line-clamp-none" : "line-clamp-2"}>
                {text}
            </p>
            {!isAnswer && <ChevronDown className={cn(
                "absolute left-1/2 bottom-0 -translate-x-1/2 size-3 text-primary pointer-events-none opacity-0 group-hover:opacity-100 transition-all",
                isExpanded && "rotate-180"
            )} />}
        </div>
    </>);
};

const Divider = () => (<div className="w-full h-px my-2 bg-border" />);