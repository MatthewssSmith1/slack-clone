import { X } from 'lucide-react';
import { HeaderWrapper, HeaderTitle } from './Header';
import { useThreadStore } from '@/stores/messageStores';
import { Button } from '@/components/ui/button';

export default function ThreadHeader() {
  const handleClose = () => {
    useThreadStore.setState({ messages: null });
  };

  return (
    <HeaderWrapper className="col-start-3">
      <HeaderTitle>Thread</HeaderTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        title="Close thread"
      >
        <X className="size-5 translate-x-1" />
      </Button>
    </HeaderWrapper>
  );
} 