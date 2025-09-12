import { useState, useEffect, FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PromptDialogProps {
  open: boolean;
  onClose: (value: string | null) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
}

export const PromptDialog = ({ 
  open, 
  onClose, 
  title, 
  description, 
  placeholder = '', 
  defaultValue = '' 
}: PromptDialogProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onClose(value);
  };

  const handleCancel = () => {
    onClose(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose(null);
    }
  };

  // Clear input whenever dialog opens
  useEffect(() => {
    if (open) {
      setValue('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="prompt-input" className="sr-only">
              Input
            </Label>
            <Input
              id="prompt-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              OK
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};