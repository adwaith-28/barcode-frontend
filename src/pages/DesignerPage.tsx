import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DesignerCanvas from '@/components/designer/DesignerCanvas';
import ElementPalette from '@/components/designer/ElementPalette';
import PropertyPanel from '@/components/designer/PropertyPanel';
import ToolbarActions from '@/components/designer/ToolbarActions';
import { useDesignerStore } from '@/stores/designerStore';
import { useTemplateStore } from '@/stores/templateStore';

const DesignerPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const { 
    currentTemplate,
    newTemplate,
    setCurrentTemplate 
  } = useDesignerStore();

  const { 
    fetchTemplate 
  } = useTemplateStore();

  useEffect(() => {
    if (isEditMode && id) {
      // Load existing template
      fetchTemplate(parseInt(id)).then((template) => {
        if (template && template.layoutJson) {
          try {
            const layout = JSON.parse(template.layoutJson);
            setCurrentTemplate(layout);
          } catch (error) {
            console.error('Failed to parse template layout:', error);
            newTemplate();
          }
        }
      });
    } else {
      // Create new template
      newTemplate();
    }
  }, [id, isEditMode, fetchTemplate, setCurrentTemplate, newTemplate]);

  return (
    <Layout showHeader={false} className="h-screen overflow-hidden">
      <div className="flex h-screen">
        {/* Left Sidebar - Element Palette */}
        <div className="w-64 bg-card border-r border-border flex-shrink-0">
          <ElementPalette />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-card border-b border-border p-4">
            <ToolbarActions templateId={id ? parseInt(id) : undefined} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-canvas-bg overflow-auto">
            <DesignerCanvas />
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-card border-l border-border flex-shrink-0">
          <PropertyPanel />
        </div>
      </div>
    </Layout>
  );
};

export default DesignerPage;