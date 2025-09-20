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
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [rotationStart, setRotationStart] = useState(0);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  
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

  const handleRotationMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    
    // Get the element's center position on screen
    const elementRect = e.currentTarget.getBoundingClientRect();
    const elementCenterX = elementRect.left + elementRect.width / 2;
    const elementCenterY = elementRect.top + elementRect.height / 2;
    
    setDragStart({ x: elementCenterX, y: elementCenterY });
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setRotationStart(element.rotation || 0);
  };

  const getMinimumSize = (elementType: string) => {
    switch (elementType) {
      case 'text':
      case 'dynamic-text':
        return { width: 20, height: 15 };
      case 'product-code':
        return { width: 30, height: 12 };
      case 'barcode':
        return { width: 80, height: 30 };
      case 'qrcode':
        return { width: 30, height: 30 };
      case 'image':
      case 'dynamic-image':
      case 'logo':
        return { width: 20, height: 20 };
      case 'rectangle':
        return { width: 10, height: 10 };
      case 'line':
        return { width: 20, height: 1 };
      default:
        return { width: 10, height: 10 };
    }
  };

  const snapToGrid = (value: number, gridSize: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      let newX = Math.max(0, elementStart.x + deltaX);
      let newY = Math.max(0, elementStart.y + deltaY);

      // Apply snap to grid if enabled
      const { canvasSettings } = useDesignerStore.getState();
      if (canvasSettings.snapToGrid) {
        newX = snapToGrid(newX, canvasSettings.gridSize);
        newY = snapToGrid(newY, canvasSettings.gridSize);
      }

      updateElement(element.id, {
        x: newX,
        y: newY,
      });
    } else if (isRotating) {
      // Get element center position
      const elementCenterX = dragStart.x;
      const elementCenterY = dragStart.y;
      
      // Calculate angles from element center to initial and current mouse positions
      const initialAngle = Math.atan2(initialMousePos.y - elementCenterY, initialMousePos.x - elementCenterX);
      const currentAngle = Math.atan2(e.clientY - elementCenterY, e.clientX - elementCenterX);
      
      // Calculate the angle difference
      let angleDiff = currentAngle - initialAngle;
      
      // Convert to degrees
      angleDiff = angleDiff * (180 / Math.PI);
      
      // Apply the rotation difference to the starting rotation
      const newRotation = rotationStart + angleDiff;
      
      // Optional: Snap to 15-degree increments if Shift is held
      let finalRotation = newRotation;
      if (e.shiftKey) {
        finalRotation = Math.round(newRotation / 15) * 15;
      }
      
      // Normalize to 0-360 range
      let normalizedRotation = finalRotation % 360;
      if (normalizedRotation < 0) normalizedRotation += 360;
      
      updateElement(element.id, {
        rotation: normalizedRotation,
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      const minSize = getMinimumSize(element.type);

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

      // Apply minimum size constraints
      newWidth = Math.max(minSize.width, newWidth);
      newHeight = Math.max(minSize.height, newHeight);
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);

      // For QR codes, maintain square aspect ratio
      if (element.type === 'qrcode') {
        const size = Math.max(newWidth, newHeight);
        newWidth = size;
        newHeight = size;
      }

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
    setIsRotating(false);
    setResizeHandle(null);
  };

  React.useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, dragStart, elementStart, zoom, resizeHandle, rotationStart, initialMousePos]);

  const renderElement = () => {
    switch (element.type) {
      case 'text':
      case 'dynamic-text':
      case 'product-code':
        return (
          <div
            style={{
              fontSize: `${element.properties.fontSize || 14}px`,
              fontFamily: element.properties.fontFamily || 'Inter',
              fontWeight: element.properties.fontWeight || 'normal',
              textAlign: element.properties.textAlign || 'left',
              color: element.properties.color || '#000000',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              padding: '2px 4px',
            }}
          >
            {element.properties.content || (element.type === 'dynamic-text' ? 'Dynamic Text' : element.type === 'product-code' ? 'Product Code' : 'Text')}
          </div>
        );

      case 'barcode':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white border border-gray-300">
            {/* Barcode visual representation */}
            <div className="flex items-end justify-center flex-1 px-2">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="bg-black mx-px"
                  style={{
                    width: Math.random() > 0.5 ? '2px' : '1px',
                    height: `${60 + Math.random() * 20}%`,
                  }}
                />
              ))}
            </div>
            {element.properties.showText !== false && (
              <div className="text-xs text-center mt-1 font-mono">
                {element.properties.data || '123456789'}
              </div>
            )}
          </div>
        );

      case 'qrcode':
        return (
          <div className="flex items-center justify-center h-full bg-white border border-gray-300">
            {/* QR Code visual representation */}
            <div 
              className="grid bg-white p-1"
              style={{
                gridTemplateColumns: 'repeat(8, 1fr)',
                gridTemplateRows: 'repeat(8, 1fr)',
                width: '90%',
                height: '90%',
              }}
            >
              {Array.from({ length: 64 }, (_, i) => (
                <div
                  key={i}
                  className={Math.random() > 0.5 ? 'bg-black' : 'bg-white'}
                  style={{ aspectRatio: '1' }}
                />
              ))}
            </div>
          </div>
        );

      case 'image':
        const imageSrc = element.properties.src || element.properties.imageData;
        if (imageSrc && typeof imageSrc === 'string' && imageSrc.trim() !== '') {
          try {
            const src = imageSrc.includes(',') ? imageSrc : `data:image/png;base64,${imageSrc}`;
            return (
              <img
                src={src}
                alt="Uploaded image"
                className="w-full h-full object-contain border border-gray-200"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            );
          } catch (error) {
            console.error('Error rendering image:', error);
            return (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-red-300 bg-red-50 text-red-600">
                <div className="text-xs font-medium">IMAGE ERROR</div>
                <div className="text-xs mt-1">Invalid format</div>
              </div>
            );
          }
        }
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-orange-400 bg-orange-50 text-orange-600">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <div className="text-xs font-medium">IMAGE REQUIRED</div>
            <div className="text-xs mt-1">Upload image to save</div>
          </div>
        );

      case 'dynamic-image':
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <div className="text-xs font-medium">DYNAMIC IMAGE</div>
            <div className="text-xs mt-1">From data source</div>
          </div>
        );

      case 'logo':
        const logoSrc = element.properties.src || element.properties.imageData;
        if (logoSrc && typeof logoSrc === 'string') {
          try {
            const src = logoSrc.includes(',') ? logoSrc : `data:image/png;base64,${logoSrc}`;
            return (
              <img
                src={src}
                alt="Logo"
                className="w-full h-full object-contain border border-gray-200"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            );
          } catch (error) {
            return (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-purple-300 bg-purple-50 text-purple-600">
                <div className="text-xs font-medium">LOGO ERROR</div>
                <div className="text-xs mt-1">Invalid format</div>
              </div>
            );
          }
        }
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-purple-400 bg-purple-50 text-purple-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <div className="text-xs font-medium">LOGO</div>
          </div>
        );

      case 'rectangle':
        return (
          <div
            style={{
              backgroundColor: element.properties.fill || '#f0f0f0',
              border: `${element.properties.strokeWidth || 1}px solid ${element.properties.stroke || '#cccccc'}`,
              width: '100%',
              height: '100%',
            }}
          />
        );

      case 'line':
        return (
          <div
            style={{
              backgroundColor: element.properties.stroke || '#000000',
              height: `${element.properties.strokeWidth || 2}px`,
              width: '100%',
              alignSelf: 'center',
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
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center center',
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
          
          {/* Edge handles - only show if element is large enough */}
          {element.width > 40 && (
            <>
              <div 
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-n-resize" 
                onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
              />
              <div 
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-canvas-handle border border-white rounded-sm cursor-s-resize" 
                onMouseDown={(e) => handleResizeMouseDown(e, 's')}
              />
            </>
          )}
          {element.height > 40 && (
            <>
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
          
          {/* Rotation handle */}
          <div 
            className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 border border-white rounded-full cursor-grab flex items-center justify-center transition-all duration-150 ${
              isRotating 
                ? 'bg-blue-500 scale-110 shadow-lg' 
                : 'bg-canvas-handle hover:bg-blue-400 hover:scale-105'
            }`}
            onMouseDown={handleRotationMouseDown}
            style={{ cursor: isRotating ? 'grabbing' : 'grab' }}
            title="Hold and drag to rotate (Hold Shift for snap-to-grid)"
          >
            <svg 
              className={`w-2 h-2 text-white transition-transform duration-150 ${
                isRotating ? 'animate-spin' : ''
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasElement;