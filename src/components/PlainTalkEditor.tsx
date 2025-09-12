import { useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';

interface PlainTalkEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'dark' | 'light';
}

export const PlainTalkEditor = ({ value, onChange, theme = 'dark' }: PlainTalkEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Register PlainTalk language
    monaco.languages.register({ id: 'plaintalk' });
    
    // Define syntax highlighting rules
    monaco.languages.setMonarchTokensProvider('plaintalk', {
      tokenizer: {
        root: [
          // Keywords
          [/\b(when|to|remember|as|if|else|while|for|every|in|say|display|ask|give|back|increase|decrease|by|using|with|and|or)\b/, 'keyword'],
          
          // Natural language keywords
          [/\b(is|are|the|a|an|equal|not|greater|less|than|at|least|most|more|of|list|program|starts|divided)\b/, 'keyword.natural'],
          
          // Built-in events
          [/\b(start|click|load|keypress)\b/, 'type'],
          
          // Strings
          [/"([^"\\\\]|\\\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'([^'\\\\]|\\\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string_single'],
          
          // Numbers
          [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          
          // Identifiers and functions
          [/[a-zA-Z_]\w*(?=\s+(using|with))/, 'function'],
          [/[a-zA-Z_]\w*/, 'identifier'],
          
          // Comments
          [/#.*$/, 'comment'],
          
          // Operators
          [/[<>=!]+/, 'operator'],
          [/[+\-*/]/, 'operator'],
          
          // Delimiters
          [/[{}()\[\]]/, 'delimiter.bracket'],
          [/[,.]/, 'delimiter'],
          [/:/, 'delimiter.colon'],
        ],
        
        string_double: [
          [/[^\\\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ],
        
        string_single: [
          [/[^\\\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@pop']
        ]
      }
    });
    
    // Define theme colors
    monaco.editor.defineTheme('plaintalk-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'c586c0' },
        { token: 'keyword.natural', foreground: '8FBCBB' },
        { token: 'type', foreground: '4ec9b0' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'function', foreground: 'dcdcaa' },
        { token: 'identifier', foreground: '9cdcfe' },
        { token: 'comment', foreground: '6a9955' },
        { token: 'operator', foreground: 'd4d4d4' },
        { token: 'delimiter', foreground: 'd4d4d4' },
        { token: 'delimiter.colon', foreground: 'd4d4d4' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e',
      }
    });
    
    // Set the theme
    monaco.editor.setTheme('plaintalk-dark');
    
    // Configure autocomplete
    monaco.languages.registerCompletionItemProvider('plaintalk', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'when program starts',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'when the program starts:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define the main program entry point'
          },
          {
            label: 'to function',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'to ${1:functionName} using ${2:parameter}:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a function'
          },
          {
            label: 'remember',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'remember ${1:variable} as ${2:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Store a value in a variable'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'if ${1:condition}:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Conditional statement'
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'while ${1:condition}:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'While loop'
          },
          {
            label: 'for every',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'for every ${1:item} in ${2:list}:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For each loop'
          },
          {
            label: 'say',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'say "${1:message}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print a message with newline'
          },
          {
            label: 'display',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'display "${1:message}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print a message without newline'
          },
          {
            label: 'ask',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'ask "${1:prompt}"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get input from the user'
          },
          {
            label: 'increase',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'increase ${1:variable} by ${2:amount}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Add to a variable'
          },
          {
            label: 'decrease',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'decrease ${1:variable} by ${2:amount}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Subtract from a variable'
          },
          {
            label: 'every seconds',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'every ${1:2} seconds:\n    $0',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Timer event'
          }
        ];
        
        return { suggestions };
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="h-full bg-editor border-r border-border">
      <div className="h-8 bg-editor-panel border-b border-border flex items-center px-3">
        <span className="text-sm text-muted-foreground font-medium">PlainTalk Editor</span>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <Editor
          height="100%"
          language="plaintalk"
          theme="plaintalk-dark"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 20,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top',
          }}
        />
      </div>
    </div>
  );
};