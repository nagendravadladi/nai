import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, X, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { WishlistItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface EcommerceWishlistProps {
  userId: number;
}

export default function EcommerceWishlist({ userId }: EcommerceWishlistProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [newItem, setNewItem] = useState({
    title: '',
    price: '',
    platform: 'amazon',
    url: '',
    priority: 'medium',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wishlistItems = [] } = useQuery<WishlistItem[]>({
    queryKey: [`/api/wishlist/${userId}`],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      await apiRequest("POST", "/api/wishlist", { ...item, userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlist/${userId}`] });
      setShowAddModal(false);
      setNewItem({ title: '', price: '', platform: 'amazon', url: '', priority: 'medium' });
      toast({
        title: "Added to wishlist!",
        description: "Product has been added to your wishlist.",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wishlist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wishlist/${userId}`] });
      toast({
        title: "Item removed",
        description: "Product has been removed from wishlist.",
      });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title && newItem.platform) {
      addItemMutation.mutate(newItem);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'amazon':
        return '📦';
      case 'flipkart':
        return '🛒';
      case 'meesho':
        return '🏪';
      case 'myntra':
        return '👕';
      case 'nykaa':
        return '💄';
      default:
        return '🛍️';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'amazon':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400';
      case 'flipkart':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400';
      case 'meesho':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400';
      case 'myntra':
        return 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400';
      case 'nykaa':
        return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredItems = selectedPlatform === 'all' 
    ? wishlistItems 
    : wishlistItems.filter(item => item.platform === selectedPlatform);

  const platforms = [...new Set(wishlistItems.map(item => item.platform))];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-primary" />
            Wishlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <Button
              size="sm"
              variant={selectedPlatform === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedPlatform('all')}
              className="whitespace-nowrap"
            >
              All
            </Button>
            {platforms.map(platform => (
              <Button
                key={platform}
                size="sm"
                variant={selectedPlatform === platform ? 'default' : 'outline'}
                onClick={() => setSelectedPlatform(platform)}
                className="whitespace-nowrap capitalize"
              >
                {platform}
              </Button>
            ))}
          </div>
          
          {/* Wishlist Items */}
          <div className="space-y-3 mb-4">
            {filteredItems.map((item) => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${getPlatformColor(item.platform)}`}>
                {/* Product icon placeholder */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">{getPlatformIcon(item.platform)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{item.title}</p>
                  <p className="text-sm">
                    {item.price && <span className="font-semibold">{item.price}</span>}
                    {item.price && ' • '}
                    <span className="capitalize">{item.platform}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getPriorityColor(item.priority || 'medium')}`}>
                      {item.priority || 'Medium'} Priority
                    </Badge>
                    {item.url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 p-1 text-xs"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => item.id && deleteItemMutation.mutate(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No items in wishlist</p>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            className="w-full border-dashed hover:border-primary hover:text-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product to Wishlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <Label htmlFor="title">Product Name</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="₹1,999"
              />
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={newItem.platform} onValueChange={(value) => setNewItem({ ...newItem, platform: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="flipkart">Flipkart</SelectItem>
                  <SelectItem value="meesho">Meesho</SelectItem>
                  <SelectItem value="myntra">Myntra</SelectItem>
                  <SelectItem value="nykaa">Nykaa</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">Product URL</Label>
              <Input
                id="url"
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={newItem.priority} onValueChange={(value) => setNewItem({ ...newItem, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={addItemMutation.isPending}>
                {addItemMutation.isPending ? 'Adding...' : 'Add to Wishlist'}
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
