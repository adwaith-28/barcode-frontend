import { create } from 'zustand';
import { Template, CreateTemplateRequest, TemplateCategory } from '../types';
import { apiService } from '../services/api';

interface TemplateStore {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    category: TemplateCategory;
    search: string;
  };

  // Actions
  fetchTemplates: (page?: number, reset?: boolean) => Promise<void>;
  fetchTemplate: (id: number) => Promise<Template | null>;
  createTemplate: (template: CreateTemplateRequest) => Promise<Template | null>;
  updateTemplate: (id: number, updates: any) => Promise<Template | null>;
  deleteTemplate: (id: number) => Promise<boolean>;
  duplicateTemplate: (id: number) => Promise<Template | null>;
  
  // Filter actions
  setCategory: (category: TemplateCategory) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  
  // UI actions
  setCurrentTemplate: (template: Template | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  // Initial state
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    category: 'All',
    search: '',
  },

  // Actions
  fetchTemplates: async (page = 1, reset = true) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const response = await apiService.getTemplates(
        page, 
        state.pagination.limit, 
        state.filters.category
      );

      if (response.success && response.data) {
        set({
          templates: reset ? response.data.data : [...state.templates, ...response.data.data],
          pagination: {
            page: response.data.page,
            limit: response.data.limit,
            total: response.data.total,
            totalPages: response.data.totalPages,
          },
          loading: false,
        });
      } else {
        set({ 
          error: response.error || 'Failed to fetch templates',
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  fetchTemplate: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.getTemplate(id);

      if (response.success && response.data) {
        set({ 
          currentTemplate: response.data,
          loading: false 
        });
        return response.data;
      } else {
        set({ 
          error: response.error || 'Failed to fetch template',
          loading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      return null;
    }
  },

  createTemplate: async (templateData: CreateTemplateRequest) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.createTemplate(templateData);

      if (response.success && response.data) {
        set((state) => ({
          templates: [response.data!, ...state.templates],
          loading: false,
        }));
        return response.data;
      } else {
        set({ 
          error: response.error || 'Failed to create template',
          loading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      return null;
    }
  },

  updateTemplate: async (id: number, updates: any) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.updateTemplate(id, updates);

      if (response.success && response.data) {
        set((state) => ({
          templates: state.templates.map(t => 
            t.templateId === id ? response.data! : t
          ),
          currentTemplate: state.currentTemplate?.templateId === id 
            ? response.data! 
            : state.currentTemplate,
          loading: false,
        }));
        return response.data;
      } else {
        set({ 
          error: response.error || 'Failed to update template',
          loading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      return null;
    }
  },

  deleteTemplate: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.deleteTemplate(id);

      if (response.success) {
        set((state) => ({
          templates: state.templates.filter(t => t.templateId !== id),
          currentTemplate: state.currentTemplate?.templateId === id 
            ? null 
            : state.currentTemplate,
          loading: false,
        }));
        return true;
      } else {
        set({ 
          error: response.error || 'Failed to delete template',
          loading: false 
        });
        return false;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      return false;
    }
  },

  duplicateTemplate: async (id: number) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.duplicateTemplate(id);

      if (response.success && response.data) {
        set((state) => ({
          templates: [response.data!, ...state.templates],
          loading: false,
        }));
        return response.data;
      } else {
        set({ 
          error: response.error || 'Failed to duplicate template',
          loading: false 
        });
        return null;
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
      return null;
    }
  },

  // Filter actions
  setCategory: (category: TemplateCategory) => {
    set((state) => ({
      filters: { ...state.filters, category },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().fetchTemplates(1, true);
  },

  setSearch: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 }
    }));
    // Debounce search in real implementation
    if (search.trim() === '') {
      get().fetchTemplates(1, true);
    }
  },

  clearFilters: () => {
    set({
      filters: { category: 'All', search: '' },
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    });
    get().fetchTemplates(1, true);
  },

  // UI actions
  setCurrentTemplate: (template: Template | null) => {
    set({ currentTemplate: template });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));