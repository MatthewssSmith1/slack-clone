import { Bold, Italic, Code, Link as LinkIcon, Strikethrough, List, ListOrdered, Quote, CodeSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function RichTextButtons() {
    return (
        <div className="flex items-center gap-1 p-2 [&>button]:h-8 [&>button]:w-8 [&>button]:p-0 [&_svg]:h-4 [&_svg]:w-4">
            <Button type="button" variant="ghost" size="sm" aria-label="Bold">           <Bold />          </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Italic">         <Italic />        </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Strikethrough">  <Strikethrough /> </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button type="button" variant="ghost" size="sm" aria-label="Link">           <LinkIcon />      </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Ordered List">   <ListOrdered />   </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Unordered List"> <List />          </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button type="button" variant="ghost" size="sm" aria-label="Block Quote">    <Quote />         </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Code">           <Code />          </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Code Square">    <CodeSquare />    </Button>
        </div>
    );
} 