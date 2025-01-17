import { HeaderWrapper, HeaderTitle } from './Header';
import { useThreadStore } from '@/stores/messageStores';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function ThreadHeader() {
  const { messages } = useThreadStore();

  const isThreadClosed = messages === null;

  const close = () => {
    useThreadStore.setState({ messages: null });
  };

  return (
    <HeaderWrapper className={cn(
      "col-start-2 lg:col-start-3 transition-all duration-100",
      isThreadClosed && "opacity-0 pointer-events-none"
    )}>
      <HeaderTitle>Thread</HeaderTitle>
      <Button type="button" variant="ghost" size="icon" onClick={close} title="Close thread">
        <X className="size-5 translate-x-1" />
      </Button>
    </HeaderWrapper>
  );
} 