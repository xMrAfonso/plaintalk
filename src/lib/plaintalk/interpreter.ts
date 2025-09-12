import { Program, Statement, Expression, EventStatement, FunctionStatement, SetStatement, AddStatement, RemoveStatement, DeleteStatement, CallStatement, IfStatement, WhileStatement, ForEachStatement, PrintStatement, ReturnStatement, BinaryExpression, CallExpression, MemberExpression, ArrayExpression, ObjectExpression, Identifier, Literal, ExecutionContext } from './types';

class PlainTalkRuntimeError extends Error {
  line: number;
  
  constructor(message: string, line: number) {
    super(message);
    this.name = 'PlainTalkRuntimeError';
    this.line = line;
  }
}

export class Interpreter {
  private context: ExecutionContext;
  private running: boolean = false;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(context: ExecutionContext) {
    this.context = context;
  }

  isRunning(): boolean {
    return this.running;
  }

  async execute(program: Program): Promise<void> {
    this.running = true;
    
    try {
      // First pass: collect functions and events
      for (const statement of program.body) {
        if (statement.type === 'FunctionStatement') {
          const func = statement as FunctionStatement;
          this.context.functions.set(func.name, func);
        } else if (statement.type === 'EventStatement') {
          const event = statement as EventStatement;
          this.context.events.set(event.eventType, event);
          
          // Set up timer events
          if (event.eventType === 'timer' && event.interval) {
            this.setupTimerEvent(event);
          }
        }
      }

      // Execute 'start' event if it exists
      const startEvent = this.context.events.get('start');
      if (startEvent) {
        await this.executeStatements(startEvent.body);
      }

      // Second pass: execute non-function, non-event statements
      for (const statement of program.body) {
        if (statement.type !== 'FunctionStatement' && statement.type !== 'EventStatement') {
          await this.executeStatement(statement);
        }
      }
      } catch (error: any) {
        if (error instanceof PlainTalkRuntimeError) {
          this.context.output(`Error: ${error.message} at line ${error.line}`, 'error');
        } else {
          this.context.output(`Runtime Error: ${error.message}`, 'error');
        }
        this.running = false;
      }
      
      // Only stop if there are no active timers
      if (this.timers.size === 0) {
        this.running = false;
      }
  }

  async triggerEvent(eventType: string): Promise<void> {
    const event = this.context.events.get(eventType);
    if (event) {
      try {
        await this.executeStatements(event.body);
      } catch (error: any) {
        if (error instanceof PlainTalkRuntimeError) {
          this.context.output(`Error: ${error.message} at line ${error.line}`, 'error');
        } else {
          this.context.output(`Runtime Error: ${error.message}`, 'error');
        }
      }
    }
  }

  stop(): void {
    this.running = false;
    // Clear all timers
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }

  private async executeStatements(statements: Statement[]): Promise<any> {
    let lastResult = undefined;
    for (const statement of statements) {
      if (!this.running) break;
      const result = await this.executeStatement(statement);
      if (result !== undefined) {
        lastResult = result;
        // If this is a return statement result, break out
        if (statement.type === 'ReturnStatement') {
          break;
        }
      }
    }
    return lastResult;
  }

  private setupTimerEvent(event: EventStatement): void {
    if (!event.interval) return;
    
    // Convert interval to milliseconds if needed
    let intervalMs = event.interval;
    if (event.unit === 'seconds') {
      intervalMs = event.interval * 1000;
    }
    
    const timerId = `timer_${Date.now()}`;
    const timer = setInterval(async () => {
      if (this.running) {
        await this.executeStatements(event.body);
      } else {
        clearInterval(timer);
        this.timers.delete(timerId);
      }
    }, intervalMs);
    
    this.timers.set(timerId, timer);
  }

  private async executeStatement(statement: Statement): Promise<any> {
    if (!this.running) return;

    switch (statement.type) {
      case 'SetStatement':
        await this.executeSetStatement(statement as SetStatement);
        break;
      case 'AddStatement':
        await this.executeAddStatement(statement as AddStatement);
        break;
      case 'RemoveStatement':
        await this.executeRemoveStatement(statement as RemoveStatement);
        break;
      case 'DeleteStatement':
        await this.executeDeleteStatement(statement as DeleteStatement);
        break;
      case 'CallStatement':
        await this.executeCallStatement(statement as CallStatement);
        break;
      case 'IfStatement':
        return await this.executeIfStatement(statement as IfStatement);
      case 'WhileStatement':
        await this.executeWhileStatement(statement as WhileStatement);
        break;
      case 'ForEachStatement':
        await this.executeForEachStatement(statement as ForEachStatement);
        break;
      case 'PrintStatement':
        await this.executePrintStatement(statement as PrintStatement);
        break;
      case 'ReturnStatement':
        return await this.executeReturnStatement(statement as ReturnStatement);
      case 'CallExpression':
        await this.evaluateExpression(statement as CallExpression);
        break;
      default:
        await this.evaluateExpression(statement as Expression);
    }
  }

  private async executeSetStatement(statement: SetStatement): Promise<void> {
    const value = await this.evaluateExpression(statement.value);
    
    if (statement.isGlobal) {
      this.context.globalVariables.set(statement.variable, value);
    } else {
      this.context.variables.set(statement.variable, value);
    }
  }

  private async executeAddStatement(statement: AddStatement): Promise<void> {
    const amount = await this.evaluateExpression(statement.amount);
    
    const variables = statement.isGlobal ? this.context.globalVariables : this.context.variables;
    const current = variables.get(statement.variable) || 0;
    
    // Check if this is a simple addition or a mathematical operation result
    if (statement.amount.type === 'BinaryExpression') {
      // This handles multiply/divide operations that were converted to SetStatements
      variables.set(statement.variable, amount);
    } else {
      // Regular addition
      if (typeof current !== 'number' || typeof amount !== 'number') {
        throw new PlainTalkRuntimeError(`Cannot perform arithmetic on non-numeric values`, statement.line);
      }
      variables.set(statement.variable, current + amount);
    }
  }

  private async executeRemoveStatement(statement: RemoveStatement): Promise<void> {
    const amount = await this.evaluateExpression(statement.amount);
    
    const variables = statement.isGlobal ? this.context.globalVariables : this.context.variables;
    const current = variables.get(statement.variable) || 0;
    
    if (typeof current !== 'number' || typeof amount !== 'number') {
      throw new PlainTalkRuntimeError(`Cannot decrease non-numeric values`, statement.line);
    }
    
    variables.set(statement.variable, current - amount);
  }

  private async executeDeleteStatement(statement: DeleteStatement): Promise<void> {
    if (statement.isGlobal) {
      this.context.globalVariables.delete(statement.variable);
    } else {
      this.context.variables.delete(statement.variable);
    }
  }

  private async executeCallStatement(statement: CallStatement): Promise<void> {
    await this.callFunction(statement.function, statement.arguments, statement.line);
  }

  private async executeIfStatement(statement: IfStatement): Promise<any> {
    const condition = await this.evaluateExpression(statement.condition);
    
    if (this.isTruthy(condition)) {
      const result = await this.executeStatements(statement.thenBody);
      return result;
    } else if (statement.elseBody) {
      const result = await this.executeStatements(statement.elseBody);
      return result;
    }
    return undefined;
  }

  private async executeWhileStatement(statement: WhileStatement): Promise<void> {
    while (this.running) {
      const condition = await this.evaluateExpression(statement.condition);
      if (!this.isTruthy(condition)) break;
      
      await this.executeStatements(statement.body);
    }
  }

  private async executeForEachStatement(statement: ForEachStatement): Promise<void> {
    const iterable = await this.evaluateExpression(statement.iterable);
    
    if (!Array.isArray(iterable)) {
      throw new PlainTalkRuntimeError(`Cannot iterate over non-array value`, statement.line);
    }
    
    for (const item of iterable) {
      if (!this.running) break;
      
      // Set loop variable
      this.context.variables.set(statement.variable, item);
      
      await this.executeStatements(statement.body);
    }
    
    // Clean up loop variable
    this.context.variables.delete(statement.variable);
  }

