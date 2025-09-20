import React, { useState, useRef } from 'react';
import { LayoutElement, TemplateLayout } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface TemplatePreviewCanvasProps {
  template: TemplateLayout;
  formData: Record<string, string>;
  onDataChange: (field: string, value: string) => void;
  onElementClick: (element: LayoutElement) => void;
  selectedElementId?: string;
  zoom?: number;
}

interface DynamicElementOverlayProps {
  element: LayoutElement;
  isSelected: boolean;
  onClick: () => void;
  zoom: number;
}

const DynamicElementOverlay: React.FC<DynamicElementOverlayProps> = ({
  element,
  isSelected,
  onClick,
  zoom
}) => {
  const isDynamicElement = element.type === 'dynamic-text' || 
                          element.type === 'dynamic-image' || 
                          element.type === 'barcode' || 
                          element.type === 'qrcode' ||
                          element.type === 'product-code';

  if (!isDynamicElement) return null;

  const getElementTypeLabel = () => {
    switch (element.type) {
      case 'dynamic-text':
        return 'TXT';
      case 'dynamic-image':
        return 'IMG';
      case 'barcode':
        return 'BAR';
      case 'qrcode':
        return 'QR';
      case 'product-code':
        return 'CODE';
      default:
        return 'DYN';
    }
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-auto transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-blue-500/30 border-2 border-blue-500 rounded shadow-lg' 
          : 'bg-transparent hover:bg-blue-500/10 hover:border hover:border-blue-300 rounded'
      }`}
      onClick={onClick}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex + 1000,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Element type indicator */}
      <div className={`absolute top-0 right-0 text-xs px-1 py-0.5 rounded-bl rounded-tr transition-colors ${
        isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-500 text-white hover:bg-blue-500'
      }`}>
        {getElementTypeLabel()}
      </div>
      
      {/* Click instruction */}
      {!isSelected && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            Click to edit
          </div>
        </div>
      )}
    </div>
  );
};

const TemplatePreviewCanvas: React.FC<TemplatePreviewCanvasProps> = ({
  template,
  formData,
  onDataChange,
  onElementClick,
  selectedElementId,
  zoom = 1
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const renderElement = (element: LayoutElement) => {
    switch (element.type) {
      case 'text':
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
            {element.properties.content || 'Text'}
          </div>
        );

      case 'dynamic-text':
        const dynamicTextValue = formData[element.properties?.dataField || element.id] || '';
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
              backgroundColor: dynamicTextValue ? '#f0f9ff' : '#fef3c7',
              border: `1px dashed ${dynamicTextValue ? '#0ea5e9' : '#f59e0b'}`,
            }}
          >
            {dynamicTextValue || 'Dynamic Text'}
          </div>
        );

      case 'barcode':
        const barcodeValue = formData[element.properties?.dataField || element.id] || '';
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white border border-gray-300">
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
            <div className="text-xs text-center mt-1 font-mono bg-yellow-100 px-1 rounded">
              {barcodeValue || 'Barcode Data'}
            </div>
          </div>
        );

      case 'qrcode':
        const qrValue = formData[element.properties?.dataField || element.id] || '';
        return (
          <div className="flex items-center justify-center h-full bg-white border border-gray-300">
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
            {qrValue && (
              <div className="absolute bottom-0 left-0 right-0 text-xs text-center bg-yellow-100 px-1 rounded">
                {qrValue}
              </div>
            )}
          </div>
        );

      case 'product-code':
        const productCodeValue = formData[element.properties?.dataField || element.id] || '';
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
              backgroundColor: productCodeValue ? '#f0f9ff' : '#fef3c7',
              border: `1px dashed ${productCodeValue ? '#0ea5e9' : '#f59e0b'}`,
            }}
          >
            {productCodeValue || 'Product Code'}
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
            return (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-red-300 bg-red-50 text-red-600">
                <div className="text-xs font-medium">IMAGE ERROR</div>
              </div>
            );
          }
        }
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-400 bg-gray-50 text-gray-600">
            <div className="text-xs font-medium">IMAGE</div>
          </div>
        );

      case 'dynamic-image':
        const dynamicImageValue = formData[element.id] || '';
        if (dynamicImageValue) {
          try {
            return (
              <img
                src={dynamicImageValue}
                alt="Dynamic image"
                className="w-full h-full object-contain border border-blue-200"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            );
          } catch (error) {
            return (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-red-300 bg-red-50 text-red-600">
                <div className="text-xs font-medium">IMAGE ERROR</div>
              </div>
            );
          }
        }
        return (
          <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-blue-400 bg-blue-50 text-blue-600">
            <div className="text-xs font-medium">DYNAMIC IMAGE</div>
            <div className="text-xs mt-1">Upload image</div>
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
    <div className="relative">
      <div
        ref={canvasRef}
        className="relative bg-white border border-border shadow-lg mx-auto"
        style={{
          width: `${template.width * zoom}px`,
          height: `${template.height * zoom}px`,
          backgroundColor: template.backgroundColor || '#ffffff',
        }}
      >
        {/* Render static elements */}
        {template.elements
          .filter(el => !['dynamic-text', 'dynamic-image', 'barcode', 'qrcode', 'product-code'].includes(el.type))
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.x * zoom,
                top: element.y * zoom,
                width: element.width * zoom,
                height: element.height * zoom,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {renderElement(element)}
            </div>
          ))}

        {/* Render dynamic elements */}
        {template.elements
          .filter(el => ['dynamic-text', 'dynamic-image', 'barcode', 'qrcode', 'product-code'].includes(el.type))
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.x * zoom,
                top: element.y * zoom,
                width: element.width * zoom,
                height: element.height * zoom,
                zIndex: element.zIndex,
                transform: `rotate(${element.rotation || 0}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {renderElement(element)}
            </div>
          ))}

        {/* Render interactive overlays for dynamic elements */}
        {template.elements
          .filter(el => ['dynamic-text', 'dynamic-image', 'barcode', 'qrcode', 'product-code'].includes(el.type))
          .map((element) => (
            <DynamicElementOverlay
              key={`overlay-${element.id}`}
              element={element}
              isSelected={selectedElementId === element.id}
              onClick={() => onElementClick(element)}
              zoom={zoom}
            />
          ))}
      </div>
    </div>
  );
};

export default TemplatePreviewCanvas;
