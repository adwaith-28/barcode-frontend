import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { 
  Plus, 
  FileText, 
  QrCode,
  Layers,
  Target
} from 'lucide-react';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-blue-600/10 p-4">
              <Target className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-6 lg:text-5xl">
            SOTI Trace
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Professional label designer for enterprise. Create product labels, asset tags, and identification labels with precision tracking capabilities.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Create New Label</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Design custom labels from scratch with our professional editor
                </p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link to="/designer">
                    Start Design
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-slate-600/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-slate-600" />
                </div>
                <CardTitle className="text-lg">Use Template</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Select from enterprise-ready templates and layouts
                </p>
                <Button variant="outline" asChild className="w-full border-slate-300 hover:bg-slate-50">
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
      <section className="py-16 bg-slate-50">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">Enterprise Label Management</h2>
            <p className="text-slate-600">
              Professional tools for asset tracking and identification
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2 text-slate-900">Visual Designer</h3>
              <p className="text-sm text-slate-600">
                Drag-and-drop interface for text, barcodes, and QR codes
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-slate-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-medium mb-2 text-slate-900">Code Generation</h3>
              <p className="text-sm text-slate-600">
                Generate barcodes and QR codes for asset tracking
              </p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2 text-slate-900">Print Ready</h3>
              <p className="text-sm text-slate-600">
                High-resolution PDF export for professional printing
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;