  private async executePrintStatement(statement: PrintStatement): Promise<void> {
    const value = await this.evaluateExpression(statement.expression);
    const message = this.stringify(value);
    
    if (statement.newline !== false) {
      this.context.output(message, 'info');
    } else {
      // For display (no newline), we'll use a special marker
      this.context.output(message + '\0NO_NEWLINE', 'info');
    }
  }

  private async executeReturnStatement(statement: ReturnStatement): Promise<any> {
    if (statement.expression) {
      const returnValue = await this.evaluateExpression(statement.expression);
      return returnValue;
    }
    return undefined;
  }

  private async evaluateExpression(expression: Expression): Promise<any> {
    switch (expression.type) {
      case 'Literal':
        return (expression as Literal).value;
        
      case 'Identifier':
        return this.evaluateIdentifier(expression as Identifier);
        
      case 'BinaryExpression':
        return await this.evaluateBinaryExpression(expression as BinaryExpression);
        
      case 'UnaryExpression':
        return await this.evaluateUnaryExpression(expression as any);
        
      case 'CallExpression':
        return await this.evaluateCallExpression(expression as CallExpression);
        
      case 'MemberExpression':
        return await this.evaluateMemberExpression(expression as MemberExpression);
        
      case 'ArrayExpression':
        return await this.evaluateArrayExpression(expression as ArrayExpression);
        
      case 'ObjectExpression':
        return await this.evaluateObjectExpression(expression as ObjectExpression);
        
      default:
        throw new PlainTalkRuntimeError(`Unknown expression type: ${expression.type}`, expression.line);
    }
  }

  private evaluateIdentifier(identifier: Identifier): any {
    const variables = identifier.isGlobal ? this.context.globalVariables : this.context.variables;
    
    if (variables.has(identifier.name)) {
      return variables.get(identifier.name);
    }
    
    // Check global scope if not found in local scope
    if (!identifier.isGlobal && this.context.globalVariables.has(identifier.name)) {
      return this.context.globalVariables.get(identifier.name);
    }
    
    throw new PlainTalkRuntimeError(`Undefined variable: ${identifier.name}`, identifier.line);
  }

  private async evaluateBinaryExpression(expression: BinaryExpression): Promise<any> {
    const left = await this.evaluateExpression(expression.left);
    
    // Short-circuit evaluation for logical operators
    if (expression.operator === 'and') {
      if (!this.isTruthy(left)) return left;
      return await this.evaluateExpression(expression.right);
    }
    
    if (expression.operator === 'or') {
      if (this.isTruthy(left)) return left;
      return await this.evaluateExpression(expression.right);
    }
    
    const right = await this.evaluateExpression(expression.right);
    
    switch (expression.operator) {
      case '+':
        // For string concatenation, if either operand is a string, concatenate
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        return Number(left) + Number(right);
      case '-':
        return Number(left) - Number(right);
      case '*':
        return Number(left) * Number(right);
      case '/':
        const leftNum = Number(left);
        const rightNum = Number(right);
        if (rightNum === 0) throw new PlainTalkRuntimeError('Division by zero', expression.line);
        return leftNum / rightNum;
      case '==':
        return left === right;
      case '!=':
        return left !== right;
      case '>':
        return left > right;
      case '>=':
        return left >= right;
      case '<':
        return left < right;
      case '<=':
        return left <= right;
      default:
        throw new PlainTalkRuntimeError(`Unknown binary operator: ${expression.operator}`, expression.line);
    }
  }

  private async evaluateUnaryExpression(expression: any): Promise<any> {
    const operand = await this.evaluateExpression(expression.operand);
    
    switch (expression.operator) {
      case '-':
        return -operand;
      case 'not':
        return !this.isTruthy(operand);
      default:
        throw new PlainTalkRuntimeError(`Unknown unary operator: ${expression.operator}`, expression.line);
    }
  }

  private async evaluateCallExpression(expression: CallExpression): Promise<any> {
    return await this.callFunction(expression.function, expression.arguments, expression.line);
  }

