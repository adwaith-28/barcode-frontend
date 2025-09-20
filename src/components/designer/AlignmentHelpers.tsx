import React from 'react';
import { LayoutElement } from '@/types';

interface AlignmentHelpersProps {
  selectedElement: LayoutElement | null;
  allElements: LayoutElement[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

const AlignmentHelpers: React.FC<AlignmentHelpersProps> = ({
  selectedElement,
  allElements,
  canvasWidth,
  canvasHeight,
  zoom
}) => {
  if (!selectedElement) return null;

  const getAlignmentLines = () => {
    const lines: Array<{
      type: 'vertical' | 'horizontal';
      position: number;
      color: string;
      label?: string;
    }> = [];

    const selectedCenterX = selectedElement.x + selectedElement.width / 2;
    const selectedCenterY = selectedElement.y + selectedElement.height / 2;
    const selectedLeft = selectedElement.x;
    const selectedRight = selectedElement.x + selectedElement.width;
    const selectedTop = selectedElement.y;
    const selectedBottom = selectedElement.y + selectedElement.height;

    // Canvas center lines
    lines.push({
      type: 'vertical',
      position: canvasWidth / 2,
      color: '#3b82f6',
      label: 'Canvas Center'
    });
    lines.push({
      type: 'horizontal',
      position: canvasHeight / 2,
      color: '#3b82f6',
      label: 'Canvas Center'
    });

    // Check alignment with other elements
    allElements.forEach(element => {
      if (element.id === selectedElement.id) return;

      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;
      const elementLeft = element.x;
      const elementRight = element.x + element.width;
      const elementTop = element.y;
      const elementBottom = element.y + element.height;

      // Center alignment
      if (Math.abs(selectedCenterX - elementCenterX) < 5) {
        lines.push({
          type: 'vertical',
          position: elementCenterX,
          color: '#10b981'
        });
      }
      if (Math.abs(selectedCenterY - elementCenterY) < 5) {
        lines.push({
          type: 'horizontal',
          position: elementCenterY,
          color: '#10b981'
        });
      }

      // Edge alignment
      if (Math.abs(selectedLeft - elementLeft) < 5) {
        lines.push({
          type: 'vertical',
          position: elementLeft,
          color: '#f59e0b'
        });
      }
      if (Math.abs(selectedRight - elementRight) < 5) {
        lines.push({
          type: 'vertical',
          position: elementRight,
          color: '#f59e0b'
        });
      }
      if (Math.abs(selectedTop - elementTop) < 5) {
        lines.push({
          type: 'horizontal',
          position: elementTop,
          color: '#f59e0b'
        });
      }
      if (Math.abs(selectedBottom - elementBottom) < 5) {
        lines.push({
          type: 'horizontal',
          position: elementBottom,
          color: '#f59e0b'
        });
      }

      // Cross alignment (selected edge to other center)
      if (Math.abs(selectedLeft - elementCenterX) < 5) {
        lines.push({
          type: 'vertical',
          position: elementCenterX,
          color: '#8b5cf6'
        });
      }
      if (Math.abs(selectedRight - elementCenterX) < 5) {
        lines.push({
          type: 'vertical',
          position: elementCenterX,
          color: '#8b5cf6'
        });
      }
      if (Math.abs(selectedTop - elementCenterY) < 5) {
        lines.push({
          type: 'horizontal',
          position: elementCenterY,
          color: '#8b5cf6'
        });
      }
      if (Math.abs(selectedBottom - elementCenterY) < 5) {
        lines.push({
          type: 'horizontal',
          position: elementCenterY,
          color: '#8b5cf6'
        });
      }
    });

    return lines;
  };

  const alignmentLines = getAlignmentLines();

  return (
    <>
      {alignmentLines.map((line, index) => (
        <div
          key={index}
          className="absolute pointer-events-none z-50"
          style={{
            [line.type === 'vertical' ? 'left' : 'top']: line.position * zoom,
            [line.type === 'vertical' ? 'width' : 'height']: '1px',
            [line.type === 'vertical' ? 'height' : 'width']: line.type === 'vertical' 
              ? `${canvasHeight * zoom}px` 
              : `${canvasWidth * zoom}px`,
            backgroundColor: line.color,
            boxShadow: `0 0 4px ${line.color}40`,
          }}
        >
          {line.label && (
            <div
              className="absolute bg-white text-xs px-1 py-0.5 rounded shadow-sm"
              style={{
                [line.type === 'vertical' ? 'top' : 'left']: '4px',
                [line.type === 'vertical' ? 'left' : 'top']: '4px',
                color: line.color,
                fontSize: '10px',
                fontWeight: '500',
              }}
            >
              {line.label}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default AlignmentHelpers;
