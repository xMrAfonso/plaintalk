import { Token, TokenType, ASTNode, Program, Statement, Expression, EventStatement, FunctionStatement, SetStatement, AddStatement, RemoveStatement, DeleteStatement, CallStatement, IfStatement, WhileStatement, ForEachStatement, PrintStatement, ReturnStatement, BinaryExpression, UnaryExpression, CallExpression, MemberExpression, ArrayExpression, ObjectExpression, Identifier, Literal } from './types';

export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Program {
    const statements: Statement[] = [];
    
    while (!this.isAtEnd()) {
      // Skip newlines at top level
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }
      
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    return {
      type: 'Program',
      body: statements,
      line: 1
    };
  }

  private statement(): Statement | null {
    try {
      if (this.match(TokenType.WHEN)) return this.eventStatement();
      if (this.match(TokenType.EVERY)) return this.timerEventStatement();
      if (this.match(TokenType.TO)) return this.functionStatement();
      if (this.match(TokenType.REMEMBER, TokenType.VAR, TokenType.SET)) return this.setStatement();
      if (this.match(TokenType.INCREASE, TokenType.DECREASE, TokenType.ADD, TokenType.SUBTRACT, TokenType.MULTIPLY, TokenType.DIVIDE)) return this.mathStatement();
      if (this.match(TokenType.DELETE)) return this.deleteStatement();
      if (this.match(TokenType.IF)) return this.ifStatement();
      if (this.match(TokenType.WHILE, TokenType.REPEAT)) return this.whileStatement();
      if (this.match(TokenType.FOR)) return this.forEachStatement();
      if (this.match(TokenType.SAY, TokenType.DISPLAY)) return this.printStatement();
      if (this.match(TokenType.GIVE)) return this.returnStatement();
      if (this.match(TokenType.ASK)) return this.askStatement();
      if (this.match(TokenType.STORE)) return this.storeStatement();
      if (this.match(TokenType.TERMINATE)) return this.terminateStatement();
      
      // Handle function calls and other expressions
      const expr = this.expression();
      this.consumeNewlineOrEOF();
      return expr as Statement;
    } catch (error) {
      this.synchronize();
      throw error;
    }
  }

  private eventStatement(): EventStatement {
    const line = this.previous().line;
    
    // Skip optional articles
    this.match(TokenType.THE);
    
    let eventType = 'start';
    if (this.check(TokenType.PROGRAM)) {
      this.advance();
      this.consume(TokenType.STARTS, "Expected 'starts' after 'program'");
    } else {
      eventType = this.consume(TokenType.IDENTIFIER, "Expected event type").value;
    }
    
    this.consume(TokenType.COLON, "Expected ':' after event type");
    this.consumeNewlineOrEOF();
    
    const body = this.block();
    
    return {
      type: 'EventStatement',
      eventType,
      body,
      line
    };
  }

  private timerEventStatement(): EventStatement {
    const line = this.previous().line;
    
    const intervalToken = this.consume(TokenType.NUMBER, "Expected timer interval");
    const interval = parseInt(intervalToken.value);
    
    const unitToken = this.consume(TokenType.IDENTIFIER, "Expected time unit (seconds/ms)");
    const unit = unitToken.value as 'seconds' | 'ms';
    
    this.consume(TokenType.COLON, "Expected ':' after timer interval");
    this.consumeNewlineOrEOF();
    
    const body = this.block();
    
    return {
      type: 'EventStatement',
      eventType: 'timer',
      interval,
      unit,
      body,
      line
    };
  }

  private functionStatement(): FunctionStatement {
    const line = this.previous().line;
    
    const name = this.consume(TokenType.IDENTIFIER, "Expected function name").value;
    
    const parameters: string[] = [];
    
    if (this.match(TokenType.USING, TokenType.WITH)) {
      parameters.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
      
      while (this.match(TokenType.AND)) {
        parameters.push(this.consume(TokenType.IDENTIFIER, "Expected parameter name").value);
      }
    }
    
    this.consume(TokenType.COLON, "Expected ':' after function declaration");
    this.consumeNewlineOrEOF();
    
    const body = this.block();
    
    return {
      type: 'FunctionStatement',
      name,
      parameters,
      body,
      line
    };
  }

  private setStatement(): SetStatement {
    const line = this.previous().line;
    const keyword = this.previous().value; // Store the keyword that triggered this statement
    
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    
    // Handle different syntaxes: "remember X as Y", "var X as Y", "set X to Y"
    if (keyword === 'set') {
      this.consume(TokenType.TO, "Expected 'to' after variable name in set statement");
    } else {
      this.consume(TokenType.AS, "Expected 'as' after variable name");
    }
    
    // Check for list syntax: "remember VAR as list of apple, banana and cherry"
    if (this.match(TokenType.LIST)) {
      this.consume(TokenType.OF, "Expected 'of' after 'list'");
      
      const elements: Expression[] = [];
      
      // Parse first element - treat unquoted identifiers as strings in list context
      elements.push(this.listElement());
      
      // Parse remaining elements separated by comma and/or 'and'
      while (this.match(TokenType.COMMA) || this.check(TokenType.AND)) {
        // Skip comma if present
        if (this.previous().type === TokenType.COMMA) {
          // Look for optional 'and' after comma
          this.match(TokenType.AND);
        } else {
          // Consume the 'and'
          this.advance();
        }
        
        elements.push(this.listElement());
      }
      
      this.consumeNewlineOrEOF();
      
      return {
        type: 'SetStatement',
        variable,
        value: {
          type: 'ArrayExpression',
          elements,
          line
        } as Expression,
        line
      };
    }
    
    const value = this.expression();
    this.consumeNewlineOrEOF();
    
    return {
      type: 'SetStatement',
      variable,
      value,
      line
    };
  }

  private mathStatement(): AddStatement | RemoveStatement {
    const line = this.previous().line;
    const operation = this.previous().value;
    
    if (operation === 'add') {
      // Handle "add X to Y" syntax
      const amount = this.expression();
      this.consume(TokenType.TO, "Expected 'to' after amount in add statement");
      const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
      this.consumeNewlineOrEOF();
      
      return {
        type: 'AddStatement',
        variable,
        amount,
        line
      };
    }
    
    if (operation === 'subtract') {
      // Handle "subtract X from Y" syntax
      const amount = this.expression();
      this.consume(TokenType.FROM, "Expected 'from' after amount in subtract statement");
      const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
      this.consumeNewlineOrEOF();
      
      return {
        type: 'RemoveStatement',
        variable,
        amount,
        line
      };
    }
    
    if (operation === 'multiply') {
      // Handle "multiply X by Y" syntax
      const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
      this.consume(TokenType.BY, "Expected 'by' after variable name");
      const amount = this.expression();
      this.consumeNewlineOrEOF();
      
      return {
        type: 'AddStatement', // We'll handle this as a special multiplication in the interpreter
        variable,
        amount: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: variable, line },
          operator: '*',
          right: amount,
          line
        } as Expression,
        line
      };
    }
    
    if (operation === 'divide') {
      // Handle "divide X by Y" syntax
      const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
      this.consume(TokenType.BY, "Expected 'by' after variable name");
      const amount = this.expression();
      this.consumeNewlineOrEOF();
      
      return {
        type: 'AddStatement', // We'll handle this as a special division in the interpreter
        variable,
        amount: {
          type: 'BinaryExpression',
          left: { type: 'Identifier', name: variable, line },
          operator: '/',
          right: amount,
          line
        } as Expression,
        line
      };
    }
    
    // Handle "increase/decrease X by Y" syntax
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consume(TokenType.BY, "Expected 'by' after variable name");
    
    const amount = this.expression();
    this.consumeNewlineOrEOF();
    
    if (operation === 'increase') {
      return {
        type: 'AddStatement',
        variable,
        amount,
        line
      };
    } else {
      return {
        type: 'RemoveStatement',
        variable,
        amount,
        line
      };
    }
  }

  private deleteStatement(): DeleteStatement {
    const line = this.previous().line;
    
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consumeNewlineOrEOF();
    
    return {
      type: 'DeleteStatement',
      variable,
      line
    };
  }

  private ifStatement(): IfStatement {
    const line = this.previous().line;
    
    const condition = this.expression();
    this.consume(TokenType.COLON, "Expected ':' after if condition");
    this.consumeNewlineOrEOF();
    
    const thenBody = this.block();
    
    let elseBody: Statement[] | undefined;
    
    // Handle "else if" constructs
    while (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        // This is an "else if" - treat as nested if statement
        const elseIfCondition = this.expression();
        this.consume(TokenType.COLON, "Expected ':' after else if condition");
        this.consumeNewlineOrEOF();
        
        const elseIfBody = this.block();
        
        // Create a nested if statement for the else if
        const nestedIf: IfStatement = {
          type: 'IfStatement',
          condition: elseIfCondition,
          thenBody: elseIfBody,
          line: this.previous().line
        };
        
        // If there's already an else body, continue building the chain
        if (elseBody) {
          // Find the deepest else clause and attach this else if
          let current = elseBody[elseBody.length - 1] as IfStatement;
          while (current.elseBody && current.elseBody.length > 0 && current.elseBody[0].type === 'IfStatement') {
            current = current.elseBody[0] as IfStatement;
          }
          current.elseBody = [nestedIf];
        } else {
          elseBody = [nestedIf];
        }
      } else {
        // This is a regular "else"
        this.consume(TokenType.COLON, "Expected ':' after 'else'");
        this.consumeNewlineOrEOF();
        
        const regularElseBody = this.block();
        
        // Attach to the deepest else clause
        if (elseBody && elseBody.length > 0 && elseBody[0].type === 'IfStatement') {
          let current = elseBody[0] as IfStatement;
          while (current.elseBody && current.elseBody.length > 0 && current.elseBody[0].type === 'IfStatement') {
            current = current.elseBody[0] as IfStatement;
          }
          current.elseBody = regularElseBody;
        } else {
          elseBody = regularElseBody;
        }
        break; // Regular else ends the chain
      }
    }
    
    return {
      type: 'IfStatement',
      condition,
      thenBody,
      elseBody,
      line
    };
  }

  private whileStatement(): WhileStatement {
    const line = this.previous().line;
    
    // Skip optional "while" after "repeat"
    if (this.previous().value === 'repeat') {
      this.match(TokenType.WHILE);
    }
    
    const condition = this.expression();
    this.consume(TokenType.COLON, "Expected ':' after while condition");
    this.consumeNewlineOrEOF();
    
    const body = this.block();
    
    return {
      type: 'WhileStatement',
      condition,
      body,
      line
    };
  }

  private forEachStatement(): ForEachStatement {
    const line = this.previous().line;
    
    this.match(TokenType.EVERY); // 'for every' or just 'for'
    
    const variable = this.consume(TokenType.IDENTIFIER, "Expected loop variable").value;
    this.consume(TokenType.IN, "Expected 'in' after loop variable");
    
    // Skip optional 'the list of'
    this.match(TokenType.THE);
    this.match(TokenType.LIST);
    this.match(TokenType.OF);
    
    const iterable = this.expression();
    this.consume(TokenType.COLON, "Expected ':' after for loop");
    this.consumeNewlineOrEOF();
    
    const body = this.block();
    
    return {
      type: 'ForEachStatement',
      variable,
      iterable,
      body,
      line
    };
  }

  private printStatement(): PrintStatement {
    const line = this.previous().line;
    const command = this.previous().value; // 'say' or 'display'
    
    const expression = this.expression();
    this.consumeNewlineOrEOF();
    
    return {
      type: 'PrintStatement',
      expression,
      newline: command === 'say', // 'say' includes newline, 'display' doesn't
      line
    };
  }

  private askStatement(): SetStatement {
    const line = this.previous().line;
    
    const prompt = this.expression();
    this.consume(TokenType.AND, "Expected 'and' after ask prompt");
    this.consume(TokenType.STORE, "Expected 'store' after 'and'");
    
    // Skip optional 'the' article
    this.match(TokenType.THE);
    this.consume(TokenType.RESULT, "Expected 'result' after 'store'");
    
    this.consume(TokenType.IN, "Expected 'in' after 'store result'");
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consumeNewlineOrEOF();
    
    return {
      type: 'SetStatement',
      variable,
      value: {
        type: 'CallExpression',
        function: 'input',
        arguments: [prompt],
        line
      } as Expression,
      line
    };
  }

  private storeStatement(): SetStatement {
    const line = this.previous().line;
    
    const value = this.expression();
    this.consume(TokenType.IN, "Expected 'in' after value");
    const variable = this.consume(TokenType.IDENTIFIER, "Expected variable name").value;
    this.consumeNewlineOrEOF();
    
    return {
      type: 'SetStatement',
      variable,
      value,
      line
    };
  }

  private returnStatement(): ReturnStatement {
    const line = this.previous().line;
    
    this.consume(TokenType.BACK, "Expected 'back' after 'give'");
    
    let expression: Expression | undefined;
    if (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      expression = this.expression();
    }
    
    this.consumeNewlineOrEOF();
    
    return {
      type: 'ReturnStatement',
      expression,
      line
    };
  }

  private terminateStatement(): Statement {
    const line = this.previous().line;
    
    this.consume(TokenType.PROGRAM, "Expected 'program' after 'terminate'");
    this.consumeNewlineOrEOF();
    
    return {
      type: 'CallStatement',
      function: 'terminate',
      arguments: [],
      line
    } as Statement;
  }

  private block(): Statement[] {
    const statements: Statement[] = [];
    
    this.consume(TokenType.INDENT, "Expected indentation");
    
    while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }
      
      const stmt = this.statement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    this.consume(TokenType.DEDENT, "Expected dedentation");
    
    return statements;
  }

  // Expression parsing with natural language operators
  private expression(): Expression {
    return this.or();
  }

  private or(): Expression {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      // Regular logical OR
      const operator = this.previous().value;
      const right = this.and();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        line: this.previous().line
      };
    }

    return expr;
  }

  private and(): Expression {
    let expr = this.equality();

    // Only consume AND as logical operator if we're not in the middle of parsing a statement
    // that uses AND as a keyword (like ask statements or function calls)
    while (this.match(TokenType.AND)) {
      // Check if this might be part of an ask statement by looking ahead
      if (this.check(TokenType.STORE)) {
        // This AND is part of "ask ... and store result in ..."
        // Put the AND token back and return
        this.current--;
        break;
      }
      
      // Check if we're in a function call context by looking at the current expression
      // If the left side is an identifier and we're parsing arguments, don't consume AND
      if (expr.type === 'Identifier' && this.checkFunctionCallContext()) {
        // This AND is part of function arguments like "calculateArea using 5 and 3"
        // Put the AND token back and return
        this.current--;
        break;
      }
      
      const operator = this.previous().value;
      const right = this.equality();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        line: this.previous().line
      };
    }

    return expr;
  }

  private checkFunctionCallContext(): boolean {
    // Look back to see if we're in a "using" or "with" function call context
    let pos = this.current - 2; // Go back before the AND token
    while (pos >= 0) {
      const token = this.tokens[pos];
      if (token.type === TokenType.USING || token.type === TokenType.WITH) {
        return true;
      }
      if (token.type === TokenType.NEWLINE || token.type === TokenType.COLON) {
        return false;
      }
      pos--;
    }
    return false;
  }

  private equality(): Expression {
    let expr = this.comparison();

    while (true) {
      if (this.match(TokenType.IS)) {
        if (this.match(TokenType.EQUAL, TokenType.TO)) {
          // Skip optional 'to'
          this.match(TokenType.TO);
          const right = this.comparison();
          expr = {
            type: 'BinaryExpression',
            left: expr,
            operator: '==',
            right,
            line: this.previous().line
          };
        } else if (this.match(TokenType.NOT)) {
          const right = this.comparison();
          expr = {
            type: 'BinaryExpression',
            left: expr,
            operator: '!=',
            right,
            line: this.previous().line
          };
        } else if (this.match(TokenType.GREATER)) {
          this.consume(TokenType.THAN, "Expected 'than' after 'greater'");
          
          // Check for "or equal to" after "greater than"
          if (this.match(TokenType.OR)) {
            this.consume(TokenType.EQUAL, "Expected 'equal' after 'or'");
            this.match(TokenType.TO); // Optional 'to'
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '>=',
              right,
              line: this.previous().line
            };
          } else {
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '>',
              right,
              line: this.previous().line
            };
          }
        } else if (this.match(TokenType.LESS)) {
          this.consume(TokenType.THAN, "Expected 'than' after 'less'");
          
          // Check for "or equal to" after "less than"
          if (this.match(TokenType.OR)) {
            this.consume(TokenType.EQUAL, "Expected 'equal' after 'or'");
            this.match(TokenType.TO); // Optional 'to'
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '<=',
              right,
              line: this.previous().line
            };
          } else {
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '<',
              right,
              line: this.previous().line
            };
          }
        } else if (this.match(TokenType.AT)) {
          if (this.match(TokenType.LEAST)) {
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '>=',
              right,
              line: this.previous().line
            };
          } else if (this.match(TokenType.MOST)) {
            const right = this.comparison();
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '<=',
              right,
              line: this.previous().line
            };
          }
        } else {
          // Check for "X or more" and "X or less" patterns
          const right = this.comparison();
          
          // After parsing the right side, check for "or more" or "or less"
          if (this.match(TokenType.OR)) {
            if (this.match(TokenType.MORE)) {
              // "age is 18 or more" means "age >= 18"
              expr = {
                type: 'BinaryExpression',
                left: expr,
                operator: '>=',
                right,
                line: this.previous().line
              };
            } else if (this.match(TokenType.LESS)) {
              // "age is 18 or less" means "age <= 18"  
              expr = {
                type: 'BinaryExpression',
                left: expr,
                operator: '<=',
                right,
                line: this.previous().line
              };
            } else {
              // Put the OR token back and treat as equality
              this.current--;
              expr = {
                type: 'BinaryExpression',
                left: expr,
                operator: '==',
                right,
                line: this.previous().line
              };
            }
          } else {
            // Just 'is' by itself means equality
            expr = {
              type: 'BinaryExpression',
              left: expr,
              operator: '==',
              right,
              line: this.previous().line
            };
          }
        }
      } else {
        break;
      }
    }

    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();

    while (this.match(TokenType.GREATER_OP, TokenType.GREATER_EQUAL, TokenType.LESS_OP, TokenType.LESS_EQUAL, TokenType.EQUALS, TokenType.NOT_EQUALS)) {
      const operator = this.previous().value;
      const right = this.term();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        line: this.previous().line
      };
    }

    return expr;
  }

  private term(): Expression {
    let expr = this.factor();

    while (this.match(TokenType.PLUS, TokenType.MINUS) || this.checkFollowedBy()) {
      if (this.checkFollowedBy()) {
        // Handle "followed by" as string concatenation
        this.advance(); // consume "followed"
        this.consume(TokenType.BY, "Expected 'by' after 'followed'");
        const right = this.factor();
        expr = {
          type: 'BinaryExpression',
          left: expr,
          operator: '+',
          right,
          line: this.previous().line
        };
      } else {
        const operator = this.previous().value;
        const right = this.factor();
        expr = {
          type: 'BinaryExpression',
          left: expr,
          operator,
          right,
          line: this.previous().line
        };
      }
    }

    return expr;
  }

  private checkFollowedBy(): boolean {
    return this.check(TokenType.FOLLOWED);
  }

  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.DIVIDED)) {
      let operator = this.previous().value;
      if (operator === 'divided') {
        this.match(TokenType.BY); // Skip optional 'by'
        operator = '/';
      }
      const right = this.unary();
      expr = {
        type: 'BinaryExpression',
        left: expr,
        operator,
        right,
        line: this.previous().line
      };
    }

    return expr;
  }

  private unary(): Expression {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.previous().value;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator,
        operand: right,
        line: this.previous().line
      };
    }

    return this.call();
  }

  private call(): Expression {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(TokenType.IDENTIFIER, "Expected property name after '.'").value;
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: { type: 'Literal', value: name, line: this.previous().line },
          line: this.previous().line
        };
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        const index = this.expression();
        this.consume(TokenType.RIGHT_BRACKET, "Expected ']' after array index");
        expr = {
          type: 'MemberExpression',
          object: expr,
          property: index,
          line: this.previous().line
        };
      } else if (this.check(TokenType.USING) || this.check(TokenType.WITH)) {
        // Function call with natural language
        this.advance(); // consume 'using' or 'with'
        const args: Expression[] = [];
        
        if (!this.check(TokenType.NEWLINE) && !this.isAtEnd() && !this.check(TokenType.COLON)) {
          // Use comparison() instead of expression() to avoid consuming AND tokens
          args.push(this.comparison());
          
          while (this.match(TokenType.AND)) {
            args.push(this.comparison());
          }
        }
        
        // Debug: log the parsed function call
        
        
        expr = {
          type: 'CallExpression',
          function: (expr as Identifier).name,
          arguments: args,
          line: this.previous().line
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expression): Expression {
    const args: Expression[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, "Expected ')' after arguments");

    return {
      type: 'CallExpression',
      function: (callee as Identifier).name,
      arguments: args,
      line: this.previous().line
    };
  }

  private primary(): Expression {
    if (this.match(TokenType.NUMBER)) {
      const value = parseFloat(this.previous().value);
      return {
        type: 'Literal',
        value,
        line: this.previous().line
      };
    }

    if (this.match(TokenType.STRING)) {
      return {
        type: 'Literal',
        value: this.previous().value,
        line: this.previous().line
      };
    }

    if (this.match(TokenType.TRUE)) {
      return {
        type: 'Literal',
        value: true,
        line: this.previous().line
      };
    }

    if (this.match(TokenType.FALSE)) {
      return {
        type: 'Literal',
        value: false,
        line: this.previous().line
      };
    }

    if (this.match(TokenType.LENGTH)) {
      // Handle "length of X" syntax
      this.consume(TokenType.OF, "Expected 'of' after 'length'");
      const argument = this.primary();
      return {
        type: 'CallExpression',
        function: 'length',
        arguments: [argument],
        line: this.previous().line
      };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: 'Identifier',
        name: this.previous().value,
        line: this.previous().line
      };
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression");
      return expr;
    }


    if (this.match(TokenType.LEFT_BRACE)) {
      return this.objectExpression();
    }

    throw new Error(`Unexpected token '${this.peek().value}' at line ${this.peek().line}`);
  }


  private objectExpression(): ObjectExpression {
    const line = this.previous().line;
    const properties: { key: string; value: Expression }[] = [];

    if (!this.check(TokenType.RIGHT_BRACE)) {
      do {
        const key = this.consume(TokenType.IDENTIFIER, "Expected property name").value;
        this.consume(TokenType.COLON, "Expected ':' after property name");
        const value = this.expression();
        properties.push({ key, value });
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after object properties");

    return {
      type: 'ObjectExpression',
      properties,
      line
    };
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    // Treat EOF correctly: when at end, only match EOF
    if (this.isAtEnd()) return type === TokenType.EOF;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    const current = this.peek();
    throw new Error(`${message}. Got '${current.value}' at line ${current.line}, column ${current.column}`);
  }

  private consumeNewlineOrEOF(): void {
    // Allow statements to end with newline, EOF, or a DEDENT (end of block)
    if (this.check(TokenType.NEWLINE)) {
      this.advance();
    } else if (this.isAtEnd() || this.check(TokenType.DEDENT)) {
      // Do not advance here: EOF will be handled by isAtEnd(),
      // DEDENT will be consumed by the surrounding block parser.
      return;
    } else if (this.check(TokenType.ELSE)) {
      // Allow else to terminate the previous statement
      return;
    } else {
      const current = this.peek();
      throw new Error(`Expected newline or end of file at line ${current.line}, column ${current.column}. Got '${current.value}'`);
    }
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.NEWLINE) return;

      switch (this.peek().type) {
        case TokenType.WHEN:
        case TokenType.TO:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.FOR:
        case TokenType.REMEMBER:
        case TokenType.GIVE:
          return;
      }

      this.advance();
    }
  }
  private listElement(): Expression {
    // In list context, treat unquoted identifiers as string literals
    if (this.check(TokenType.IDENTIFIER)) {
      const token = this.advance();
      return {
        type: 'Literal',
        value: token.value,
        line: token.line
      };
    }
    
    // For other types (strings, numbers, etc.), use normal parsing
    return this.primary();
  }
}