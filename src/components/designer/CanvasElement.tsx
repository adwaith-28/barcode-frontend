import React, { useState } from 'react';
import { LayoutElement } from '@/types';
import { useDesignerStore } from '@/stores/designerStore';

interface CanvasElementProps {
  element: LayoutElement;
  isSelected: boolean;
  onSelect: () => void;
  zoom: number;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  zoom
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
  
  const { updateElement } = useDesignerStore();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    
    if (e.detail === 2) {
      // Double click - could open edit mode
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.x, y: element.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    updateElement(element.id, {
      x: Math.max(0, elementStart.x + deltaX),
      y: Math.max(0, elementStart.y + deltaY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, elementStart, zoom]);

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: `${element.properties.fontSize}px`,
              fontFamily: element.properties.fontFamily,
              fontWeight: element.properties.fontWeight,
              textAlign: element.properties.textAlign,
              color: element.properties.color,
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
            }}
          >
            {element.properties.content || 'Text'}
          </div>
        );

      case 'barcode':
        return (
          <div className="flex flex-col items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
            <div className="text-xs text-gray-600 mb-1">BARCODE</div>
            <div className="font-mono text-xs">{element.properties.data || '123456789'}</div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="flex items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
            <div className="text-xs text-gray-600">QR</div>
          </div>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
            <div className="text-xs text-gray-600">IMAGE</div>
          </div>
        );

      case 'rectangle':
        return (
          <div
            style={{
              backgroundColor: element.properties.fill,
              border: `${element.properties.strokeWidth || 1}px solid ${element.properties.stroke || '#ccc'}`,
              width: '100%',
              height: '100%',
            }}
          />
        );

      case 'line':
        return (
          <div
            style={{
              backgroundColor: element.properties.stroke,
              height: `${element.properties.strokeWidth}px`,
              width: '100%',
            }}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
            <div className="text-xs text-gray-600">ELEMENT</div>
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute cursor-move select-none ${
        isSelected ? 'ring-2 ring-canvas-selection' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      
      {/* Selection Handles */}
      {isSelected && (
        <>
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-se-resize" />
          
          {/* Edge handles */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-n-resize" />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-s-resize" />
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-w-resize" />
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-e-resize" />
        </>
      )}
    </div>
  );
};

export default CanvasElement;