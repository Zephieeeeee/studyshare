import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Home,
  Compass,
  Upload,
  Bookmark,
  User
} from 'lucide-react';

export function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Explore', icon: Compass },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/bookmarks', label: 'Saved', icon: Bookmark },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center py-3",
              isActive(item.path) ? "text-primary" : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
