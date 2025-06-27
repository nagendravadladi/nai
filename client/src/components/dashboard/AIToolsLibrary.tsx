import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Plus, ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AITool } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AIToolsLibraryProps {
  userId: number;
}

const defaultTools = [
  { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖', description: 'AI conversational assistant', gradient: 'from-green-400 to-green-600' },
  { name: 'Midjourney', url: 'https://midjourney.com', icon: '🎨', description: 'AI image generation', gradient: 'from-purple-400 to-purple-600' },
  { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', icon: '💻', description: 'AI code assistant', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Claude', url: 'https://claude.ai', icon: '🧠', description: 'AI assistant by Anthropic', gradient: 'from-orange-400 to-orange-600' },
];

export default function AIToolsLibrary({ userId }: AIToolsLibraryProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    url: '',
    description: '',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: aiTools = [] } = useQuery<AITool[]>({
    queryKey: [`/api/ai-tools/${userId}`],
  });

  const addToolMutation = useMutation({
    mutationFn: async (tool: typeof newTool) => {
      await apiRequest("POST", "/api/ai-tools", { 
        ...tool, 
        userId,
        icon: getToolIcon(tool.name)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-tools/${userId}`] });
      setShowAddModal(false);
      setNewTool({ name: '', url: '', description: '' });
      toast({
        title: "AI tool added!",
        description: "Tool has been added to your library.",
      });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ai-tools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-tools/${userId}`] });
      toast({
        title: "Tool removed",
        description: "AI tool has been removed from library.",
      });
    },
  });

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTool.name && newTool.url) {
      addToolMutation.mutate(newTool);
    }
  };

  const getToolIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chat') || lowerName.includes('gpt')) return '💬';
    if (lowerName.includes('image') || lowerName.includes('art') || lowerName.includes('midjourney')) return '🎨';
    if (lowerName.includes('code') || lowerName.includes('copilot') || lowerName.includes('github')) return '💻';
    if (lowerName.includes('write') || lowerName.includes('text')) return '✍️';
    if (lowerName.includes('video')) return '🎬';
    if (lowerName.includes('music') || lowerName.includes('audio')) return '🎵';
    if (lowerName.includes('research') || lowerName.includes('search')) return '🔍';
    return '🤖';
  };

  const getToolGradient = (index: number): string => {
    const gradients = [
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600', 
      'from-blue-400 to-blue-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
    ];
    return gradients[index % gradients.length];
  };

  const allTools = [...defaultTools, ...aiTools.map((tool, index) => ({
    ...tool,
    gradient: getToolGradient(index)
  }))];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Brain className="text-primary" />
            AI Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AI Tools Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {allTools.map((tool, index) => (
              <div
                key={tool.name}
                className={`bg-gradient-to-br ${tool.gradient} rounded-xl p-3 text-white text-center hover:scale-105 transition-transform cursor-pointer relative group`}
                onClick={() => window.open(tool.url, '_blank')}
              >
                <div className="text-2xl mb-1">{tool.icon || getToolIcon(tool.name)}</div>
                <p className="text-xs font-medium truncate">{tool.name}</p>
                
                {/* Delete button for custom tools */}
                {aiTools.find(t => t.name === tool.name) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      const customTool = aiTools.find(t => t.name === tool.name);
                      if (customTool?.id) {
                        deleteToolMutation.mutate(customTool.id);
                      }
                    }}
                  >
                    ×
                  </Button>
                )}

                {/* External link indicator */}
                <ExternalLink className="absolute top-2 right-2 w-3 h-3 opacity-70" />
              </div>
            ))}
            
            {/* Add Tool Button */}
            <div
              className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl p-3 text-white text-center hover:scale-105 transition-transform cursor-pointer border-2 border-dashed border-white/30"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="text-2xl mx-auto mb-1" />
              <p className="text-xs font-medium">Add Tool</p>
            </div>
          </div>

          {/* Tool Categories */}
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Popular Categories</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {['Conversational', 'Image Gen', 'Code Assistant', 'Writing', 'Research'].map((category) => (
                <span key={category} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add AI Tool</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTool} className="space-y-4">
            <div>
              <Label htmlFor="name">Tool Name</Label>
              <Input
                id="name"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                placeholder="GPT-4, Stable Diffusion, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={newTool.url}
                onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                placeholder="Brief description of what this tool does..."
                rows={3}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>💡 The icon will be automatically selected based on the tool name.</p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addToolMutation.isPending}>
                {addToolMutation.isPending ? 'Adding...' : 'Add Tool'}
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
