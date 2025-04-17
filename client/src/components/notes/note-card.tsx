import { Link } from 'wouter';
import { Note, User, Category, Rating } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Bookmark, Eye, Download } from 'lucide-react';
import { Rating as RatingComponent } from '@/components/ui/rating';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface NoteCardProps {
  note: Note;
  user: User;
  category: Category;
  ratings?: Rating[];
}

export function NoteCard({ note, user, category, ratings = [] }: NoteCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  
  // Calculate average rating
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
    : 0;
  
  // Format upload date
  const formattedDate = note.uploadDate 
    ? format(new Date(note.uploadDate), 'PPP')
    : 'Unknown date';
  
  // Time since upload in days, weeks, etc.
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };
  
  const timeAgo = note.uploadDate ? getTimeAgo(new Date(note.uploadDate)) : '';
  
  const toggleBookmark = async () => {
    try {
      // This would be an actual API call in a full implementation
      // await apiRequest('POST', `/api/notes/${note.id}/bookmark`, { isBookmarked: !isBookmarked });
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
        description: isBookmarked ? 'Note removed from your bookmarks' : 'Note added to your bookmarks',
      });
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Could not update bookmark status',
        variant: 'destructive',
      });
    }
  };
  
  const handleDownload = async () => {
    try {
      window.open(`/api/notes/${note.id}/download`, '_blank');
      toast({
        title: 'Download started',
        description: 'Your file is being downloaded',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the file',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <span 
              className={`inline-block px-2 py-1 rounded text-xs font-medium bg-${category.color}-100 text-${category.color}-800 mb-2`}
            >
              {category.name}
            </span>
            <Link href={`/notes/${note.id}`}>
              <h3 className="font-semibold text-lg mb-1 text-gray-800 hover:text-primary transition cursor-pointer">
                {note.title}
              </h3>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            className={`text-gray-400 hover:text-${isBookmarked ? 'primary' : 'gray-600'}`}
          >
            <Bookmark className={isBookmarked ? 'fill-primary text-primary' : ''} />
          </Button>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {note.description}
        </p>
        <div className="flex items-center mt-4">
          <div className="flex-shrink-0">
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
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user.displayName}</p>
            <p className="text-xs text-gray-500">{timeAgo}</p>
          </div>
          <div className="ml-auto flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" /> {note.views}
            <Download className="h-4 w-4 ml-3 mr-1" /> {note.downloads}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between">
        <div className="flex items-center">
          <RatingComponent value={averageRating} readOnly size="sm" />
          <span className="text-xs text-gray-500 ml-1">({totalRatings})</span>
        </div>
        <Button
          size="sm"
          onClick={handleDownload}
          className="bg-primary hover:bg-blue-600 text-white rounded-lg px-3 py-1 text-sm font-medium transition"
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
}
