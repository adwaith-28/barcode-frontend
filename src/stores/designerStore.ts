import { create } from 'zustand';
import { TemplateLayout, LayoutElement, CanvasSettings } from '../types';

interface DesignerStore {
  // Current template being edited
  currentTemplate: TemplateLayout | null;
  selectedElements: string[];
  canvasSettings: CanvasSettings;
  isLoading: boolean;
  isDirty: boolean; // Track if template has unsaved changes
  updateTemplateSize: (width: number, height: number) => void;
  updateTemplateBackground: (backgroundColor: string) => void;


  // Canvas actions
  setCurrentTemplate: (template: TemplateLayout | null) => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;

  // Element actions
  addElement: (element: LayoutElement) => void;
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  duplicateElement: (id: string) => void;

  // Selection actions
  selectElement: (id: string, multiSelect?: boolean) => void;
  selectAllElements: () => void;
  clearSelection: () => void;
  selectElementsInArea: (startX: number, startY: number, endX: number, endY: number) => void;

  // Layer actions
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // History actions (for undo/redo)
  history: TemplateLayout[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Template actions
  newTemplate: (width?: number, height?: number) => void;
  resetTemplate: () => void;
  setIsDirty: (dirty: boolean) => void;
}

const createDefaultCanvasSettings = (): CanvasSettings => ({
  width: 400,
  height: 300,
  zoom: 1,
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
});

const createDefaultTemplate = (width = 400, height = 300): TemplateLayout => ({
  width,
  height,
  backgroundColor: '#ffffff',
  elements: [],
  settings: {},
});

const generateId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useDesignerStore = create<DesignerStore>((set, get) => ({
  // Initial state
  currentTemplate: null,
  selectedElements: [],
  canvasSettings: createDefaultCanvasSettings(),
  isLoading: false,
  isDirty: false,
  history: [],
  historyIndex: -1,

  // Canvas actions
  setCurrentTemplate: (template) => {
    set({ 
      currentTemplate: template,
      selectedElements: [],
      isDirty: false,
      history: template ? [template] : [],
      historyIndex: template ? 0 : -1,
    });
  },

  updateCanvasSettings: (settings) => {
    set((state) => ({
      canvasSettings: { ...state.canvasSettings, ...settings }
    }));
  },

  // Element actions
  addElement: (element) => {
    const state = get();
    if (!state.currentTemplate) return;

    const newElement = { ...element, id: generateId() };
    const updatedTemplate = {
      ...state.currentTemplate,
      elements: [...state.currentTemplate.elements, newElement]
    };

    set({
      currentTemplate: updatedTemplate,
      selectedElements: [newElement.id],
      isDirty: true,
    });

    get().saveToHistory();
  },

  updateElement: (id, updates) => {
    const state = get();
    if (!state.currentTemplate) return;

    const updatedElements = state.currentTemplate.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );

    set({
      currentTemplate: {
        ...state.currentTemplate,
        elements: updatedElements
      },
      isDirty: true,
    });

    get().saveToHistory();
  },

  deleteElement: (id) => {
    const state = get();
    if (!state.currentTemplate) return;

    const updatedElements = state.currentTemplate.elements.filter(el => el.id !== id);
    
    set({
      currentTemplate: {
        ...state.currentTemplate,
        elements: updatedElements
      },
      selectedElements: state.selectedElements.filter(selId => selId !== id),
      isDirty: true,
    });

    get().saveToHistory();
  },

  deleteSelectedElements: () => {
    const state = get();
    state.selectedElements.forEach(id => get().deleteElement(id));
  },

  duplicateElement: (id) => {
    const state = get();
    if (!state.currentTemplate) return;

    const element = state.currentTemplate.elements.find(el => el.id === id);
    if (!element) return;

    const duplicatedElement = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20,
    };

    get().addElement(duplicatedElement);
  },

  // Selection actions
  selectElement: (id, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedElements.includes(id);
        return {
          selectedElements: isSelected
            ? state.selectedElements.filter(selId => selId !== id)
            : [...state.selectedElements, id]
        };
      } else {
        return { selectedElements: [id] };
      }
    });
  },

  selectAllElements: () => {
    const state = get();
    if (!state.currentTemplate) return;

    set({
      selectedElements: state.currentTemplate.elements.map(el => el.id)
    });
  },

  clearSelection: () => {
    set({ selectedElements: [] });
  },

  selectElementsInArea: (startX, startY, endX, endY) => {
    const state = get();
    if (!state.currentTemplate) return;

    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    const elementsInArea = state.currentTemplate.elements.filter(el => 
      el.x >= minX && el.x + el.width <= maxX &&
      el.y >= minY && el.y + el.height <= maxY
    );

    set({
      selectedElements: elementsInArea.map(el => el.id)
    });
  },

  // Layer actions
  bringToFront: (id) => {
    const state = get();
    if (!state.currentTemplate) return;

    const maxZIndex = Math.max(...state.currentTemplate.elements.map(el => el.zIndex));
    get().updateElement(id, { zIndex: maxZIndex + 1 });
  },

  sendToBack: (id) => {
    const state = get();
    if (!state.currentTemplate) return;

    const minZIndex = Math.min(...state.currentTemplate.elements.map(el => el.zIndex));
    get().updateElement(id, { zIndex: minZIndex - 1 });
  },

  bringForward: (id) => {
    const state = get();
    const element = state.currentTemplate?.elements.find(el => el.id === id);
    if (!element) return;

    get().updateElement(id, { zIndex: element.zIndex + 1 });
  },

  sendBackward: (id) => {
    const state = get();
    const element = state.currentTemplate?.elements.find(el => el.id === id);
    if (!element) return;

    get().updateElement(id, { zIndex: element.zIndex - 1 });
  },

  // History actions
  saveToHistory: () => {
    const state = get();
    if (!state.currentTemplate) return;

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ ...state.currentTemplate });

    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousTemplate = state.history[state.historyIndex - 1];
      set({
        currentTemplate: { ...previousTemplate },
        historyIndex: state.historyIndex - 1,
        selectedElements: [],
        isDirty: true,
      });
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const nextTemplate = state.history[state.historyIndex + 1];
      set({
        currentTemplate: { ...nextTemplate },
        historyIndex: state.historyIndex + 1,
        selectedElements: [],
        isDirty: true,
      });
    }
  },

  // Template actions
  newTemplate: (width = 400, height = 300) => {
    const newTemplate = createDefaultTemplate(width, height);
    set({
      currentTemplate: newTemplate,
      selectedElements: [],
      canvasSettings: { ...get().canvasSettings, width, height },
      isDirty: false,
      history: [newTemplate],
      historyIndex: 0,
    });
  },

  resetTemplate: () => {
    set({
      currentTemplate: null,
      selectedElements: [],
      canvasSettings: createDefaultCanvasSettings(),
      isDirty: false,
      history: [],
      historyIndex: -1,
    });
  },

  setIsDirty: (dirty) => {
    set({ isDirty: dirty });
  },

  updateTemplateSize: (width: number, height: number) => {
    const state = get();
    if (!state.currentTemplate) return;

    const updatedTemplate = {
      ...state.currentTemplate,
      width,
      height
    };

    set({
      currentTemplate: updatedTemplate,
      canvasSettings: { ...state.canvasSettings, width, height },
      isDirty: true,
    });

    get().saveToHistory();
  },

updateTemplateBackground: (backgroundColor: string) => {
  const state = get();
  if (!state.currentTemplate) return;

  const updatedTemplate = {
    ...state.currentTemplate,
    backgroundColor
  };

  set({
    currentTemplate: updatedTemplate,
    isDirty: true,
  });

  get().saveToHistory();
},

}));