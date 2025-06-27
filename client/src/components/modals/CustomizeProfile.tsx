import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Quote, Link, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { User as UserType } from "@shared/schema";

interface CustomizeProfileProps {
  user: UserType;
  open: boolean;
  onClose: () => void;
}

const inspirationalQuotes = [
  "The future belongs to those who believe in the beauty of their dreams.",
  "Innovation distinguishes between a leader and a follower.",
  "The only way to do great work is to love what you do.",
  "Stay hungry, stay foolish.",
  "Code is poetry written in logic.",
  "Every expert was once a beginner.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Your limitation—it's only your imagination.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it."
];

export default function CustomizeProfile({ user, open, onClose }: CustomizeProfileProps) {
  const [name, setName] = useState(user.name || "");
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");
  const [dailyQuote, setDailyQuote] = useState(user.dailyQuote || "");
  const [portfolioLink, setPortfolioLink] = useState(user.portfolioLink || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { setUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserType>) => {
      const response = await apiRequest("PATCH", `/api/user/${user.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user.id}`] });
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate({
      name: name.trim(),
      profilePicture: previewImage || profilePicture || null,
      dailyQuote: dailyQuote.trim() || null,
      portfolioLink: portfolioLink.trim() || null,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomQuote = () => {
    const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
    setDailyQuote(randomQuote);
  };

  const handleReset = () => {
    setName(user.name || "");
    setProfilePicture(user.profilePicture || "");
    setDailyQuote(user.dailyQuote || "");
    setPortfolioLink(user.portfolioLink || "");
    setPreviewImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-xl">
        <DialogHeader className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <User className="text-primary w-6 h-6" />
            Customize Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Update your profile information, daily quote, and portfolio link
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-primary/30 shadow-lg">
                <AvatarImage src={previewImage || profilePicture || undefined} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Click the camera icon to upload a new photo
            </p>
          </div>

          {/* Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Daily Quote */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quote" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Quote className="w-4 h-4" />
                Daily Quote
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomQuote}
                className="text-xs h-8 px-3 bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary/30"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Random
              </Button>
            </div>
            <Textarea
              id="quote"
              value={dailyQuote}
              onChange={(e) => setDailyQuote(e.target.value)}
              placeholder="Enter an inspirational quote to motivate your day..."
              rows={3}
              maxLength={200}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">Your personal daily motivation</p>
              <p className="text-xs text-gray-500">
                {dailyQuote.length}/200
              </p>
            </div>
          </div>

          {/* Portfolio Link */}
          <div className="space-y-3">
            <Label htmlFor="portfolio" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Link className="w-4 h-4" />
              Portfolio Link
            </Label>
            <Input
              id="portfolio"
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://your-portfolio.com"
              className="h-12 px-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <p className="text-xs text-gray-500">
              Share your work and achievements with others
            </p>
          </div>

          {/* Portfolio URL Preview */}
          {portfolioLink && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700 shadow-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Portfolio preview will be available in your shared dashboard
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updateProfileMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving Changes...
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="px-6 h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="px-6 h-12 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
          <h4 className="font-medium text-sm">💡 Profile Tips:</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Use a clear, professional photo</li>
            <li>• Choose an inspiring daily quote</li>
            <li>• Add your portfolio to showcase your work</li>
            <li>• Your profile reflects in the shared dashboard</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
