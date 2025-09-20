import React, { useRef } from 'react';
import { LayoutElement } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Type, Hash, QrCode, Image, Package } from 'lucide-react';

interface DynamicElementEditorProps {
  selectedElement: LayoutElement | null;
  formData: Record<string, string>;
  onDataChange: (field: string, value: string) => void;
  onClose: () => void;
}

const DynamicElementEditor: React.FC<DynamicElementEditorProps> = ({
  selectedElement,
  formData,
  onDataChange,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedElement) return null;

  const isDynamicElement = selectedElement.type === 'dynamic-text' || 
                          selectedElement.type === 'dynamic-image' || 
                          selectedElement.type === 'barcode' || 
                          selectedElement.type === 'qrcode' ||
                          selectedElement.type === 'product-code';

  if (!isDynamicElement) return null;

  const getDataField = () => {
    if (selectedElement.type === 'dynamic-image') {
      return selectedElement.id; // Use element ID for dynamic images
    }
    return selectedElement.properties?.dataField || selectedElement.id;
  };

  const dataField = getDataField();
  const currentValue = formData[dataField] || '';

  const getElementIcon = () => {
    switch (selectedElement.type) {
      case 'dynamic-text':
        return <Type className="h-4 w-4" />;
      case 'dynamic-image':
        return <Image className="h-4 w-4" />;
      case 'barcode':
        return <Hash className="h-4 w-4" />;
      case 'qrcode':
        return <QrCode className="h-4 w-4" />;
      case 'product-code':
        return <Package className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const getElementTypeLabel = () => {
    switch (selectedElement.type) {
      case 'dynamic-text':
        return 'Dynamic Text';
      case 'dynamic-image':
        return 'Dynamic Image';
      case 'barcode':
        return 'Barcode';
      case 'qrcode':
        return 'QR Code';
      case 'product-code':
        return 'Product Code';
      default:
        return 'Dynamic Element';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onDataChange(dataField, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderInput = () => {
    switch (selectedElement.type) {
      case 'dynamic-image':
        return (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {currentValue ? (
              <div className="space-y-3">
                <div className="text-sm text-green-600 font-medium flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Image uploaded successfully
                </div>
                <div className="relative">
                  <img
                    src={currentValue}
                    alt="Uploaded image"
                    className="w-full h-32 object-contain border border-gray-200 rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDataChange(dataField, '')}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  No image uploaded yet
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            )}
          </div>
        );

      case 'barcode':
        return (
          <div className="space-y-2">
            <Label htmlFor="barcode-input">Barcode Data</Label>
            <Input
              id="barcode-input"
              placeholder="Enter barcode data (e.g., 123456789)"
              value={currentValue}
              onChange={(e) => onDataChange(dataField, e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Enter the data that will be encoded in the barcode
            </div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="space-y-2">
            <Label htmlFor="qrcode-input">QR Code Data</Label>
            <Input
              id="qrcode-input"
              placeholder="Enter QR code data (URL, text, etc.)"
              value={currentValue}
              onChange={(e) => onDataChange(dataField, e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Enter the data that will be encoded in the QR code
            </div>
          </div>
        );

      case 'product-code':
        return (
          <div className="space-y-2">
            <Label htmlFor="product-code-input">Product Code</Label>
            <Input
              id="product-code-input"
              placeholder="Enter product code"
              value={currentValue}
              onChange={(e) => onDataChange(dataField, e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Enter the product code or SKU
            </div>
          </div>
        );

      case 'dynamic-text':
        return (
          <div className="space-y-2">
            <Label htmlFor="dynamic-text-input">Dynamic Text</Label>
            <Textarea
              id="dynamic-text-input"
              placeholder="Enter dynamic text content"
              value={currentValue}
              onChange={(e) => onDataChange(dataField, e.target.value)}
              rows={3}
            />
            <div className="text-xs text-muted-foreground">
              Enter the text that will appear in this element
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getElementIcon()}
            <CardTitle className="text-lg">{getElementTypeLabel()}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Configure the data for this dynamic element
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderInput()}
        
        {/* Element Info */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground space-y-1">
            <div><strong>Element ID:</strong> {selectedElement.id}</div>
            <div><strong>Position:</strong> {Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}</div>
            <div><strong>Size:</strong> {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)}</div>
            {selectedElement.properties?.dataField && (
              <div><strong>Data Field:</strong> {selectedElement.properties.dataField}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicElementEditor;
