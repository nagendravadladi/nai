import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Globe, Palette, Loader, Download, Share, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface SettingsPanelProps {
  userId: number;
}

export default function SettingsPanel({ userId }: SettingsPanelProps) {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showWidgetsModal, setShowWidgetsModal] = useState(false);
  const [language, setLanguage] = useState('english');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExportData = () => {
    // Create a simplified data export
    const exportData = {
      user: user,
      exportDate: new Date().toISOString(),
      settings: {
        theme,
        language,
        notifications,
        autoSave
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `myverse-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data exported!",
      description: "Your MyVerse data has been downloaded as JSON.",
    });
  };

  const handleShareDashboard = () => {
    const shareUrl = `${window.location.origin}/public/${userId}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link copied!",
      description: "Your public dashboard link has been copied to clipboard.",
    });
  };

  const availableWidgets = [
    { id: 'clock', name: 'Digital Clock', enabled: true },
    { id: 'weather', name: 'Weather Loader', enabled: false },
    { id: 'calendar', name: 'Mini Calendar', enabled: true },
    { id: 'quotes', name: 'Daily Quotes', enabled: true },
    { id: 'news', name: 'News Headlines', enabled: false },
  ];

  return (
    <>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-primary" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Settings Options */}
          <div className="space-y-3">
            {/* Language */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Language</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
              </div>
              <Select value={theme || 'light'} onValueChange={setTheme}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Background Customization */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Background</span>
              <Button
                size="sm"
                onClick={() => setShowCustomizeModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                Customize
              </Button>
            </div>
            
            {/* Widgets */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Widgets</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowWidgetsModal(true)}
              >
                Manage
              </Button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto Save</span>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
            
            {/* Export Data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Export Data</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                onClick={handleExportData}
              >
                JSON
              </Button>
            </div>
            
            {/* Share Dashboard */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Share Dashboard</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                onClick={handleShareDashboard}
              >
                Get Link
              </Button>
            </div>

            {/* Privacy Notice */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Privacy:</strong> Your shared dashboard only shows portfolio and certificates. All personal data remains private.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Customization Modal */}
      <Dialog open={showCustomizeModal} onOpenChange={setShowCustomizeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Background</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Background Style</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <div className="w-full h-16 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded mb-2"></div>
                  <p className="text-sm text-center">Default Gradient</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <div className="w-full h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded mb-2"></div>
                  <p className="text-sm text-center">Bold Gradient</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                  <p className="text-sm text-center">Minimal</p>
                </div>
                <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
                  <div className="w-full h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded mb-2"></div>
                  <p className="text-sm text-center">Ocean</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowCustomizeModal(false)}>
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widgets Management Modal */}
      <Dialog open={showWidgetsModal} onOpenChange={setShowWidgetsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Widgets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose which widgets to display on your dashboard
            </p>
            <div className="space-y-3">
              {availableWidgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{widget.name}</p>
                  </div>
                  <Switch defaultChecked={widget.enabled} />
                </div>
              ))}
            </div>
            <Button onClick={() => setShowWidgetsModal(false)}>
              Save Loader Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
