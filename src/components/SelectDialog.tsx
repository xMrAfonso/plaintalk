import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectDialogProps {
  open: boolean;
  onClose: (value: string | null) => void;
  title: string;
  description?: string;
  options: string[];
}

export const SelectDialog = ({ 
  open, 
  onClose, 
  title, 
  description, 
  options 
}: SelectDialogProps) => {
  const handleSelect = (option: string) => {
    onClose(option);
  };

  const handleCancel = () => {
    onClose(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-60 py-4">
          <div className="space-y-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(option)}
              >
                {index + 1}. {option}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};