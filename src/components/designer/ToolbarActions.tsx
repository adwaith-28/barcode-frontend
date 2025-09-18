import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDesignerStore } from '@/stores/designerStore';
import { useTemplateStore } from '@/stores/templateStore';
import { useToast } from '@/hooks/use-toast';
import { TEMPLATE_CATEGORIES } from '@/types';
import { 
  ArrowLeft, 
  Save, 
  Undo, 
  Redo, 
  Copy,
  Trash2,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';

// Props to accept templateId for edit mode
interface ToolbarActionsProps {
  templateId?: number;
}

const ToolbarActions: React.FC<ToolbarActionsProps> = ({ templateId }) => {
  const { toast } = useToast();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateInfo, setTemplateInfo] = useState({
    name: '',
    description: '',
    category: 'Custom' as string,
    isPublic: false
  });

  const {
    currentTemplate,
    selectedElements,
    canvasSettings,
    isDirty,
    undo,
    redo,
    history,
    historyIndex,
    duplicateElement,
    deleteSelectedElements,
    updateCanvasSettings
  } = useDesignerStore();

  const { 
    createTemplate, 
    updateTemplate,
    currentTemplate: currentTemplateFromStore,
    fetchTemplate 
  } = useTemplateStore();

  // Extract required fields from template elements
  const extractRequiredFields = (template: any) => {
    const fields = new Set<string>();
    
    template.elements.forEach((element: any) => {
      if (element.properties?.dataField) {
        fields.add(element.properties.dataField);
      }
    });
    
    return Array.from(fields);
  };

  // Save or update template
  const handleSave = async () => {
    if (!currentTemplate) return;

    if (!templateInfo.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your template.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        name: templateInfo.name.trim(),
        description: templateInfo.description.trim() || 'Created with CloudLabel Designer',
        layoutJson: JSON.stringify(currentTemplate),
        width: currentTemplate.width,
        height: currentTemplate.height,
        requiredFields: extractRequiredFields(currentTemplate),
        category: templateInfo.category,
        isPublic: templateInfo.isPublic,
        previewImage: '/api/placeholder/300/200',
      };

      if (templateId) {
        // Update existing template
        await updateTemplate(templateId, templateData);
        toast({
          title: "Template updated",
          description: "Your template has been updated successfully."
        });
      } else {
        // Create new template
        await createTemplate(templateData);
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully."
        });
      }

      setIsSaveDialogOpen(false);
      setTemplateInfo({
        name: '',
        description: '',
        category: 'Custom',
        isPublic: false
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Prefill template info when editing
  useEffect(() => {
    if (templateId && currentTemplateFromStore) {
      setTemplateInfo({
        name: currentTemplateFromStore.name,
        description: currentTemplateFromStore.description || '',
        category: currentTemplateFromStore.category || 'Custom',
        isPublic: currentTemplateFromStore.isPublic || false
      });
    }
  }, [templateId, currentTemplateFromStore]);

  // Fetch template if editing
  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId, fetchTemplate]);

  const handleZoomChange = (zoom: number) => {
    updateCanvasSettings({ zoom: Math.max(0.25, Math.min(4, zoom)) });
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex items-center justify-between w-full">
      {/* Left Section - Navigation */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/templates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="text-sm">
          <div className="font-medium">
            {templateInfo.name || 'Untitled Template'}
          </div>
          <div className="text-muted-foreground text-xs">
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </div>
        </div>
      </div>

      {/* Center Section - Main Actions */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {selectedElements.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedElements.forEach(id => duplicateElement(id))}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteSelectedElements}
              title="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoomChange(canvasSettings.zoom - 0.25)}
          disabled={canvasSettings.zoom <= 0.25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(canvasSettings.zoom * 100)}%
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleZoomChange(canvasSettings.zoom + 0.25)}
          disabled={canvasSettings.zoom >= 4}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant={canvasSettings.showGrid ? "secondary" : "ghost"}
          size="sm"
          onClick={() => updateCanvasSettings({ showGrid: !canvasSettings.showGrid })}
          title="Toggle Grid"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Save */}
      <div className="flex items-center space-x-2">
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              disabled={!currentTemplate}
              className="bg-gradient-primary hover:opacity-90 border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {templateId ? "Update Template" : "Save Template"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{templateId ? "Update Template" : "Save Template"}</DialogTitle>
              <DialogDescription>
                Give your template a name and description so you can find it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={templateInfo.name}
                  onChange={(e) => setTemplateInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  placeholder="Describe what this template is used for (optional)"
                  value={templateInfo.description}
                  onChange={(e) => setTemplateInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select 
                  value={templateInfo.category} 
                  onValueChange={(value) => setTemplateInfo(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.filter(cat => cat !== 'All').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-public"
                  checked={templateInfo.isPublic}
                  onChange={(e) => setTemplateInfo(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="template-public" className="text-sm">
                  Make this template public for others to use
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSaveDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isSaving || !templateInfo.name.trim()}
                className="bg-gradient-primary hover:opacity-90 border-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {templateId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {templateId ? "Update Template" : "Save Template"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ToolbarActions;
