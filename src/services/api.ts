import { 
  Template, 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  LabelRequest, 
  PreviewLabelRequest,
  ApiResponse,
  PaginatedResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7181/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making API request to:', url);
    
    try {
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
  }


      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Request URL was:', url);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'CORS error or network issue. Make sure your API at https://localhost:7181 allows cross-origin requests from this domain.' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Template API methods
async getTemplates(page = 1, limit = 20, category?: string): Promise<ApiResponse<PaginatedResponse<Template>>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && category !== 'All' && { category }),
  });

  try {
    const response = await fetch(`${API_BASE_URL}/templates?${params}`);
    
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error details:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
  }


    const data = await response.json();
    
    // If the response is a simple array, convert it to paginated format
    if (Array.isArray(data)) {
      const paginatedResponse: PaginatedResponse<Template> = {
        data: data,
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1,
      };
      return { success: true, data: paginatedResponse };
    }
    
    // If it's already in paginated format
    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

  async getTemplate(id: number): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(template: CreateTemplateRequest): Promise<ApiResponse<Template>> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: number, updates: Partial<UpdateTemplateRequest>): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTemplate(id: number): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Label generation methods
  async generateLabel(request: LabelRequest): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/labels/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }


      return await response.blob();
    } catch (error) {
      console.error('Label generation failed:', error);
      return null;
    }
  }

  async previewLabel(request: PreviewLabelRequest): Promise<Blob | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/labels/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }


      return await response.blob();
    } catch (error) {
      console.error('Label preview failed:', error);
      return null;
    }
  }

  // File upload methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }


      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Image upload failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }
}

export const apiService = new ApiService();