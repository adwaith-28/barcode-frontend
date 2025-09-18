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
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
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
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStart({ x: element.x, y: element.y, width: element.width, height: element.height });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      updateElement(element.id, {
        x: Math.max(0, elementStart.x + deltaX),
        y: Math.max(0, elementStart.y + deltaY),
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      let newX = elementStart.x;
      let newY = elementStart.y;
      let newWidth = elementStart.width;
      let newHeight = elementStart.height;

      switch (resizeHandle) {
        case 'nw':
          newX = elementStart.x + deltaX;
          newY = elementStart.y + deltaY;
          newWidth = elementStart.width - deltaX;
          newHeight = elementStart.height - deltaY;
          break;
        case 'ne':
          newY = elementStart.y + deltaY;
          newWidth = elementStart.width + deltaX;
          newHeight = elementStart.height - deltaY;
          break;
        case 'sw':
          newX = elementStart.x + deltaX;
          newWidth = elementStart.width - deltaX;
          newHeight = elementStart.height + deltaY;
          break;
        case 'se':
          newWidth = elementStart.width + deltaX;
          newHeight = elementStart.height + deltaY;
          break;
        case 'n':
          newY = elementStart.y + deltaY;
          newHeight = elementStart.height - deltaY;
          break;
        case 's':
          newHeight = elementStart.height + deltaY;
          break;
        case 'w':
          newX = elementStart.x + deltaX;
          newWidth = elementStart.width - deltaX;
          break;
        case 'e':
          newWidth = elementStart.width + deltaX;
          break;
      }

      // Ensure minimum size
      newWidth = Math.max(10, newWidth);
      newHeight = Math.max(10, newHeight);
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      updateElement(element.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, elementStart, zoom, resizeHandle]);

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

      case 'product-code':
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
            {element.properties.content || 'Product Code'}
          </div>
        );

      case 'image':
        const imageSrc = element.properties.src || element.properties.imageData;
        if (imageSrc && typeof imageSrc === 'string') {
          try {
            // Handle base64 data URLs
            const src = imageSrc.includes(',') ? imageSrc : `data:image/png;base64,${imageSrc}`;
            return (
              <img
                src={src}
                alt="Uploaded image"
                className="w-full h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            );
          } catch (error) {
            console.error('Error rendering image:', error);
            return (
              <div className="flex items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
                <div className="text-xs text-gray-600">IMAGE ERROR</div>
              </div>
            );
          }
        }
        return (
          <div className="flex items-center justify-center h-full border border-dashed border-gray-400 bg-gray-50">
            <div className="text-xs text-gray-600">IMAGE</div>
          </div>
        );

      case 'dynamic-image':
        return (
          <div className="flex items-center justify-center h-full border border-dashed border-blue-400 bg-blue-50">
            <div className="text-xs text-blue-600">DYNAMIC IMAGE</div>
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
          <div 
            className="absolute -top-1 -left-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-nw-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div 
            className="absolute -top-1 -right-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-ne-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div 
            className="absolute -bottom-1 -left-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-sw-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div 
            className="absolute -bottom-1 -right-1 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-se-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          
          {/* Edge handles */}
          <div 
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-n-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div 
            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-s-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div 
            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-w-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div 
            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-e-resize" 
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );
};

export default CanvasElement;