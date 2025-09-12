import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Play, Square, Trash2 } from 'lucide-react';

interface ConsoleMessage {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning' | 'system';
  timestamp: Date;
}

interface PlainTalkConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  onRun: () => void;
  onStop: () => void;
  isRunning: boolean;
}

export const PlainTalkConsole = ({ 
  messages, 
  onClear, 
  onRun, 
  onStop, 
  isRunning 
}: PlainTalkConsoleProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-console-error';
      case 'success':
        return 'text-console-success';
      case 'warning':
        return 'text-console-warning';
      case 'system':
        return 'text-console-system';
      case 'info':
      default:
        return 'text-console-info';
    }
  };

  const getMessagePrefix = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return '[ERROR]';
      case 'success':
        return '[SUCCESS]';
      case 'warning':
        return '[WARNING]';
      case 'system':
        return '[SYSTEM]';
      case 'info':
      default:
        return '';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="h-full bg-console flex flex-col">
      {/* Header */}
      <div className="h-8 bg-editor-panel border-b border-border flex items-center justify-between px-3">
        <span className="text-sm text-muted-foreground font-medium">Console</span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={isRunning ? onStop : onRun}
            className="h-6 px-2 text-xs"
            disabled={false}
          >
            {isRunning ? (
              <>
                <Square className="w-3 h-3 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Run
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="h-6 px-2 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Console output */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-3 font-mono text-sm space-y-1">
            {messages.length === 0 ? (
              <div className="text-muted-foreground italic">
                Console output will appear here. Click "Run" to execute your PlainTalk script.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 group">
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    {formatTime(msg.timestamp)}
                  </span>
                  <span className="mt-0.5 flex-shrink-0">
                    {getMessagePrefix(msg.type)}
                  </span>
                  <span className={`${getMessageColor(msg.type)} break-words flex-1`}>
                    {msg.message}
                  </span>
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-console-info">
                <span>[RUNNING]</span>
                <span className="italic">Executing script...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};