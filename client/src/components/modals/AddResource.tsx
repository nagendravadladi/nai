import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, StickyNote, Book, Folder, Link, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddResourceProps {
  userId: number;
  type: 'youtube' | 'note' | 'resource';
  open: boolean;
  onClose: () => void;
}

export default function AddResource({ userId, type, open, onClose }: AddResourceProps) {
  const [activeTab, setActiveTab] = useState(type);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folder: '',
    url: '',
  });
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addResourceMutation = useMutation({
    mutationFn: async (resource: {
      userId: number;
      type: string;
      title: string;
      content: string;
      folder?: string;
      thumbnail?: string;
    }) => {
      await apiRequest("POST", "/api/study-resources", resource);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/study-resources/${userId}`] });
      toast({
        title: "Resource added!",
        description: "Your study resource has been saved successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your resource.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'youtube' && !formData.url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'resource' && !formData.url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a resource URL.",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === 'note' && !formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your note.",
        variant: "destructive",
      });
      return;
    }

    const resource = {
      userId,
      type: activeTab,
      title: formData.title.trim(),
      content: activeTab === 'note' ? formData.content.trim() : formData.url.trim(),
      folder: formData.folder.trim() || undefined,
      thumbnail: getPreviewThumbnail(),
    };

    addResourceMutation.mutate(resource);
  };

  const handleClose = () => {
    setFormData({ title: '', content: '', folder: '', url: '' });
    setIsLoadingPreview(false);
    onClose();
  };

  const getPreviewThumbnail = (): string | undefined => {
    if (activeTab === 'youtube' && formData.url) {
      const videoId = extractYouTubeVideoId(formData.url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined;
    }
    return undefined;
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, url });
    
    if (activeTab === 'youtube' && url) {
      const videoId = extractYouTubeVideoId(url);
      if (videoId && !formData.title) {
        setIsLoadingPreview(true);
        // In a real app, you'd fetch the video title from YouTube API
        setTimeout(() => {
          setFormData(prev => ({ 
            ...prev, 
            title: prev.title || `YouTube Video - ${videoId}` 
          }));
          setIsLoadingPreview(false);
        }, 1000);
      }
    }
  };

  const predefinedFolders = [
    'Frontend Development',
    'Backend Development',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'DevOps',
    'UI/UX Design',
    'Programming Languages',
    'Algorithms',
    'System Design'
  ];

  const getTabIcon = (tabType: string) => {
    switch (tabType) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'note': return <StickyNote className="w-4 h-4" />;
      case 'resource': return <Book className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="text-primary" />
            Add Study Resource
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              {getTabIcon('youtube')}
              YouTube
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-2">
              {getTabIcon('note')}
              Notes
            </TabsTrigger>
            <TabsTrigger value="resource" className="flex items-center gap-2">
              {getTabIcon('resource')}
              Resource
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="youtube" className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <Youtube className="text-red-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">YouTube Playlist/Video</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Add educational YouTube content to your study collection
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL *</Label>
                <Input
                  id="youtube-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-gray-500">
                  Paste a YouTube video or playlist URL
                </p>
              </div>
            </TabsContent>

            <TabsContent value="note" className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <StickyNote className="text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Study Notes</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Create and organize your personal study notes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note-content">Note Content *</Label>
                <Textarea
                  id="note-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your study notes here..."
                  rows={8}
                  required
                />
                <p className="text-xs text-gray-500">
                  {formData.content.length} characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="resource" className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Book className="text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Educational Resource</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Save useful educational websites, articles, and documentation
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-url">Resource URL *</Label>
                <Input
                  id="resource-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/tutorial"
                  required
                />
                <p className="text-xs text-gray-500">
                  Link to documentation, tutorials, articles, etc.
                </p>
              </div>
            </TabsContent>

            {/* Common fields for all types */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={
                  activeTab === 'youtube' ? 'React Tutorial Series' :
                  activeTab === 'note' ? 'JavaScript Fundamentals' :
                  'MDN Web Docs'
                }
                required
              />
              {isLoadingPreview && (
                <p className="text-xs text-blue-500">Loading preview...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Folder (Optional)
              </Label>
              <Select value={formData.folder} onValueChange={(value) => setFormData({ ...formData, folder: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a folder or create new..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedFolders.map((folder) => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type a custom folder name"
                value={formData.folder}
                onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
              />
            </div>

            {/* Preview */}
            {formData.title && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-2">Preview:</h4>
                <div className="flex items-center gap-3">
                  {getTabIcon(activeTab)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{formData.title}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {activeTab} {formData.folder && `• ${formData.folder}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={addResourceMutation.isPending}
                className="flex-1"
              >
                {addResourceMutation.isPending ? 'Adding...' : `Add ${activeTab === 'youtube' ? 'Video' : activeTab === 'note' ? 'Note' : 'Resource'}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Tabs>

        {/* Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-1">💡 Tips:</h4>
          <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Organize resources in folders for better management</li>
            <li>• Use descriptive titles to quickly find resources later</li>
            <li>• YouTube playlists are great for course series</li>
            <li>• Notes support markdown-like formatting</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
