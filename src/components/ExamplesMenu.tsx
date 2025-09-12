import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookOpen, ChevronDown } from 'lucide-react';
import { EXAMPLE_SCRIPTS } from '@/lib/plaintalk/engine';

interface ExamplesMenuProps {
  onSelectExample: (name: string, code: string) => void;
  currentExample?: string;
}

export const ExamplesMenu = ({ onSelectExample, currentExample }: ExamplesMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="w-4 h-4" />
          {currentExample || 'Examples'}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {Object.entries(EXAMPLE_SCRIPTS).map(([name, code]) => (
          <DropdownMenuItem
            key={name}
            onClick={() => onSelectExample(name, code as string)}
            className="cursor-pointer"
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};