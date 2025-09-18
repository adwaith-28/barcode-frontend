import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { 
  Plus, 
  FileText, 
  Palette
} from 'lucide-react';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-6 lg:text-5xl">
            Create Professional Labels
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Design custom labels with drag-and-drop simplicity. Perfect for products, shipping, and retail.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Create New</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Start with a blank canvas and build your label from scratch
                </p>
                <Button asChild className="w-full">
                  <Link to="/designer">
                    New Design
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Use Template</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Choose from ready-made templates to get started quickly
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/templates">
                    Browse Templates
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-4">Simple yet powerful</h2>
            <p className="text-muted-foreground">
              Everything you need to create professional labels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Drag & Drop</h3>
              <p className="text-sm text-muted-foreground">
                Visual editor with text, barcodes, and images
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-medium mb-2">Templates</h3>
              <p className="text-sm text-muted-foreground">
                Pre-designed layouts for common use cases
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-medium mb-2">Export</h3>
              <p className="text-sm text-muted-foreground">
                High-quality PDF output ready for printing
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;