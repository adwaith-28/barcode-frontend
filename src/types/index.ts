export interface Template {
  templateId: number;
  name: string;
  description: string;
  layoutJson: string;
  width: number;
  height: number;
  requiredFields: string; // JSON array as string
  category: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  previewImage?: string;
}

export interface TemplateLayout {
  width: number;
  height: number;
  backgroundColor: string;
  elements: LayoutElement[];
  settings: Record<string, any>;
}

export interface LayoutElement {
  id: string;
  type: 'text' | 'dynamic-text' | 'barcode' | 'qrcode' | 'product-code' | 'image' | 'dynamic-image' | 'rectangle' | 'line' | 'logo';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  properties: Record<string, any>;
  style: Record<string, any>;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  layoutJson: string;
  width: number;
  height: number;
  requiredFields: string[];
  category: string;
  isPublic: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  templateId: number;
}

export interface LabelRequest {
  templateId: number;
  data: Record<string, string>;
}

export interface PreviewLabelRequest {
  templateId: number;
  layoutJson?: string;
  data: Record<string, string>;
  format?: 'pdf' | 'png';
}

// Element-specific property interfaces
export interface TextElementProperties {
  content: string;
  dataField?: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface BarcodeElementProperties {
  data: string;
  dataField?: string;
  type: 'CODE_128' | 'CODE_39' | 'EAN_13';
  showText: boolean;
}

export interface QRCodeElementProperties {
  data: string;
  dataField?: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
}

export interface ImageElementProperties {
  src: string;
  alt?: string;
  maintainAspectRatio: boolean;
}

export interface RectangleElementProperties {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface LineElementProperties {
  stroke: string;
  strokeWidth: number;
}

// Canvas and Designer types
export interface CanvasSettings {
  width: number;
  height: number;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export interface DragItem {
  id: string;
  type: string;
  element?: LayoutElement;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form data types
export interface LabelFormData {
  [key: string]: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  isPublic: boolean;
  width: number;
  height: number;
  requiredFields: string[];
}

// Categories
// export const TEMPLATE_CATEGORIES = [
//   'All',
//   'Product',
//   'Shipping', 
//   'Retail',
//   'Custom'
// ] as const;

// export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

// Element types for palette
export const ELEMENT_TYPES = [
  { type: 'text', label: 'Static Text', category: 'TEXT ELEMENTS' },
  { type: 'dynamic-text', label: 'Dynamic Text', category: 'TEXT ELEMENTS' },
  { type: 'barcode', label: 'Barcode', category: 'CODES & DATA' },
  { type: 'qrcode', label: 'QR Code', category: 'CODES & DATA' },
  // { type: 'product-code', label: 'Product Code', category: 'CODES & DATA' },
  { type: 'image', label: 'Image Upload', category: 'MEDIA' },
  { type: 'dynamic-image', label: 'Dynamic Image', category: 'MEDIA' },
  // { type: 'logo', label: 'Logo Placeholder', category: 'MEDIA' },
  { type: 'rectangle', label: 'Rectangle', category: 'SHAPES' },
  { type: 'line', label: 'Line/Divider', category: 'SHAPES' },
] as const;

// Canvas presets
export const CANVAS_PRESETS = [
  { name: 'Business Card', width: 350, height: 200 },
  { name: 'Product Label', width: 400, height: 300 },
  { name: 'Shipping Label', width: 600, height: 400 },
] as const;

// Data field options
export const DATA_FIELDS = [
  { value: 'ProductName', label: 'Product Name' },
  { value: 'Price', label: 'Price' },
  { value: 'Code', label: 'Product Code' },
  { value: 'Description', label: 'Description' },
  { value: 'Custom', label: 'Custom Field' },
] as const;

// Add these to your types.ts file

export const TEMPLATE_CATEGORIES = [
  'All',
  'Product',
  'Shipping',
  'Retail',
  'Custom',
  'Event',
  'Office'
] as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number];

// Make sure you have these interfaces as well:
export interface CreateTemplateRequest {
  name: string;
  description: string;
  layoutJson: string;
  width: number;
  height: number;
  requiredFields: string[];
  category: string;
  isPublic: boolean;
  previewImage?: string;
}