import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookMarked,
  Search,
  Bell,
  Upload,
  User,
  Settings,
  FileText,
  Download,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function Header() {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <BookMarked className="text-primary text-2xl mr-2" />
              <span className="font-bold text-xl text-gray-800">StudyShare</span>
            </Link>
          </div>
          
          {/* Search bar - Hidden on mobile, visible on larger screens */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search notes, courses, subjects..."
                  className="w-full pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
          
          {/* Nav items and profile */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {!user ? (
              <Button
                variant="default"
                onClick={() => setLocation('/auth')}
                className="bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition"
              >
                Login / Register
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <Link href="/upload">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Upload"
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                </Link>
                
                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-medium text-sm">
                            {user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:block font-medium">{user.displayName}</span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/my-notes">
                      <DropdownMenuItem>
                        <FileText className="mr-3 h-4 w-4 text-gray-500" />
                        <span>My Notes</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/downloads">
                      <DropdownMenuItem>
                        <Download className="mr-3 h-4 w-4 text-gray-500" />
                        <span>Downloads</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile search bar - Only visible on small screens */}
      <div className="block md:hidden border-t border-gray-200 p-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </form>
      </div>
    </header>
  );
}
