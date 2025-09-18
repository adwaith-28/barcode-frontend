import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ELEMENT_TYPES } from '@/types';
import { useDesignerStore } from '@/stores/designerStore';
import { 
  Type, 
  Hash, 
  QrCode, 
  Image, 
  Square, 
  Minus,
  MousePointer2
} from 'lucide-react';

const ElementPalette = () => {
  const { addElement } = useDesignerStore();

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'dynamic-text':
        return Type;
      case 'barcode':
      case 'product-code':
        return Hash;
      case 'qrcode':
        return QrCode;
      case 'image':
      case 'dynamic-image':
      case 'logo':
        return Image;
      case 'rectangle':
        return Square;
      case 'line':
        return Minus;
      default:
        return MousePointer2;
    }
  };

  const handleAddElement = (elementType: string) => {
    const baseElement = {
      id: '',
      type: elementType as any,
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      zIndex: 1,
      properties: getDefaultProperties(elementType),
      style: getDefaultStyle(elementType)
    };

    addElement(baseElement);
  };

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case 'text':
        return {
          content: 'Sample Text',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000'
        };
      case 'dynamic-text':
        return {
          content: 'Dynamic Text',
          tag: 'Dynamic Text',
          dataField: `ProductName_${Math.random().toString(36).substr(2, 6)}`,
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000'
        };
      case 'barcode':
        return {
          data: '123456789',
          tag: 'Barcode',
          dataField: `Code_${Math.random().toString(36).substr(2, 6)}`,
          type: 'CODE_128',
          showText: true
        };
      case 'qrcode':
        return {
          data: 'Sample QR Data',
          tag: 'QR Code',
          dataField: `QRCode_${Math.random().toString(36).substr(2, 6)}`,
          errorCorrection: 'M'
        };
      case 'product-code':
        return {
          content: 'Product Code',
          tag: 'Product Code',
          dataField: `ProductCode_${Math.random().toString(36).substr(2, 6)}`,
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000'
        };
      case 'image':
        return {
          src: '',
          alt: 'Image',
          maintainAspectRatio: true
        };
      case 'dynamic-image':
        return {
          tag: 'Dynamic Image',
          alt: 'Dynamic Image',
          maintainAspectRatio: true
        };
      case 'rectangle':
        return {
          fill: '#f0f0f0',
          stroke: '#cccccc',
          strokeWidth: 1
        };
      case 'line':
        return {
          stroke: '#000000',
          strokeWidth: 2
        };
      default:
        return {};
    }
  };

  const getDefaultStyle = (type: string) => {
    switch (type) {
      case 'line':
        return {
          height: 2,
          width: 200
        };
      case 'rectangle':
        return {
          width: 100,
          height: 60
        };
      case 'qrcode':
        return {
          width: 80,
          height: 80
        };
      default:
        return {};
    }
  };

  // Group elements by category
  const groupedElements = ELEMENT_TYPES.reduce((acc, element) => {
    if (!acc[element.category]) {
      acc[element.category] = [];
    }
    acc[element.category].push(element);
    return acc;
  }, {} as Record<string, Array<typeof ELEMENT_TYPES[number]>>);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Elements</h2>
        <p className="text-sm text-muted-foreground">
          Drag elements to the canvas
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {Object.entries(groupedElements).map(([category, elements]) => (
          <div key={category}>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {category}
            </h3>
            
            <div className="space-y-2">
              {elements.map((element) => {
                const IconComponent = getElementIcon(element.type);
                
                return (
                  <Button
                    key={element.type}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto hover:bg-primary/5"
                    onClick={() => handleAddElement(element.type)}
                  >
                    <IconComponent className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{element.label}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {category !== Object.keys(groupedElements).pop() && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default ElementPalette;