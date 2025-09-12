import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Code, Play, Zap, FileText, Cpu, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Natural Language Syntax",
      description: "Learn programming concepts by writing code that reads like plain English."
    },
    {
      icon: <Play className="h-8 w-8" />,
      title: "Instant Feedback",
      description: "Watch your programs run immediately and understand how each line affects the output."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Interactive Learning",
      description: "Practice with hands-on exercises and see results in real-time through the built-in console."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Beginner-Friendly Editor",
      description: "Clean editor with helpful highlighting and clear error messages to guide your learning."
    },
    {
      icon: <Cpu className="h-8 w-8" />,
      title: "Core Programming Concepts",
      description: "Master essential programming concepts: variables, functions, loops, and conditional logic."
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Distraction-Free Learning",
      description: "Clean, focused interface that helps you concentrate on learning programming concepts."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">PlainTalk</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover-scale">
              <Link to="/docs">Documentation</Link>
            </Button>
            <Button asChild className="hover-scale">
              <Link to="/playground">
                Try Playground
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            Learning Programming
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Learn to Code in Plain English
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            PlainTalk is an educational programming language designed to teach programming concepts using natural language. 
            Perfect for beginners and anyone wanting to understand programming logic clearly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6 hover-scale">
              <Link to="/playground">
                Start Coding Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 hover-scale">
              <Link to="/docs">
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Learning Made Simple</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Understand programming concepts through natural language without getting lost in complex syntax
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary hover-scale">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Example Code Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
          <p className="text-xl text-muted-foreground">
            Here's how simple PlainTalk really is
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>PlainTalk Example</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-secondary/50 p-6 rounded-lg text-sm overflow-x-auto">
                <code>{`ask "What is your name?" and store result in name
say "Hello " followed by name followed by "!"

set count to 1
repeat while count is less than or equal to 3:
    say "This is iteration " followed by count
    add 1 to count`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Learning?</h2>
          <p className="text-xl text-muted-foreground">
            Begin your programming journey with hands-on practice in the interactive playground
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-6 hover-scale">
            <Link to="/playground">
              Start Learning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 PlainTalk. Built with ❤️ for the coding community.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;