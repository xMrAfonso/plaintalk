// Token types for the PlainTalk lexer
export enum TokenType {
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  
  // Keywords
  WHEN = 'WHEN',
  PROGRAM = 'PROGRAM',
  STARTS = 'STARTS',
  TO = 'TO',
  VAR = 'VAR',
  REMEMBER = 'REMEMBER',
  AS = 'AS',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  FOR = 'FOR',
  EVERY = 'EVERY',
  IN = 'IN',
  SAY = 'SAY',
  DISPLAY = 'DISPLAY',
  RETURN = 'RETURN',
  GIVE = 'GIVE',
  BACK = 'BACK',
  ASK = 'ASK',
  STORE = 'STORE',
  RESULT = 'RESULT',
  RANDOM = 'RANDOM',
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  BY = 'BY',
  REMOVE = 'REMOVE',
  DELETE = 'DELETE',
  SECONDS = 'SECONDS',
  MS = 'MS',
  START = 'START',
  THE = 'THE',
  A = 'A',
  AN = 'AN',
  IS = 'IS',
  ARE = 'ARE',
  EQUAL = 'EQUAL',
  NOT = 'NOT',
  GREATER = 'GREATER',
  LESS = 'LESS',
  THAN = 'THAN',
  AT = 'AT',
  LEAST = 'LEAST',
  MOST = 'MOST',
  MORE = 'MORE',
  EQUAL_TO = 'EQUAL_TO',
  OR = 'OR',
  OF = 'OF',
  LIST = 'LIST',
  USING = 'USING',
  WITH = 'WITH',
  FOLLOWED = 'FOLLOWED',
  SET = 'SET',
  REPEAT = 'REPEAT',
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  FROM = 'FROM',
  LENGTH = 'LENGTH',
  
  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  DIVIDED = 'DIVIDED',
  TERMINATE = 'TERMINATE',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_OP = 'GREATER_OP',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_OP = 'LESS_OP',
  LESS_EQUAL = 'LESS_EQUAL',
  AND = 'AND',
  
  // Punctuation
  COLON = 'COLON',
  COMMA = 'COMMA',
  DOT = 'DOT',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  
  // Special
  NEWLINE = 'NEWLINE',
  INDENT = 'INDENT',
  DEDENT = 'DEDENT',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

// AST Node types
export interface ASTNode {
  type: string;
  line: number;
}

export interface Program extends ASTNode {
  type: 'Program';
  body: Statement[];
}

export interface Statement extends ASTNode {}

export interface EventStatement extends Statement {
  type: 'EventStatement';
  eventType: string;
  interval?: number; // For timer events
  unit?: 'seconds' | 'ms'; // For timer events
  body: Statement[];
}

export interface FunctionStatement extends Statement {
  type: 'FunctionStatement';
  name: string;
  parameters: string[];
  body: Statement[];
}

export interface SetStatement extends Statement {
  type: 'SetStatement';
  variable: string;
  value: Expression;
  isGlobal?: boolean;
}

export interface AddStatement extends Statement {
  type: 'AddStatement';
  variable: string;
  amount: Expression;
  isGlobal?: boolean;
}

export interface RemoveStatement extends Statement {
  type: 'RemoveStatement';
  variable: string;
  amount: Expression;
  isGlobal?: boolean;
}

export interface DeleteStatement extends Statement {
  type: 'DeleteStatement';
  variable: string;
  isGlobal?: boolean;
}

export interface CallStatement extends Statement {
  type: 'CallStatement';
  function: string;
  arguments: Expression[];
}

export interface IfStatement extends Statement {
  type: 'IfStatement';
  condition: Expression;
  thenBody: Statement[];
  elseBody?: Statement[];
}

export interface WhileStatement extends Statement {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface ForEachStatement extends Statement {
  type: 'ForEachStatement';
  variable: string;
  iterable: Expression;
  body: Statement[];
}

export interface PrintStatement extends Statement {
  type: 'PrintStatement';
  expression: Expression;
  newline?: boolean;
}

export interface ReturnStatement extends Statement {
  type: 'ReturnStatement';
  expression?: Expression;
}

export interface Expression extends ASTNode {
  // Base properties that all expressions can have
  left?: Expression;
  right?: Expression;
  operator?: string;
  operand?: Expression;
  function?: string;
  arguments?: Expression[];
  object?: Expression;
  property?: Expression;
  elements?: Expression[];
  properties?: { key: string; value: Expression }[];
  name?: string;
  value?: any;
  isGlobal?: boolean;
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpression extends Expression {
  type: 'UnaryExpression';
  operator: string;
  operand: Expression;
}

export interface CallExpression extends Expression {
  type: 'CallExpression';
  function: string;
  arguments: Expression[];
}

export interface MemberExpression extends Expression {
  type: 'MemberExpression';
  object: Expression;
  property: Expression;
}

export interface ArrayExpression extends Expression {
  type: 'ArrayExpression';
  elements: Expression[];
}

export interface ObjectExpression extends Expression {
  type: 'ObjectExpression';
  properties: { key: string; value: Expression }[];
}

export interface Identifier extends Expression {
  type: 'Identifier';
  name: string;
  isGlobal?: boolean;
}

export interface Literal extends Expression {
  type: 'Literal';
  value: any;
}

// Runtime types
export interface RuntimeError extends Error {
  line: number;
  column?: number;
}

export interface ExecutionContext {
  variables: Map<string, any>;
  globalVariables: Map<string, any>;
  functions: Map<string, FunctionStatement>;
  events: Map<string, EventStatement>;
  output: (message: string, type: 'info' | 'error' | 'success' | 'warning' | 'system') => void;
  input: (prompt: string) => Promise<string>;
}