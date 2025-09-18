import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Template } from '@/types';
import { Loader2, Eye } from 'lucide-react';

interface TemplatePreviewProps {
  template: Template;
  className?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, className }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePreview();
  }, [template]);

  const generatePreview = async () => {
    if (!template.layoutJson) return;

    setIsLoading(true);
    setError(null);

    try {
      // Generate sample data for preview
      const sampleData = generateSampleData(template.layoutJson);
      
      const blob = await apiService.previewLabel({
        templateId: template.templateId,
        layoutJson: template.layoutJson,
        data: sampleData,
        format: 'pdf'
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
      setError('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = (layoutJson: string): Record<string, string> => {
    try {
      const layout = JSON.parse(layoutJson || '{}');
      const sampleData: Record<string, string> = {};
      
      if (layout.elements && Array.isArray(layout.elements)) {
        layout.elements.forEach((element: any) => {
          if (element.properties && element.properties.dataField) {
            const dataField = element.properties.dataField;
            // Generate sample data based on element type
            if (element.type === 'barcode' || element.type === 'product-code') {
              sampleData[dataField] = '123456789';
            } else if (element.type === 'qrcode') {
              sampleData[dataField] = 'Sample QR Data';
            } else if (element.type === 'dynamic-text' || element.type === 'text') {
              sampleData[dataField] = 'Sample Text';
            } else {
              sampleData[dataField] = 'Sample Data';
            }
          }
        });
      }
      
      return sampleData;
    } catch (error) {
      console.error('Error parsing layout JSON:', error);
      return {};
    }
  };

  if (isLoading) {
    return (
      <div className={`aspect-video bg-muted rounded-t-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Generating preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`aspect-video bg-muted rounded-t-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Preview unavailable</p>
        </div>
      </div>
    );
  }

  if (previewUrl) {
    return (
      <div className={`aspect-video bg-muted rounded-t-lg overflow-hidden relative ${className}`}>
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title={`Preview of ${template.name}`}
        />
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-muted rounded-t-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">No preview available</p>
      </div>
    </div>
  );
};

export default TemplatePreview;

