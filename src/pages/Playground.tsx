import { useState, useCallback, useRef, useEffect } from 'react';
import Split from 'react-split';
import { useLocation } from 'react-router-dom';
import { PlainTalkEditor } from '@/components/PlainTalkEditor';
import { PlainTalkConsole } from '@/components/PlainTalkConsole';
import { Header } from '@/components/Header';
import { PromptDialog } from '@/components/PromptDialog';
import { SelectDialog } from '@/components/SelectDialog';
import { PlainTalkEngine, EXAMPLE_SCRIPTS } from '@/lib/plaintalk/engine';
import { useToast } from '@/hooks/use-toast';

interface ConsoleMessage {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'system';
  timestamp: Date;
}

interface DialogState {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  resolve?: (value: string | null) => void;
}

interface SelectDialogState {
  open: boolean;
  title: string;
  description?: string;
  options: string[];
  resolve?: (value: string | null) => void;
}

const STORAGE_KEY = 'plaintalk-editor-content';
const SAVED_FILES_KEY = 'plaintalk-saved-files';

const PlainTalkIDE = () => {
  const location = useLocation();
  const [code, setCode] = useState(() => {
    // Check for code from location state first
    if (location.state?.code) {
      return location.state.code;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || EXAMPLE_SCRIPTS['Hello World'];
  });
  
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>();
  const [currentExample, setCurrentExample] = useState<string>(() => {
    // If we have code from location state, don't set an example
    if (location.state?.code) {
      return undefined;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? undefined : 'Hello World';
  });
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    title: '',
    description: '',
    placeholder: '',
    defaultValue: ''
  });
  const [selectDialogState, setSelectDialogState] = useState<SelectDialogState>({
    open: false,
    title: '',
    description: '',
    options: []
  });
  
  const { toast } = useToast();
  const engineRef = useRef<PlainTalkEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial code from location state
  useEffect(() => {
    if (location.state?.code && location.state.code !== code) {
      setCode(location.state.code);
      setCurrentExample(undefined); // Clear any current example
      localStorage.setItem(STORAGE_KEY, location.state.code);
    }
  }, [location.state, code]);

  const addMessage = useCallback((message: string, type: ConsoleMessage['type']) => {
    // Handle display command without newline
    if (message.endsWith('\0NO_NEWLINE')) {
      const cleanMessage = message.replace('\0NO_NEWLINE', '');
      const newMessage: ConsoleMessage = {
        id: `${Date.now()}-${Math.random()}`,
        message: cleanMessage,
        type,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
    } else {
      const newMessage: ConsoleMessage = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        type,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
    }
  }, []);

  const showPromptDialog = useCallback((title: string, description?: string, placeholder?: string, defaultValue?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title,
        description,
        placeholder,
        defaultValue,
        resolve
      });
    });
  }, []);

  const showSelectDialog = useCallback((title: string, options: string[], description?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setSelectDialogState({
        open: true,
        title,
        description,
        options,
        resolve
      });
    });
  }, []);

  const handleDialogClose = useCallback((value: string | null) => {
    if (dialogState.resolve) {
      dialogState.resolve(value);
    }
    setDialogState(prev => ({ ...prev, open: false, resolve: undefined }));
  }, [dialogState.resolve]);

  const handleSelectDialogClose = useCallback((value: string | null) => {
    if (selectDialogState.resolve) {
      selectDialogState.resolve(value);
    }
    setSelectDialogState(prev => ({ ...prev, open: false, resolve: undefined }));
  }, [selectDialogState.resolve]);

  const handleInput = useCallback(async (prompt: string): Promise<string> => {
    const result = await showPromptDialog('User Input', prompt, 'Enter your response...');
    return result || '';
  }, [showPromptDialog]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setMessages([]);
    
    try {
      engineRef.current = new PlainTalkEngine({
        output: addMessage,
        input: handleInput,
      });
      
      addMessage('Executing PlainTalk...', 'system');
      await engineRef.current.execute(code);
      // Only show completion if the program is actually stopped
      if (!engineRef.current.isRunning()) {
        addMessage('Execution completed.', 'system');
      }
    } catch (error) {
      addMessage(`Execution failed: ${error}`, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning, addMessage, handleInput]);

  const handleStop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      addMessage('Execution stopped.', 'warning');
    }
    setIsRunning(false);
  }, [addMessage]);

  const handleClear = useCallback(() => {
    setMessages([]);
  }, []);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setCurrentExample(undefined); // Clear example when manually editing
    localStorage.setItem(STORAGE_KEY, newCode);
  }, []);

  const handleSelectExample = useCallback((name: string, exampleCode: string) => {
    setCode(exampleCode);
    setCurrentExample(name);
    setCurrentFileName(undefined); // Clear filename when loading example
    localStorage.setItem(STORAGE_KEY, exampleCode);
    toast({
      title: 'Example loaded',
      description: `Loaded "${name}" example`,
    });
  }, [toast]);

  const handleSave = useCallback(async () => {
    const fileName = await showPromptDialog(
      'Save Script', 
      'Enter a name for your script:', 
      'my-script',
      currentFileName || 'my-script'
    );
    if (!fileName) return;

    try {
      const savedFiles = JSON.parse(localStorage.getItem(SAVED_FILES_KEY) || '{}');
      savedFiles[fileName] = {
        code,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(SAVED_FILES_KEY, JSON.stringify(savedFiles));
      setCurrentFileName(fileName);
      
      toast({
        title: 'Script saved',
        description: `Saved as "${fileName}"`,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Could not save the script',
        variant: 'destructive',
      });
    }
  }, [code, currentFileName, toast, showPromptDialog]);

  const handleLoad = useCallback(async () => {
    try {
      const savedFiles = JSON.parse(localStorage.getItem(SAVED_FILES_KEY) || '{}');
      const fileNames = Object.keys(savedFiles);
      
      if (fileNames.length === 0) {
        toast({
          title: 'No saved files',
          description: 'No saved scripts found',
        });
        return;
      }

      const fileName = await showSelectDialog(
        'Load Script',
        fileNames,
        'Select a file to load:'
      );
      
      if (!fileName || !savedFiles[fileName]) {
        return;
      }

      setCode(savedFiles[fileName].code);
      setCurrentFileName(fileName);
      setCurrentExample(undefined); // Clear example when loading file
      localStorage.setItem(STORAGE_KEY, savedFiles[fileName].code);
      
      toast({
        title: 'Script loaded',
        description: `Loaded "${fileName}"`,
      });
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Could not load the script',
        variant: 'destructive',
      });
    }
  }, [toast, showSelectDialog]);

  const handleExport = useCallback(() => {
    const fileName = currentFileName || 'script.pt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pt') ? fileName : `${fileName}.pt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Script exported',
      description: `Downloaded as "${a.download}"`,
    });
  }, [code, currentFileName, toast]);

  const handleImport = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      setCurrentFileName(file.name.replace('.pt', ''));
      setCurrentExample(undefined); // Clear example when importing file
      localStorage.setItem(STORAGE_KEY, content);
      
      toast({
        title: 'Script imported',
        description: `Imported "${file.name}"`,
      });
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [toast]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header
        onSelectExample={handleSelectExample}
        currentExample={currentExample}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onImport={handleImport}
        currentFileName={currentFileName}
      />
      
      <div className="flex-1 overflow-hidden">
        <Split
          sizes={[60, 40]}
          minSize={300}
          expandToMin={false}
          gutterSize={4}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="h-full flex"
          style={{ height: '100%' }}
        >
          <PlainTalkEditor
            value={code}
            onChange={handleCodeChange}
          />
          
          <PlainTalkConsole
            messages={messages}
            onClear={handleClear}
            onRun={handleRun}
            onStop={handleStop}
            isRunning={isRunning}
          />
        </Split>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pt,.txt"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Custom dialogs */}
      <PromptDialog
        open={dialogState.open}
        onClose={handleDialogClose}
        title={dialogState.title}
        description={dialogState.description}
        placeholder={dialogState.placeholder}
        defaultValue={dialogState.defaultValue}
      />

      <SelectDialog
        open={selectDialogState.open}
        onClose={handleSelectDialogClose}
        title={selectDialogState.title}
        description={selectDialogState.description}
        options={selectDialogState.options}
      />
    </div>
  );
};

const Playground = () => {
  return <PlainTalkIDE />;
};

export default Playground;