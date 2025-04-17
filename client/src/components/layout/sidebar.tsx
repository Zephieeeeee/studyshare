import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import { cn } from '@/lib/utils';
import {
  Home,
  Compass,
  Bookmark,
  History,
  FileText
} from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: recentlyViewed = [] } = useQuery<{ id: number, title: string }[]>({
    queryKey: ['/api/notes/recent'],
    enabled: false, // Disabled until we implement view history tracking
  });
  
  // Fallback for recently viewed until implemented
  const fallbackRecentlyViewed = [
    { id: 101, title: 'Data Structures Final Notes' },
    { id: 102, title: 'Organic Chemistry Lab' },
    { id: 103, title: 'World History Exam Prep' }
  ];

  const mainNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Explore', icon: Compass },
    { path: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 pt-6 pb-8 overflow-y-auto">
      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-lg",
                isActive(item.path) 
                  ? "text-primary bg-blue-50" 
                  : "text-gray-700 hover:bg-gray-100"
              )}>
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-8">
          <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Categories
          </h3>
          <div className="mt-2 space-y-1">
            {categories.map((category) => (
              <Link key={category.id} href={`/browse/category/${category.id}`}>
                <a className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
                  <span className={`w-2 h-2 rounded-full bg-${category.color}-500 mr-3`}></span>
                  <span>{category.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recently Viewed
          </h3>
          <div className="mt-2 space-y-1">
            {(recentlyViewed.length > 0 ? recentlyViewed : fallbackRecentlyViewed).map((item) => (
              <Link key={item.id} href={`/notes/${item.id}`}>
                <a className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100">
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  <span>{item.title}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
