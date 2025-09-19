import React, { useRef, useEffect, useState } from 'react';
import { useDesignerStore } from '@/stores/designerStore';
import CanvasElement from './CanvasElement';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Grid3X3, Move } from 'lucide-react';

const DesignerCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const {
    currentTemplate,
    selectedElements,
    canvasSettings,
    selectElement,
    clearSelection,
    updateCanvasSettings,
    selectElementsInArea
  } = useDesignerStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  const handleZoomIn = () => {
    updateCanvasSettings({ 
      zoom: Math.min(canvasSettings.zoom + 0.25, 4) 
    });
  };

  const handleZoomOut = () => {
    updateCanvasSettings({ 
      zoom: Math.max(canvasSettings.zoom - 0.25, 0.25) 
    });
  };

  const toggleGrid = () => {
    updateCanvasSettings({ 
      showGrid: !canvasSettings.showGrid 
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && e.target === e.currentTarget) {
      // This would be used for selection rectangle
      // Implementation would go here for area selection
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);
      // Complete area selection if needed
    }
  };

  if (!currentTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas-bg">
        <div className="text-center text-muted-foreground">
          <Move className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Welcome to SOTI Trace</h3>
          <p>Start by adding elements from the palette on the left</p>
        </div>
      </div>
    );
  }

  const canvasStyle = {
    width: `${currentTemplate.width}px`,
    height: `${currentTemplate.height}px`,
    transform: `scale(${canvasSettings.zoom})`,
    transformOrigin: 'top left',
  };

  const gridStyle = canvasSettings.showGrid ? {
    backgroundImage: `
      linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${canvasSettings.gridSize}px ${canvasSettings.gridSize}px`,
  } : {};

  return (
    <div className="flex-1 relative">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <div className="flex items-center bg-card border border-border rounded-md shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={canvasSettings.zoom <= 0.25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="px-3 py-2 text-sm font-medium border-x border-border">
            {Math.round(canvasSettings.zoom * 100)}%
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={canvasSettings.zoom >= 4}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant={canvasSettings.showGrid ? "default" : "outline"}
          size="sm"
          onClick={toggleGrid}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas Container */}
      <div 
        className="w-full h-full overflow-auto p-8"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Rulers */}
        <div className="flex">
          {/* Top Ruler */}
          <div className="w-8 h-8 bg-card border-r border-b border-border" />
          <div 
            className="h-8 bg-card border-b border-border flex relative"
            style={{ width: `${currentTemplate.width * canvasSettings.zoom}px` }}
          >
            {/* Ruler markings would go here */}
            {Array.from({ length: Math.floor(currentTemplate.width / 50) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute border-l border-border/50 h-full"
                style={{ left: `${i * 50 * canvasSettings.zoom}px` }}
              >
                <span className="text-xs text-muted-foreground ml-1">
                  {i * 50}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Left Ruler */}
          <div 
            className="w-8 bg-card border-r border-border flex flex-col relative"
            style={{ height: `${currentTemplate.height * canvasSettings.zoom}px` }}
          >
            {/* Ruler markings would go here */}
            {Array.from({ length: Math.floor(currentTemplate.height / 50) + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute border-t border-border/50 w-full"
                style={{ top: `${i * 50 * canvasSettings.zoom}px` }}
              >
                <span className="text-xs text-muted-foreground writing-mode-vertical">
                  {i * 50}
                </span>
              </div>
            ))}
          </div>

          {/* Main Canvas */}
          <div
            ref={canvasRef}
            className="relative bg-white border border-border shadow-lg"
            style={{
              ...canvasStyle,
              ...gridStyle,
              backgroundColor: currentTemplate.backgroundColor || '#ffffff',
            }}
          >
            {/* Render Elements */}
            {currentTemplate.elements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={selectedElements.includes(element.id)}
                onSelect={() => selectElement(element.id)}
                zoom={canvasSettings.zoom}
              />
            ))}

            {/* Selection Rectangle (for area selection) */}
            {isDragging && (
              <div className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignerCanvas;