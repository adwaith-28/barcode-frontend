import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';
import TemplatePreviewCanvas from '@/components/TemplatePreviewCanvas';
import DynamicElementEditor from '@/components/DynamicElementEditor';
import { useTemplateStore } from '@/stores/templateStore';
import { Template, LabelFormData, LayoutElement } from '@/types';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Loader2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const GeneratePage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { fetchTemplate } = useTemplateStore();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<LabelFormData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState<LayoutElement | null>(null);

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

  const handleElementClick = (element: LayoutElement) => {
    setSelectedElement(element);
  };

  const handleCloseEditor = () => {
    setSelectedElement(null);
  };


  const handleGenerateLabel = async () => {
    if (!template || !id) return;

    setIsGenerating(true);
    try {
      // Use custom generate endpoint with layout JSON
      const blob = await apiService.generateCustomLabel({
        templateId: parseInt(id),
        layoutJson: template.layoutJson,
        data: formData,
        format: 'pdf'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visual Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Template Preview</CardTitle>
                    <CardDescription>
                      Hover over dynamic elements to add your data
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  {template && (
                    <TemplatePreviewCanvas
                      template={JSON.parse(template.layoutJson)}
                      formData={formData}
                      onDataChange={handleInputChange}
                      onElementClick={handleElementClick}
                      selectedElementId={selectedElement?.id}
                      zoom={zoom}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dynamic Element Editor */}
            {selectedElement ? (
              <DynamicElementEditor
                selectedElement={selectedElement}
                formData={formData}
                onDataChange={handleInputChange}
                onClose={handleCloseEditor}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Dynamic Elements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Click on any dynamic element in the preview to edit its content
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerateLabel}
                  disabled={!isFormValid() || isGenerating}
                  className="w-full bg-gradient-primary hover:opacity-90 border-0"
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
                
                <Button
                  variant="outline"
                  onClick={() => setFormData({})}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
              </CardContent>
            </Card>

            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle>Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Name</div>
                  <div className="text-sm text-muted-foreground">{template?.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <div className="text-sm text-muted-foreground">{template?.description}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Category</div>
                  <Badge variant="secondary">{template?.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Edit Options */}
            <Card>
              <CardHeader>
                <CardTitle>Need Changes?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/designer/${template?.templateId}`}>
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