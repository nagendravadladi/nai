import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useFocusMode } from "@/hooks/useFocusMode";
import { User } from "@shared/schema";
import { Sun, Moon } from "lucide-react";
import CustomizeProfile from "@/components/modals/CustomizeProfile";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { focusModeEnabled, toggleFocusMode } = useFocusMode();
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all your data? This action cannot be undone.")) {
      // Implement reset functionality
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleViewPortfolio = () => {
    if (user.portfolioLink) {
      window.open(user.portfolioLink, '_blank');
    } else {
      const link = prompt("Please enter your portfolio link:");
      if (link) {
        // Update user portfolio link
        // This would be handled by the CustomizeProfile modal
      }
    }
  };

  return (
    <>
      <header className="dashboard-card p-6 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Logo and Welcome */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              MyVerse
              <span className="block text-lg font-normal text-gray-600 dark:text-gray-300">Your Digital Universe</span>
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              Welcome back, {user.name || 'User'}! 👋
            </p>
            {user.dailyQuote && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2 max-w-md">
                "{user.dailyQuote}"
              </p>
            )}
          </div>

          {/* Profile and Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <Moon className="h-4 w-4 text-purple-500" />
            </div>

            {/* Focus Mode Toggle */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Focus Mode</span>
              <Switch
                checked={focusModeEnabled}
                onCheckedChange={toggleFocusMode}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCustomizeModal(true)}
              >
                Customize
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                onClick={handleViewPortfolio}
              >
                View Portfolio
              </Button>
            </div>

            {/* Profile Avatar */}
            <Avatar className="w-16 h-16 border-4 border-primary/20 hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setShowCustomizeModal(true)}>
              <AvatarImage src={user.profilePicture || undefined} />
              <AvatarFallback className="text-xl">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <CustomizeProfile
        user={user}
        open={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
      />
    </>
  );
}
