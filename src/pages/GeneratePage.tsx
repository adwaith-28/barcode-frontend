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
        
        // Extract all dataField values from the template layout
        const allDataFields = extractDataFieldsFromLayout(templateData.layoutJson);
        
        // Initialize form data with empty values for all data fields
        const initialData: LabelFormData = {};
        allDataFields.forEach((field) => {
          initialData[field.dataField] = '';
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

  const extractDataFieldsFromLayout = (layoutJson: string): Array<{dataField: string, tag: string}> => {
    try {
      const layout = JSON.parse(layoutJson || '{}');
      const fieldMap = new Map<string, string>();
      
      if (layout.elements && Array.isArray(layout.elements)) {
        layout.elements.forEach((element: any) => {
          if (element.properties && element.properties.dataField) {
            const tag = element.properties.tag || element.properties.dataField;
            fieldMap.set(element.properties.dataField, tag);
          } else if (element.type === 'dynamic-image') {
            // For dynamic-image elements, create a field based on the element ID
            const tag = element.properties.tag || 'Dynamic Image';
            fieldMap.set(element.id, tag);
          }
        });
      }
      
      // If no dataFields found, fall back to requiredFields
      if (fieldMap.size === 0) {
        const requiredFields = JSON.parse(template?.requiredFields || '[]');
        requiredFields.forEach((field: string) => {
          fieldMap.set(field, field);
        });
      }
      
      return Array.from(fieldMap.entries()).map(([dataField, tag]) => ({ dataField, tag }));
    } catch (error) {
      console.error('Error parsing layout JSON:', error);
      return [];
    }
  };

  const getFieldLabel = (field: string) => {
    // First try to find exact match in DATA_FIELDS
    const dataField = DATA_FIELDS.find(f => f.value === field);
    if (dataField) return dataField.label;
    
    // If it's a generated field with underscore, extract the base name
    if (field.includes('_')) {
      const baseField = field.split('_')[0];
      const baseDataField = DATA_FIELDS.find(f => f.value === baseField);
      if (baseDataField) {
        return `${baseDataField.label} (${field.split('_')[1]})`;
      }
    }
    
    // Fallback to the field name itself
    return field;
  };

  const isFormValid = () => {
    if (!template) return false;
    const allDataFields = extractDataFieldsFromLayout(template.layoutJson);
    return allDataFields.every((field) => 
      formData[field.dataField] && formData[field.dataField].toString().trim() !== ''
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

  const allDataFields = extractDataFieldsFromLayout(template.layoutJson);

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

        <div className="max-w-2xl mx-auto">
          {/* Data Input Form */}
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
              {allDataFields.map((field) => (
                <div key={field.dataField} className="space-y-2">
                  <Label htmlFor={field.dataField}>
                    {field.tag}
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  
                  {field.tag.toLowerCase().includes('description') ? (
                    <Textarea
                      id={field.dataField}
                      placeholder={`Enter ${field.tag.toLowerCase()}`}
                      value={formData[field.dataField] || ''}
                      onChange={(e) => handleInputChange(field.dataField, e.target.value)}
                      rows={3}
                    />
                  ) : field.tag.toLowerCase().includes('price') ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id={field.dataField}
                        type="text"
                        placeholder="0.00"
                        value={formData[field.dataField] || ''}
                        onChange={(e) => handleInputChange(field.dataField, e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  ) : field.tag.toLowerCase().includes('image') ? (
                    <Input
                      id={field.dataField}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleInputChange(field.dataField, reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  ) : (
                    <Input
                      id={field.dataField}
                      placeholder={`Enter ${field.tag.toLowerCase()}`}
                      value={formData[field.dataField] || ''}
                      onChange={(e) => handleInputChange(field.dataField, e.target.value)}
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
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
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
    </Layout>
  );
};

export default GeneratePage;