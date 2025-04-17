import { useQuery } from '@tanstack/react-query';
import { Note, User, Category, Rating } from '@shared/schema';
import { NoteCard } from './note-card';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

interface NotesListProps {
  title: string;
  notes?: Note[];
  queryKey?: string;
  viewAllLink?: string;
  emptyMessage?: string;
}

export function NotesList({
  title,
  notes: providedNotes,
  queryKey,
  viewAllLink,
  emptyMessage = "No notes found"
}: NotesListProps) {
  // If notes are provided directly, use them
  // Otherwise fetch notes from the API
  const { data: fetchedNotes, isLoading } = useQuery<Note[]>({
    queryKey: queryKey ? [queryKey] : undefined,
    enabled: !providedNotes && !!queryKey,
  });

  const notes = providedNotes || fetchedNotes || [];

  // This would normally be optimized with proper data fetching and caching
  // For now, we'll simulate getting users and categories
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: notes.length > 0,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: notes.length > 0,
  });

  // Get ratings for all notes
  const { data: allRatings = [] } = useQuery<Rating[]>({
    queryKey: ['/api/ratings'],
    enabled: notes.length > 0,
  });

  const getUserById = (userId: number) => {
    return users.find(user => user.id === userId) || {
      id: userId,
      username: 'Unknown',
      displayName: 'Unknown User',
      email: '',
      password: '',
      profileImage: null
    };
  };

  const getCategoryById = (categoryId: number) => {
    return categories.find(category => category.id === categoryId) || {
      id: categoryId,
      name: 'Uncategorized',
      color: 'gray',
      icon: 'help-circle'
    };
  };

  const getRatingsByNoteId = (noteId: number) => {
    return allRatings.filter(rating => rating.noteId === noteId);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <a className="text-primary hover:underline text-sm font-medium">View all</a>
          </Link>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-7 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center mt-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="ml-auto">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              user={getUserById(note.userId)}
              category={getCategoryById(note.categoryId)}
              ratings={getRatingsByNoteId(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
