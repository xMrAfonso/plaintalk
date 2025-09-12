import { Token, TokenType } from './types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;
  private indentStack: number[] = [0];
  private pendingTokens: Token[] = [];

  private keywords: Map<string, TokenType> = new Map([
    ['when', TokenType.WHEN],
    ['program', TokenType.PROGRAM],
    ['starts', TokenType.STARTS],
    ['to', TokenType.TO],
    ['var', TokenType.VAR],
    ['remember', TokenType.REMEMBER],
    ['as', TokenType.AS],
    ['if', TokenType.IF],
    ['else', TokenType.ELSE],
    ['while', TokenType.WHILE],
    ['for', TokenType.FOR],
    ['every', TokenType.EVERY],
    ['in', TokenType.IN],
    ['say', TokenType.SAY],
    ['display', TokenType.DISPLAY],
    ['give', TokenType.GIVE],
    ['back', TokenType.BACK],
    ['ask', TokenType.ASK],
    ['store', TokenType.STORE],
    ['result', TokenType.RESULT],
    ['increase', TokenType.INCREASE],
    ['decrease', TokenType.DECREASE],
    ['by', TokenType.BY],
    ['using', TokenType.USING],
    ['with', TokenType.WITH],
    ['followed', TokenType.FOLLOWED],
    ['set', TokenType.SET],
    ['repeat', TokenType.REPEAT],
    ['add', TokenType.ADD],
    ['subtract', TokenType.SUBTRACT],
    ['multiply', TokenType.MULTIPLY],
    ['divide', TokenType.DIVIDE],
    ['from', TokenType.FROM],
    ['and', TokenType.AND],
    ['or', TokenType.OR],
    ['the', TokenType.THE],
    ['is', TokenType.IS],
    ['not', TokenType.NOT],
    ['greater', TokenType.GREATER],
    ['less', TokenType.LESS],
    ['than', TokenType.THAN],
    ['more', TokenType.MORE],
    ['equal', TokenType.EQUAL],
    ['at', TokenType.AT],
    ['least', TokenType.LEAST],
    ['most', TokenType.MOST],
    ['of', TokenType.OF],
    ['list', TokenType.LIST],
    ['divided', TokenType.DIVIDED],
    ['start', TokenType.START],
    ['terminate', TokenType.TERMINATE],
    ['true', TokenType.TRUE],
    ['false', TokenType.FALSE],
    ['length', TokenType.LENGTH],
  ]);

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    
    while (!this.isAtEnd() || this.pendingTokens.length > 0) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }
    
    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      tokens.push(this.createToken(TokenType.DEDENT, ''));
    }
    
    tokens.push(this.createToken(TokenType.EOF, ''));
    return tokens;
  }

  private nextToken(): Token | null {
    if (this.pendingTokens.length > 0) {
      return this.pendingTokens.shift()!;
    }
    
    this.skipWhitespace();
    
    if (this.isAtEnd()) return null;

    const char = this.peek();
    
    // Handle null character (end of input)
    if (char === '\0') {
      return null;
    }

    if (char === '\n') {
      this.advance();
      const token = this.createToken(TokenType.NEWLINE, '\n');
      const indentTokens = this.handleIndentation();
      this.pendingTokens.push(...indentTokens);
      return token;
    }

    if (this.isDigit(char)) {
      return this.number();
    }

    if (char === '"' || char === "'") {
      return this.string(char);
    }

    if (this.isAlpha(char)) {
      return this.identifier();
    }

    // Handle comments before single-character tokens to ensure // is not tokenized as DIVIDE
    if (char === '#' || (char === '/' && this.peek(1) === '/')) {
      this.skipComment();
      return this.nextToken();
    }

    switch (char) {
      case '+': this.advance(); return this.createToken(TokenType.PLUS, '+');
      case '-': this.advance(); return this.createToken(TokenType.MINUS, '-');
      case '*': this.advance(); return this.createToken(TokenType.MULTIPLY, '*');
      case '/': this.advance(); return this.createToken(TokenType.DIVIDE, '/');
      case ':': this.advance(); return this.createToken(TokenType.COLON, ':');
      case '(': this.advance(); return this.createToken(TokenType.LEFT_PAREN, '(');
      case ')': this.advance(); return this.createToken(TokenType.RIGHT_PAREN, ')');
      case '[': this.advance(); return this.createToken(TokenType.LEFT_BRACKET, '[');
      case ']': this.advance(); return this.createToken(TokenType.RIGHT_BRACKET, ']');
      case ',': this.advance(); return this.createToken(TokenType.COMMA, ',');
    }

    // Don't throw error for null character - just return null
    if (char === '\0') {
      return null;
    }

    throw new Error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
  }

  private handleIndentation(): Token[] {
    const tokens: Token[] = [];
    let indentLevel = 0;
    
    while (this.peek() === ' ' || this.peek() === '\t') {
      indentLevel++;
      this.advance();
    }
    
    if (this.peek() === '\n' || this.peek() === '\0' || this.isAtEnd()) {
      return tokens;
    }
    
    const currentIndent = this.indentStack[this.indentStack.length - 1];
    
    if (indentLevel > currentIndent) {
      this.indentStack.push(indentLevel);
      tokens.push(this.createToken(TokenType.INDENT, ''));
    } else if (indentLevel < currentIndent) {
      while (this.indentStack.length > 1 && this.indentStack[this.indentStack.length - 1] > indentLevel) {
        this.indentStack.pop();
        tokens.push(this.createToken(TokenType.DEDENT, ''));
      }
    }
    
    return tokens;
  }

  private number(): Token {
    const start = this.position;
    
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    
    const value = this.input.substring(start, this.position);
    return this.createToken(TokenType.NUMBER, value);
  }

  private string(quote: string): Token {
    const start = this.position;
    this.advance();
    
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }
    
    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`);
    }
    
    this.advance();
    
    const value = this.input.substring(start + 1, this.position - 1);
    return this.createToken(TokenType.STRING, value);
  }

  private identifier(): Token {
    const start = this.position;
    
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    
    const value = this.input.substring(start, this.position);
    const type = this.keywords.get(value) || TokenType.IDENTIFIER;
    
    return this.createToken(type, value);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === ' ' || char === '\r' || char === '\t') {
        this.advance();
      } else {
        break;
      }
    }
  }

  private skipComment(): void {
    // Handle both # and // style comments
    if (this.peek() === '#') {
      this.advance(); // consume #
    } else if (this.peek() === '/' && this.peek(1) === '/') {
      this.advance(); // consume first /
      this.advance(); // consume second /
    }
    
    while (!this.isAtEnd() && this.peek() !== '\n') {
      this.advance();
    }
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private advance(): string {
    if (this.isAtEnd()) return '\0';
    
    const char = this.input[this.position];
    this.position++;
    
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    
    return char;
  }

  private peek(offset = 0): string {
    const pos = this.position + offset;
    if (pos >= this.input.length) return '\0';
    return this.input[pos];
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           char === '_';
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private createToken(type: TokenType, value: string): Token {
    return {
      type,
      value,
      line: this.line,
      column: this.column
    };
  }
}