  private async evaluateMemberExpression(expression: MemberExpression): Promise<any> {
    const object = await this.evaluateExpression(expression.object);
    const property = await this.evaluateExpression(expression.property);
    
    if (object == null) {
      throw new PlainTalkRuntimeError('Cannot access property of null or undefined', expression.line);
    }
    
    return object[property];
  }

  private async evaluateArrayExpression(expression: ArrayExpression): Promise<any[]> {
    const elements = [];
    for (const element of expression.elements) {
      elements.push(await this.evaluateExpression(element));
    }
    return elements;
  }

  private async evaluateObjectExpression(expression: ObjectExpression): Promise<any> {
    const object: any = {};
    for (const prop of expression.properties) {
      object[prop.key] = await this.evaluateExpression(prop.value);
    }
    return object;
  }

  private async callFunction(name: string, args: Expression[], line: number): Promise<any> {
    console.log(`[FUNCTION DEBUG] Calling '${name}' with ${args.length} arguments at line ${line}`);
    
    // Evaluate arguments
    const evaluatedArgs = [];
    for (const arg of args) {
      evaluatedArgs.push(await this.evaluateExpression(arg));
    }
    
    
    
    // Built-in functions
    switch (name) {
      case 'print':
      case 'say':
        const message = evaluatedArgs.map(arg => this.stringify(arg)).join(' ');
        this.context.output(message, 'info');
        return undefined;
        
      case 'display':
        const displayMessage = evaluatedArgs.map(arg => this.stringify(arg)).join(' ');
        this.context.output(displayMessage + '\0NO_NEWLINE', 'info');
        return undefined;
        
      case 'input':
      case 'ask':
        const prompt = evaluatedArgs.length > 0 ? this.stringify(evaluatedArgs[0]) : '';
        const input = await this.context.input(prompt);
        // Try to convert to number if it's a valid number
        const numValue = parseFloat(input);
        return !isNaN(numValue) && isFinite(numValue) && input.trim() !== '' ? numValue : input;
        
        case 'random':
        if (evaluatedArgs.length === 1) {
          return Math.floor(Math.random() * evaluatedArgs[0]);
        } else if (evaluatedArgs.length === 2) {
          const min = evaluatedArgs[0];
          const max = evaluatedArgs[1];
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        throw new PlainTalkRuntimeError('random() expects 1 or 2 arguments', line);
        
      case 'length':
        if (evaluatedArgs.length !== 1) {
          throw new PlainTalkRuntimeError('length() expects 1 argument', line);
        }
        const value = evaluatedArgs[0];
        if (Array.isArray(value)) {
          return value.length;
        } else if (typeof value === 'string') {
          return value.length;
        }
        throw new PlainTalkRuntimeError('length() can only be used on arrays or strings', line);
        
      case 'terminate':
        this.context.output('[SYSTEM] Execution completed.', 'system');
        this.stop();
        return undefined;
        
      default:
        // User-defined function
        const func = this.context.functions.get(name);
        if (!func) {
          throw new PlainTalkRuntimeError(`Undefined function: ${name}`, line);
        }
        
        if (evaluatedArgs.length !== func.parameters.length) {
          throw new PlainTalkRuntimeError(`Function ${name} expects ${func.parameters.length} arguments, got ${evaluatedArgs.length}`, line);
        }
        
        // Create new scope for function
        const previousVariables = new Map(this.context.variables);
        
        // Set parameters
        for (let i = 0; i < func.parameters.length; i++) {
          this.context.variables.set(func.parameters[i], evaluatedArgs[i]);
        }
        
        try {
          let returnValue = undefined;
          for (const statement of func.body) {
            if (statement.type === 'ReturnStatement') {
              returnValue = await this.executeReturnStatement(statement as ReturnStatement);
              break;
            } else {
              const result = await this.executeStatement(statement);
              // If a statement returns a value (like from a return statement), use it
              if (result !== undefined) {
                returnValue = result;
              }
            }
          }
          return returnValue;
        } finally {
          // Restore previous scope
          this.context.variables = previousVariables;
        }
    }
  }

  private isTruthy(value: any): boolean {
    if (value == null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    return true;
  }

  private stringify(value: any): string {
    if (value == null) return 'null';
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }
}