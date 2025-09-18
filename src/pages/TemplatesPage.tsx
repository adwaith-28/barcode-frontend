import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import { useTemplateStore } from '@/stores/templateStore';
import { useToast } from '@/components/ui/use-toast'; 
import { TEMPLATE_CATEGORIES } from '@/types';
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Copy,
  Trash2,
  Eye,
  Calendar,
  Grid3X3
} from 'lucide-react';

const TemplatesPage = () => {
  const {
    templates,
    loading,
    error,
    filters,
    pagination,
    fetchTemplates,
    setCategory,
    setSearch,
    deleteTemplate,
    duplicateTemplate
  } = useTemplateStore();

  const { toast } = useToast(); 
  const [searchInput, setSearchInput] = useState(filters.search);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); 
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Debounce search
    const timer = setTimeout(() => {
      setSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  };

 const openDeleteDialog = (id: number) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    const result = await deleteTemplate(templateToDelete);
    
    if (result) {
      toast({
        title: "Success",
        description: "Template deleted successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
    
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleDuplicateTemplate = async (id: number) => {
    await duplicateTemplate(id);
  };

  // Mock template data for demo purposes
  const mockTemplates = [
    {
      templateId: 1,
      name: 'Product Label - Basic',
      description: 'Simple product label with name, price, and barcode',
      category: 'Product',
      createdAt: '2024-01-15T10:30:00Z',
      previewImage: '/api/placeholder/300/200',
      isPublic: true,
      isActive: true
    },
    {
      templateId: 2,
      name: 'Shipping Label - Standard',
      description: 'Professional shipping label with address and tracking',
      category: 'Shipping',
      createdAt: '2024-01-14T15:45:00Z',
      previewImage: '/api/placeholder/300/200',
      isPublic: true,
      isActive: true
    },
    {
      templateId: 3,
      name: 'Retail Price Tag',
      description: 'Elegant price tag for retail products with branding',
      category: 'Retail',
      createdAt: '2024-01-13T09:20:00Z',
      previewImage: '/api/placeholder/300/200',
      isPublic: true,
      isActive: true
    },
    {
      templateId: 4,
      name: 'Custom Badge Design',
      description: 'Customizable event badge with QR code integration',
      category: 'Custom',
      createdAt: '2024-01-12T14:10:00Z',
      previewImage: '/api/placeholder/300/200',
      isPublic: true,
      isActive: true
    }
  ];

  const displayTemplates = (templates || []).length > 0 ? templates : mockTemplates;
  const filteredTemplates = displayTemplates.filter(template => {
    const matchesCategory = filters.category === 'All' || template.category === filters.category;
    const matchesSearch = template.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchInput.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-2">Template Library</h1>
            <p className="text-muted-foreground">
              Choose from professional templates or create your own from scratch
            </p>
          </div>
          
          <Button asChild className="bg-gradient-primary hover:opacity-90 border-0">
            <Link to="/designer" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filters.category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid View
          </Button>
        </div>

        {/* Template Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchTemplates()}>
              Try Again
            </Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or create a new template
            </p>
            <Button asChild>
              <Link to="/designer">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.templateId} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                {/* Template Preview */}
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
                  <div className="w-full h-full bg-gradient-subtle flex items-center justify-center">
                    <div className="text-center p-4">
                      <Grid3X3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Template Preview</p>
                    </div>
                  </div>
                  
                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/designer/${template.templateId}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/generate/${template.templateId}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleDuplicateTemplate(template.templateId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 flex-shrink-0">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(template.createdAt)}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/designer/${template.templateId}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to={`/generate/${template.templateId}`}>
                        Use Template
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(template.templateId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredTemplates.length > 0 && pagination.page < pagination.totalPages && (
          <div className="text-center mt-12">
            <Button 
              variant="outline"
              onClick={() => fetchTemplates(pagination.page + 1, false)}
            >
              Load More Templates
            </Button>
          </div>
        )}
      </div>
            {/* Add this AlertDialog at the bottom */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TemplatesPage;