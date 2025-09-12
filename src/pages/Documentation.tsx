import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Code, ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <Code className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">PlainTalk Documentation</h1>
            </div>
          </div>
          <Button asChild>
            <Link to="/playground">
              Try it Out
              <Play className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">PlainTalk Language Reference</h1>
          <p className="text-xl text-muted-foreground mb-6">
            A complete guide to the PlainTalk programming language syntax and features.
          </p>
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg">
                PlainTalk is designed to be as close to natural English as possible while maintaining 
                the precision needed for programming. This documentation covers all language features 
                with practical examples.
              </p>
            </CardContent>
          </Card>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Reserved Keywords</CardTitle>
                <CardDescription>This are all the words that are reserved for the language.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <Badge variant="outline" className="mb-2">Program Structure</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`when
program
starts
to
var
remember
as
give back
`}</code>
                        </pre>
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-2">Control Flow</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`if
else
while
for
repeat
`}</code>
                        </pre>
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-2">Input/Output</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`say
display
ask
store
result
followed by
`}</code>
                        </pre>
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-2">Comparison & Logic</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`is equal to
is not equal to
is greater than
is less than
is greater than or equal to
is less than or equal to
`}</code>
                        </pre>
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-2">Mathematical Operations</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`add
subtract
multiply
divide
by
from
`}</code>
                        </pre>
                    </div>
                    <div>
                        <Badge variant="outline" className="mb-2">Other</Badge>
                        <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{`using
with
set
increase
decrease
remove
delete
every
seconds
ms
`}</code>
                        </pre>
                    </div>
                </div>
            </CardContent>
        </Card>
        </section>

        {/* Variables */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Variables & Assignment</h2>
          
          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Basic Assignment</CardTitle>
              <CardDescription>Store values in variables using natural language</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set name to "Alice"
set age to 25
set is_student to true
set pi to 3.14159`}</code>
              </pre>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Variables can store strings, numbers, booleans, and lists.
                </p>
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set name to "Alice"\nset age to 25\nset is_student to true\nset pi to 3.14159\n\nsay "Name: " followed by name\nsay "Age: " followed by age\nsay "Student: " followed by is_student` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Mathematical Operations</CardTitle>
              <CardDescription>Perform calculations and update variables</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set x to 10
add 5 to x          // x becomes 15
subtract 3 from x   // x becomes 12
multiply x by 2     // x becomes 24
divide x by 4       // x becomes 6`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set x to 10\nsay "Initial value: " followed by x\n\nadd 5 to x\nsay "After adding 5: " followed by x\n\nsubtract 3 from x\nsay "After subtracting 3: " followed by x\n\nmultiply x by 2\nsay "After multiplying by 2: " followed by x\n\ndivide x by 4\nsay "After dividing by 4: " followed by x` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Output */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Output & Display</h2>
          
          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Basic Output</CardTitle>
              <CardDescription>Display text and values to the console</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`say "Hello, World!"
say name
say "The answer is " followed by result`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `say "Hello, World!"\n\nset name to "Alice"\nsay name\n\nset result to 42\nsay "The answer is " followed by result` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>String Concatenation</CardTitle>
              <CardDescription>Combine multiple values in output</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set first_name to "John"
set last_name to "Doe"
say first_name followed by " " followed by last_name

// Multiple concatenations
say "Score: " followed by score followed by "/" followed by total`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set first_name to "John"\nset last_name to "Doe"\nsay first_name followed by " " followed by last_name\n\nset score to 85\nset total to 100\nsay "Score: " followed by score followed by "/" followed by total` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">User Input</h2>
          
          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>Getting Input</CardTitle>
              <CardDescription>Prompt users for input and store responses</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`ask "What is your name?" and store result in user_name
ask "How old are you?" and store result in user_age

say "Hello " followed by user_name
say "You are " followed by user_age followed by " years old"`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `ask "What is your name?" and store result in user_name\nask "How old are you?" and store result in user_age\n\nsay "Hello " followed by user_name\nsay "You are " followed by user_age followed by " years old"` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Conditionals */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Conditional Statements</h2>
          
          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>If Statements</CardTitle>
              <CardDescription>Make decisions based on conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`if age is greater than 18:
    say "You are an adult"

if score is equal to 100:
    say "Perfect score!"
else:
    say "Good try!"

if temperature is greater than 30:
    say "It's hot outside"
else if temperature is less than 10:
    say "It's cold outside"
