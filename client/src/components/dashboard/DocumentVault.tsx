import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Folder, Upload, FileText, Image, File, Search, Tag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface DocumentVaultProps {
  userId: number;
}

export default function DocumentVault({ userId }: DocumentVaultProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDocument, setNewDocument] = useState({
    title: '',
    fileName: '',
    fileType: '',
    tags: '',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: [`/api/documents/${userId}`],
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (doc: typeof newDocument) => {
      await apiRequest("POST", "/api/documents", { 
        ...doc, 
        userId,
        filePath: `/uploads/${doc.fileName}`,
        fileSize: 1024, // Placeholder file size
        tags: doc.tags ? doc.tags.split(',').map(t => t.trim()) : []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${userId}`] });
      setShowAddModal(false);
      setNewDocument({ title: '', fileName: '', fileType: '', tags: '' });
      toast({
        title: "Document added!",
        description: "Document has been saved to your vault.",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${userId}`] });
      toast({
        title: "Document deleted",
        description: "Document has been removed from vault.",
      });
    },
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDocument.title && newDocument.fileName) {
      addDocumentMutation.mutate(newDocument);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocument({
        ...newDocument,
        fileName: file.name,
        fileType: file.type,
        title: newDocument.title || file.name.split('.')[0]
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="text-red-500" />;
    if (fileType.includes('image')) return <Image className="text-blue-500" />;
    if (fileType.includes('text')) return <FileText className="text-gray-500" />;
    return <File className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const allTags = [...new Set(documents.flatMap(doc => doc.tags || []))];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Folder className="text-primary" />
            Document Vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          {documents.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center mb-4 hover:border-primary transition-colors cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Drop files here or click to upload</p>
          </div>
          
          {/* Recent Documents */}
          <div className="space-y-2">
            {filteredDocuments.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-800 dark:text-white">
                    {searchTerm ? 'Search Results' : 'Documents'}
                  </h4>
                  <Badge variant="outline">{filteredDocuments.length}</Badge>
                </div>
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>{doc.fileName}</span>
                        {doc.fileSize && <span>• {formatFileSize(doc.fileSize)}</span>}
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {doc.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => doc.id && deleteDocumentMutation.mutate(doc.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </>
            ) : documents.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents uploaded</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents match your search</p>
              </div>
            )}
          </div>

          {/* Popular Tags */}
          {allTags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm text-gray-800 dark:text-white mb-2">Popular Tags</h4>
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 6).map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setSearchTerm(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDocument} className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported: PDF, DOC, TXT, Images
              </p>
            </div>
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={newDocument.title}
                onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                placeholder="My Important Document"
                required
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={newDocument.tags}
                onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                placeholder="personal, important, tax, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addDocumentMutation.isPending}>
                {addDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
