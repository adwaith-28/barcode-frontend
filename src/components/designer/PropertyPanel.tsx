import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDesignerStore } from '@/stores/designerStore';
import { DATA_FIELDS } from '@/types';
import { Settings, Layers, Type, Palette } from 'lucide-react';

const PropertyPanel = () => {
  const {
    updateTemplateSize,
    updateTemplateBackground,
    currentTemplate,
    selectedElements,
    updateElement,
    bringToFront,
    sendToBack,
    deleteSelectedElements
  } = useDesignerStore();

  if (!currentTemplate) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No template loaded</p>
        </div>
      </div>
    );
  }

  const selectedElement = selectedElements.length === 1 
    ? currentTemplate.elements.find(el => el.id === selectedElements[0])
    : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedElement) {
      updateElement(selectedElement.id, {
        properties: {
          ...selectedElement.properties,
          [property]: value
        }
      });
    }
  };

  const handlePositionChange = (property: string, value: number) => {
    if (selectedElement) {
      updateElement(selectedElement.id, { [property]: value });
    }
  };

  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <div className="text-center text-muted-foreground p-4">
          <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select an element to edit its properties</p>
        </div>
      );
    }

    const commonProperties = (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="x" className="text-xs">X Position</Label>
            <Input
              id="x"
              type="number"
              value={selectedElement.x}
              onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="y" className="text-xs">Y Position</Label>
            <Input
              id="y"
              type="number"
              value={selectedElement.y}
              onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width" className="text-xs">Width</Label>
            <Input
              id="width"
              type="number"
              value={selectedElement.width}
              onChange={(e) => handlePositionChange('width', parseInt(e.target.value) || 0)}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">Height</Label>
            <Input
              id="height"
              type="number"
              value={selectedElement.height}
              onChange={(e) => handlePositionChange('height', parseInt(e.target.value) || 0)}
              className="h-8"
            />
          </div>
        </div>
      </div>
    );

    switch (selectedElement.type) {
      case 'text':
        return (
          <div className="space-y-4">
            {/* <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Product Name"
                className="h-8"
              />
            </div> */}

            <div>
              <Label htmlFor="content" className="text-xs">Text Content</Label>
              <Input
                id="content"
                value={selectedElement.properties.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={selectedElement.properties.fontSize || 14}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 14)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="fontWeight" className="text-xs">Weight</Label>
                <Select
                  value={selectedElement.properties.fontWeight || 'normal'}
                  onValueChange={(value) => handlePropertyChange('fontWeight', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="textAlign" className="text-xs">Text Align</Label>
              <Select
                value={selectedElement.properties.textAlign || 'left'}
                onValueChange={(value) => handlePropertyChange('textAlign', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color" className="text-xs">Color</Label>
              <Input
                id="color"
                type="color"
                value={selectedElement.properties.color || '#000000'}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                className="h-8"
              />
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      case 'dynamic-text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Dynamic Text 1"
                className="h-8"
              />
            </div>

            {/* <div>
              <Label htmlFor="dataField" className="text-xs">Data Field Key</Label>
              <Input
                id="dataField"
                value={selectedElement.properties.dataField || ''}
                onChange={(e) => handlePropertyChange('dataField', e.target.value)}
                placeholder="e.g., DynamicText_ABC123"
                className="h-8"
              />
            </div> */}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={selectedElement.properties.fontSize || 14}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value) || 14)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="fontWeight" className="text-xs">Weight</Label>
                <Select
                  value={selectedElement.properties.fontWeight || 'normal'}
                  onValueChange={(value) => handlePropertyChange('fontWeight', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="textAlign" className="text-xs">Text Align</Label>
              <Select
                value={selectedElement.properties.textAlign || 'left'}
                onValueChange={(value) => handlePropertyChange('textAlign', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color" className="text-xs">Color</Label>
              <Input
                id="color"
                type="color"
                value={selectedElement.properties.color || '#000000'}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                className="h-8"
              />
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      case 'barcode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Product One Barcode"
                className="h-8"
              />
            </div>

            {/* <div>
              <Label htmlFor="data" className="text-xs">Barcode Data</Label>
              <Input
                id="data"
                value={selectedElement.properties.data || ''}
                onChange={(e) => handlePropertyChange('data', e.target.value)}
                className="h-8"
              />
            </div> */}

            {/* <div>
              <Label htmlFor="dataField" className="text-xs">Data Source</Label>
              <Select
                value={selectedElement.properties.dataField || ''}
                onValueChange={(value) => handlePropertyChange('dataField', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div>
              <Label htmlFor="barcodeType" className="text-xs">Barcode Type</Label>
              <Select
                value={selectedElement.properties.type || 'CODE_128'}
                onValueChange={(value) => handlePropertyChange('type', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CODE_128">CODE 128</SelectItem>
                  <SelectItem value="CODE_39">CODE 39</SelectItem>
                  <SelectItem value="EAN_13">EAN 13</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      case 'qrcode':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Product One QR Code"
                className="h-8"
              />
            </div>

            {/* <div>
              <Label htmlFor="data" className="text-xs">QR Code Data</Label>
              <Input
                id="data"
                value={selectedElement.properties.data || ''}
                onChange={(e) => handlePropertyChange('data', e.target.value)}
                className="h-8"
              />
            </div> */}

            {/* <div>
              <Label htmlFor="dataField" className="text-xs">Data Source</Label>
              <Select
                value={selectedElement.properties.dataField || ''}
                onValueChange={(value) => handlePropertyChange('dataField', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div>
              <Label htmlFor="errorCorrection" className="text-xs">Error Correction</Label>
              <Select
                value={selectedElement.properties.errorCorrection || 'M'}
                onValueChange={(value) => handlePropertyChange('errorCorrection', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L (Low)</SelectItem>
                  <SelectItem value="M">M (Medium)</SelectItem>
                  <SelectItem value="Q">Q (Quartile)</SelectItem>
                  <SelectItem value="H">H (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      case 'product-code':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Product One Code"
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-xs">Product Code Text</Label>
              <Input
                id="content"
                value={selectedElement.properties.content || ''}
                onChange={(e) => handlePropertyChange('content', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="dataField" className="text-xs">Data Source</Label>
              <Select
                value={selectedElement.properties.dataField || ''}
                onValueChange={(value) => handlePropertyChange('dataField', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="src" className="text-xs">Upload Image</Label>
              <Input
                id="src"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handlePropertyChange('src', reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="h-8"
              />
            </div>

            {/* <div>
              <Label htmlFor="alt" className="text-xs">Alt Text</Label>
              <Input
                id="alt"
                value={selectedElement.properties.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                className="h-8"
              />
            </div> */}

            <Separator />
            {commonProperties}
          </div>
        );

      case 'dynamic-image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag" className="text-xs">Element Tag</Label>
              <Input
                id="tag"
                value={selectedElement.properties.tag || ''}
                onChange={(e) => handlePropertyChange('tag', e.target.value)}
                placeholder="e.g., Product Image"
                className="h-8"
              />
            </div>

            {/* <div>
              <Label htmlFor="alt" className="text-xs">Alt Text</Label>
              <Input
                id="alt"
                value={selectedElement.properties.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                className="h-8"
              />
            </div> */}

            <Separator />
            {commonProperties}
          </div>
        );

case 'logo':
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="src" className="text-xs">Upload Logo</Label>
        <Input
          id="src"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                handlePropertyChange('src', reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
          className="h-8"
        />
      </div>

      <div>
        <Label htmlFor="alt" className="text-xs">Alt Text</Label>
        <Input
          id="alt"
          value={selectedElement.properties.alt || ''}
          onChange={(e) => handlePropertyChange('alt', e.target.value)}
          className="h-8"
        />
      </div>

      <Separator />
      {commonProperties}
    </div>
  );



      case 'rectangle':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fill" className="text-xs">Fill Color</Label>
              <Input
                id="fill"
                type="color"
                value={selectedElement.properties.fill || '#f0f0f0'}
                onChange={(e) => handlePropertyChange('fill', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="stroke" className="text-xs">Border Color</Label>
              <Input
                id="stroke"
                type="color"
                value={selectedElement.properties.stroke || '#cccccc'}
                onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="strokeWidth" className="text-xs">Border Width</Label>
              <Input
                id="strokeWidth"
                type="number"
                value={selectedElement.properties.strokeWidth || 1}
                onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value) || 1)}
                className="h-8"
              />
            </div>

            <Separator />
            {commonProperties}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Properties for {selectedElement.type} elements
            </p>
            <Separator />
            {commonProperties}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Properties</h2>
        <p className="text-sm text-muted-foreground">
          {selectedElements.length === 0 
            ? 'No elements selected'
            : selectedElements.length === 1 
            ? 'Edit element properties'
            : `${selectedElements.length} elements selected`
          }
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {selectedElements.length === 1 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Element Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {renderElementProperties()}
            </CardContent>
          </Card>
        )}

        {selectedElements.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Layers className="h-4 w-4 mr-2" />
                Layer Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedElements.forEach(id => bringToFront(id))}
                >
                  Bring Forward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedElements.forEach(id => sendToBack(id))}
                >
                  Send Back
                </Button>
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={deleteSelectedElements}
              >
                Delete Selected
              </Button>
            </CardContent>
          </Card>
        )}

{/* Template Settings */}
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm flex items-center">
      <Palette className="h-4 w-4 mr-2" />
      Template Settings
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-0 space-y-4">
    <div>
      <Label htmlFor="bgColor" className="text-xs">Background Color</Label>
      <Input
        id="bgColor"
        type="color"
        value={currentTemplate.backgroundColor || '#ffffff'}
        onChange={(e) => {
          updateTemplateBackground(e.target.value);
        }}
        className="h-8"
      />
    </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="canvasWidth" className="text-xs">Canvas Width</Label>
          <Input
            id="canvasWidth"
            type="number"
            value={currentTemplate.width}
            className="h-8"
            onChange={(e) => {
              const newWidth = parseInt(e.target.value) || 400;
              updateTemplateSize(newWidth, currentTemplate.height);
            }}
          />
        </div>
        <div>
          <Label htmlFor="canvasHeight" className="text-xs">Canvas Height</Label>
          <Input
            id="canvasHeight"
            type="number"
            value={currentTemplate.height}
            className="h-8"
            onChange={(e) => {
              const newHeight = parseInt(e.target.value) || 300;
              updateTemplateSize(currentTemplate.width, newHeight);
            }}
          />
        </div>
      </div>
    </CardContent>
  </Card>

      </div>
    </div>
  );
};

export default PropertyPanel;