else:
    say "Nice weather"`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set age to 20\nif age is greater than 18:\n    say "You are an adult"\n\nset score to 95\nif score is equal to 100:\n    say "Perfect score!"\nelse:\n    say "Good try!"\n\nset temperature to 25\nif temperature is greater than 30:\n    say "It's hot outside"\nelse if temperature is less than 10:\n    say "It's cold outside"\nelse:\n    say "Nice weather"` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comparison Operators</CardTitle>
              <CardDescription>Available comparison operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Badge variant="outline" className="mb-2">Equality</Badge>
                  <ul className="space-y-1">
                    <li><code>is equal to</code></li>
                    <li><code>is not equal to</code></li>
                  </ul>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">Comparison</Badge>
                  <ul className="space-y-1">
                    <li><code>is greater than</code></li>
                    <li><code>is less than</code></li>
                    <li><code>is greater than or equal to</code></li>
                    <li><code>is less than or equal to</code></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Loops */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Loops & Iteration</h2>
          
          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>While Loops</CardTitle>
              <CardDescription>Repeat code while a condition is true</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set counter to 1
repeat while counter is less than or equal to 5:
    say "Count: " followed by counter
    add 1 to counter`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set counter to 1\nrepeat while counter is less than or equal to 5:\n    say "Count: " followed by counter\n    add 1 to counter` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle>For Each Loops</CardTitle>
              <CardDescription>Iterate over items in a list</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set fruits to list of "apple", "banana", "cherry"

for every fruit in fruits:
    say "I like " followed by fruit

// You can also use more natural phrasing
for every item in shopping_list:
    say "Buy " followed by item`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `set fruits to list of "apple", "banana", "cherry"\n\nfor every fruit in fruits:\n    say "I like " followed by fruit\n\nset shopping_list to list of "milk", "bread", "eggs"\nfor every item in shopping_list:\n    say "Buy " followed by item` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Lists */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Lists & Collections</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Creating Lists</CardTitle>
              <CardDescription>Store multiple values in ordered collections</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set colors to list of "red", "green", "blue"
set numbers to list of 1, 2, 3, 4, 5
set mixed to list of "hello", 42, true

// Natural language syntax
set fruits to list of apple, banana and cherry
set pets to list of dog, cat, bird and fish`}</code>
              </pre>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>List Operations</CardTitle>
              <CardDescription>Add, remove, and access list items</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`set my_list to list of 1, 2, 3

// Access items (0-based indexing)
say my_list[0]    // Outputs: 1
say my_list[2]    // Outputs: 3

// Add items
add 4 to my_list
add "new item" to my_list

// Get list length
say "List has " followed by length of my_list followed by " items"`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Functions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Functions</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Defining Functions</CardTitle>
              <CardDescription>Create reusable code blocks</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`to greet using name:
    say "Hello, " followed by name followed by "!"

to add_numbers using x and y:
    set result to x + y
    give back result

to calculate_area using width and height:
    give back width * height`}</code>
              </pre>
              <div className="flex justify-end">
                <Button size="sm" variant="outline" className="transition-transform duration-200 hover:scale-105" asChild>
                  <Link to="/playground" state={{ code: `to greet using name:\n    say "Hello, " followed by name followed by "!"\n\nto add_numbers using x and y:\n    set result to x + y\n    give back result\n\nto calculate_area using width and height:\n    give back width * height\n\n// Now let's use these functions\ngreet using "Alice"\nset sum to add_numbers using 10 and 5\nsay "Sum: " followed by sum\nset area to calculate_area using 8 and 6\nsay "Area: " followed by area` }}>
                    <Play className="h-4 w-4 mr-2" />
                    Try it
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Calling Functions</CardTitle>
              <CardDescription>Use your defined functions</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`// Call function
greet using "Alice"

// Call function with multiple parameters  
set sum to add_numbers using 5 and 10
say "The sum is " followed by sum

// Use function result in expressions
set area to calculate_area using 10 and 5
say "Area: " followed by area`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Built-in Functions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Built-in Functions</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Utility Functions</CardTitle>
              <CardDescription>Ready-to-use functions for common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-4 rounded-lg text-sm overflow-x-auto mb-4">
                <code>{`// List operations  
set my_list to list of 1, 2, 3, 4, 5
say "List length: " followed by my_list[0]

// Random numbers
set random_num to random using 1 and 10
say "Random: " followed by random_num

// Built-in functions work in function call format
set result to add_numbers using 5 and 10
say "Result: " followed by result`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Best Practices</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">✓ Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Use descriptive variable names</p>
                <p>• Keep functions small and focused</p>
                <p>• Add comments to explain complex logic</p>
                <p>• Use consistent indentation</p>
                <p>• Test your code with different inputs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">✗ Don't</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Use single letter variable names</p>
                <p>• Create overly complex functions</p>
                <p>• Forget to handle edge cases</p>
                <p>• Mix different coding styles</p>
                <p>• Skip testing your programs</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Footer CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Coding?</h2>
          <p className="text-muted-foreground mb-6">
            Now that you know the syntax, try building something in the playground!
          </p>
          <Button size="lg" className="transition-transform duration-200 hover:scale-105" asChild>
            <Link to="/playground">
              Open Playground
              <Play className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Documentation;