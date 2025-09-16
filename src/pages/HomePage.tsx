import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { 
  Palette, 
  File, 
  Library, 
  Zap, 
  Download, 
  Layers,
  ArrowRight,
  Check,
  Star
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Palette,
      title: 'Drag & Drop Designer',
      description: 'Intuitive visual editor with professional tools for creating custom labels',
      color: 'text-primary'
    },
    {
      icon: File,
      title: 'Professional Templates',
      description: 'Start with pre-designed templates for products, shipping, and retail labels',
      color: 'text-accent'
    },
    {
      icon: Zap,
      title: 'Dynamic Data Binding',
      description: 'Connect barcodes, QR codes, and text to your product data for automated generation',
      color: 'text-success'
    },
    {
      icon: Download,
      title: 'High-Quality Export',
      description: 'Generate print-ready PDFs with precise formatting and scalable graphics',
      color: 'text-warning'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Template',
      description: 'Start from scratch with our powerful drag-and-drop designer',
      icon: Palette,
      link: '/designer',
      variant: 'primary' as const,
      gradient: 'bg-gradient-primary'
    },
    {
      title: 'Browse Templates',
      description: 'Choose from professionally designed label templates',
      icon: Library,
      link: '/templates',
      variant: 'outline' as const,
      gradient: 'bg-gradient-subtle'
    },
    {
      title: 'Quick Generate',
      description: 'Use existing templates to generate labels instantly',
      icon: Zap,
      link: '/templates',
      variant: 'outline' as const,
      gradient: 'bg-card'
    }
  ];

  const benefits = [
    'Professional label design tools',
    'No design experience required',
    'Barcode and QR code generation',
    'Batch label production',
    'High-resolution PDF export',
    'Custom data field mapping'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container relative py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Layers className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Design Professional
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Labels</span>
              <br />in Minutes
            </h1>
            
            <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
              Create stunning product labels, shipping tags, and custom designs with our 
              powerful drag-and-drop editor. No design skills required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-primary hover:opacity-90 border-0">
                <Link to="/designer" className="flex items-center">
                  Start Designing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link to="/templates">
                  Browse Templates
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get Started in Seconds</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose your preferred way to create professional labels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {quickActions.map((action, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 rounded-xl ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-8 w-8 ${action.variant === 'primary' ? 'text-primary-foreground' : 'text-primary'}`} />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <CardDescription className="mb-6">
                    {action.description}
                  </CardDescription>
                  <Button variant={action.variant === 'primary' ? 'default' : action.variant} className={action.variant === 'primary' ? 'w-full bg-gradient-primary hover:opacity-90 border-0' : 'w-full'} asChild>
                    <Link to={action.link}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Design Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create professional labels with precision and ease
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="mb-6 mx-auto w-16 h-16 rounded-lg bg-card border border-border/50 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why Choose CloudLabel?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our platform combines ease-of-use with professional capabilities, 
                making label design accessible to everyone while delivering 
                enterprise-grade results.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-primary rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center text-primary-foreground">
                  <Palette className="h-20 w-20 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">Design Studio</h3>
                  <p className="opacity-90">Professional tools at your fingertips</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                <Star className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-success rounded-xl flex items-center justify-center shadow-lg">
                <Download className="h-8 w-8 text-success-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Amazing Labels?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using CloudLabel to create 
            professional labels in minutes, not hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/designer" className="flex items-center">
                Start Free Design
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/templates">
                View Templates
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;