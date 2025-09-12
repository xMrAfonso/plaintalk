import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { ExecutionContext } from './types';

export interface PlainTalkEngineOptions {
  output: (message: string, type: 'info' | 'error' | 'success' | 'warning' | 'system') => void;
  input: (prompt: string) => Promise<string>;
}

export class PlainTalkEngine {
  private context: ExecutionContext;
  private interpreter?: Interpreter;

  constructor(options: PlainTalkEngineOptions) {
    this.context = {
      variables: new Map(),
      globalVariables: new Map(),
      functions: new Map(),
      events: new Map(),
      output: options.output,
      input: options.input
    };
  }

  async execute(code: string): Promise<void> {
    try {
      // Tokenize
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();

      // Parse
      const parser = new Parser(tokens);
      const ast = parser.parse();

      // Interpret
      this.interpreter = new Interpreter(this.context);
      await this.interpreter.execute(ast);
    } catch (error: any) {
      this.context.output(`Syntax Error: ${error.message}`, 'error');
    }
  }

  async triggerEvent(eventType: string): Promise<void> {
    if (this.interpreter) {
      await this.interpreter.triggerEvent(eventType);
    }
  }

  stop(): void {
    if (this.interpreter) {
      this.interpreter.stop();
    }
  }

  getVariables(): Map<string, any> {
    return new Map([...this.context.variables, ...this.context.globalVariables]);
  }

  getFunctions(): string[] {
    return Array.from(this.context.functions.keys());
  }

  getEvents(): string[] {
    return Array.from(this.context.events.keys());
  }

  isRunning(): boolean {
    return this.interpreter ? this.interpreter.isRunning() : false;
  }
}

// Example scripts showcasing PlainTalk syntax
export const EXAMPLE_SCRIPTS = {
  'Hello World': `when the program starts:
    say "Hello, World!"
`,

  'Variables': `when the program starts:
    remember name as "Alice"
    var age as 25
    say "Hello, " followed by name
    say "You are " followed by age followed by " years old"
`,

  'User Input': `when the program starts:
    ask "What is your name?" and store result in userName
    say "Nice to meet you, " followed by userName followed by "!"
`,

  'Math Operations': `when the program starts:
    var x as 10
    var y as 5
    
    say "x + y = " followed by (x + y)
    say "x - y = " followed by (x - y)
    say "x * y = " followed by (x * y)
    say "x divided by y = " followed by (x / y)
    
    increase x by 3
    say "After increasing x by 3: " followed by x
    
    decrease y by 2
    say "After decreasing y by 2: " followed by y
`,

  'Conditionals': `when the program starts:
    ask "Enter your age:" and store result in age
    
    if age is 18 or more:
        say "You are an adult!"
    else:
        say "You are a minor!"
        
    if age is greater than 65:
        say "You qualify for senior discounts!"
`,

  'Loops': `when the program starts:
    var counter as 1
    
    while counter is less than 6:
        say "Count: " followed by counter
        increase counter by 1
    
    var fruits as list of apple, banana and cherry
    
    for every fruit in fruits:
        say "I like " followed by fruit
`,

  'Functions': `to greet using name:
    say "Hello, " followed by name followed by "!"

to calculateArea using width and height:
    var area as width * height
    give back area

when the program starts:
    greet using "World"
    
    var area as calculateArea using 5 and 3
    say "Area: " followed by area
`,

  'Timers': `when the program starts:
    var counter as 0
    say "Timer started!"

every 2 seconds:
    increase counter by 1
    say "Timer tick: " followed by counter
    
    if counter is 5 or more:
        say "Timer finished!"
        terminate program
`,

  'Interactive Counter': `when the program starts:
    say "Interactive counter with user input!"
    ask "Enter max count:" and store result in maxCount
    var hasInput as true
    var count as 0

every 1 seconds:
    if hasInput is true:
        increase count by 1
        say "Current count: " followed by count
        
        if count is maxCount or more:
            say "Counter reached maximum!"
            terminate program
`,

  'Simple Calculator': `to addValues using a and b:
    give back a + b

to subtractValues using a and b:
    give back a - b

to multiplyValues using a and b:
    give back a * b

to divideValues using a and b:
    if b is 0:
        say "Error: Cannot divide by zero!"
        give back 0
    else:
        give back a / b

when the program starts:
    say "Simple Calculator"
    
    ask "Enter first number:" and store result in num1
    ask "Enter second number:" and store result in num2
    
    say "Addition: " followed by addValues using num1 and num2
    say "Subtraction: " followed by subtractValues using num1 and num2
    say "Multiplication: " followed by multiplyValues using num1 and num2
    say "Division: " followed by divideValues using num1 and num2
`,

   'Alternative Syntax': `ask "What is your name?" and store result in name
say "Hello " followed by name followed by "!"

set count to 1
repeat while count is less than or equal to 3:
    say "This is iteration " followed by count
    add 1 to count
`,

  'Advanced Math': `when the program starts:
    set x to 10
    say "Initial value: " followed by x
    
    add 5 to x
    say "After adding 5: " followed by x
    
    subtract 3 from x
    say "After subtracting 3: " followed by x
    
    multiply x by 2
    say "After multiplying by 2: " followed by x
    
    divide x by 4
    say "After dividing by 4: " followed by x
`,

  'Complex Conditionals': `when the program starts:
    ask "Enter your age:" and store result in age
    ask "Are you a student? (yes/no)" and store result in isStudent
    
    if age is greater than 18:
        say "You are an adult"
        if isStudent is equal to "yes":
            say "You get a student discount!"
        else:
            say "Regular adult pricing applies"
    else if age is greater than 13:
        say "You are a teenager"
    else:
        say "You are a child"
        
    if age is 65 or more:
        say "Senior citizen benefits available!"
`,

  'List Operations': `when the program starts:
    set numbers to list of 1, 2, 3, 4, 5
    say "List length: " followed by length of numbers
    
    set fruits to list of apple, banana, cherry
    say "Fruits list length: " followed by length of fruits
    
    for every fruit in fruits:
        say "Processing: " followed by fruit
        
    set text to "Hello World"
    say "Text length: " followed by length of text
`
};