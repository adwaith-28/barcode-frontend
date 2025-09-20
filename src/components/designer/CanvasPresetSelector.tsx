import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDesignerStore } from '@/stores/designerStore';
import { CANVAS_PRESETS } from '@/types';
import { Ruler, Palette } from 'lucide-react';

const CanvasPresetSelector = () => {
  const { currentTemplate, updateTemplateSize, updateTemplateBackground } = useDesignerStore();

  const handlePresetSelect = (width: number, height: number) => {
    updateTemplateSize(width, height);
  };

  const getCurrentPreset = () => {
    if (!currentTemplate) return null;
    return CANVAS_PRESETS.find(
      preset => preset.width === currentTemplate.width && preset.height === currentTemplate.height
    );
  };

  const currentPreset = getCurrentPreset();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center">
          <Ruler className="h-4 w-4 mr-2" />
          Canvas Size
        </CardTitle>
        <CardDescription>
          Choose a preset size for your label
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Size Display */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="text-sm">
            <span className="font-medium">{currentTemplate?.width} × {currentTemplate?.height}px</span>
            {currentPreset && (
              <Badge variant="secondary" className="ml-2">
                {currentPreset.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Preset Options */}
        <div className="space-y-2">
          {CANVAS_PRESETS.map((preset) => (
            <Button
              key={`${preset.width}x${preset.height}`}
              variant={currentPreset?.name === preset.name ? "default" : "outline"}
              size="sm"
              className="w-full justify-start h-auto p-3"
              onClick={() => handlePresetSelect(preset.width, preset.height)}
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {preset.width} × {preset.height}px
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {preset.description}
                </span>
              </div>
            </Button>
          ))}
        </div>

        {/* Background Color */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">Background</span>
            <Palette className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex space-x-2">
            {['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'].map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  currentTemplate?.backgroundColor === color 
                    ? 'border-primary' 
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => updateTemplateBackground(color)}
                title={color}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasPresetSelector;
