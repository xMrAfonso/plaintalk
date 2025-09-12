import { Button } from '@/components/ui/button';
import { ExamplesMenu } from './ExamplesMenu';
import { Download, Upload, Save, Folder, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
interface HeaderProps {
  onSelectExample: (name: string, code: string) => void;
  currentExample?: string;
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  currentFileName?: string;
}

export const Header = ({ 
  onSelectExample, 
  currentExample,
  onSave,
  onLoad, 
  onExport, 
  onImport,
  currentFileName 
}: HeaderProps) => {
  return (
    <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" aria-label="Back to Home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">PT</span>
          </div>
          <h1 className="text-lg font-semibold">PlainTalk</h1>
        </div>
        
        {currentFileName && (
          <div className="text-sm text-muted-foreground">
            {currentFileName}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ExamplesMenu onSelectExample={onSelectExample} currentExample={currentExample} />
        
        <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
          <Button variant="ghost" size="sm" onClick={onLoad} className="gap-2">
            <Folder className="w-4 h-4" />
            Load
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onImport} className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
};