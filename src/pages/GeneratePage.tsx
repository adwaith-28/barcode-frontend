import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import { useTemplateStore } from '@/stores/templateStore';
import { Template, LabelFormData, DATA_FIELDS } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Eye, 
  RefreshCw, 
  ArrowLeft,
  FileText,
  Loader2
} from 'lucide-react';

const GeneratePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { fetchTemplate } = useTemplateStore();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<LabelFormData>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const templateData = await fetchTemplate(parseInt(id!));
      if (templateData) {
        setTemplate(templateData);
        // Initialize form data with empty values for required fields
        const requiredFields = JSON.parse(templateData.requiredFields || '[]');
        const initialData: LabelFormData = {};
        requiredFields.forEach((field: string) => {
          initialData[field] = '';
        });
        setFormData(initialData);
      } else {
        toast({
          title: "Template not found",
          description: "The requested template could not be loaded.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error loading template",
        description: "Failed to load the template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Generate preview automatically when data changes
    if (template) {
      generatePreview();
    }
  };

  const generatePreview = async () => {
    if (!template || !id) return;

    try {
      const blob = await apiService.previewLabel({
        templateId: parseInt(id),
        data: formData,
        format: 'png'
      });

      if (blob) {
        // Revoke previous preview URL to prevent memory leaks
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    }
  };

  const handleGenerateLabel = async () => {
    if (!template || !id) return;

    setIsGenerating(true);
    try {
      const blob = await apiService.generateLabel({
        templateId: parseInt(id),
        data: formData
      });

      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.name}-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Label generated successfully",
          description: "Your PDF has been downloaded."
        });
      } else {
        throw new Error('Failed to generate label');
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate the label. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getFieldLabel = (field: string) => {
    const dataField = DATA_FIELDS.find(f => f.value === field);
    return dataField ? dataField.label : field;
  };

  const isFormValid = () => {
    if (!template) return false;
    const requiredFields = JSON.parse(template.requiredFields || '[]');
    return requiredFields.every((field: string) => 
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!template) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The requested template could not be found.
            </p>
            <Button asChild>
              <Link to="/templates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const requiredFields = JSON.parse(template.requiredFields || '[]');

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/templates">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <Badge variant="secondary">{template.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
          
          <Button
            onClick={handleGenerateLabel}
            disabled={!isFormValid() || isGenerating}
            className="bg-gradient-primary hover:opacity-90 border-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Data Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Label Data
                </CardTitle>
                <CardDescription>
                  Fill in the information that will appear on your label
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requiredFields.map((field: string) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>
                      {getFieldLabel(field)}
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    
                    {field === 'Description' ? (
                      <Textarea
                        id={field}
                        placeholder={`Enter ${getFieldLabel(field).toLowerCase()}`}
                        value={formData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        rows={3}
                      />
                    ) : field === 'Price' ? (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id={field}
                          type="text"
                          placeholder="0.00"
                          value={formData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    ) : (
                      <Input
                        id={field}
                        placeholder={`Enter ${getFieldLabel(field).toLowerCase()}`}
                        value={formData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                      />
                    )}
                  </div>
                ))}

                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setFormData({})}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    onClick={generatePreview}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your label will look as you type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center min-h-[300px]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Label preview"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Fill in the form to see a preview</p>
                      <p className="text-sm mt-2">
                        Changes will update automatically
                      </p>
                    </div>
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generatePreview}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need to make changes?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/designer/${template.templateId}`}>
                    Edit Template
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/templates">
                    Choose Different Template
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GeneratePage;