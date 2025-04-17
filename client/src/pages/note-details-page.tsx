import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Note, User, Category, Rating as RatingType } from "@shared/schema";
import { Loader2, FileIcon, Download, Calendar, Eye, ThumbsUp, Bookmark, Share2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function NoteDetailsPage() {
  const [_, params] = useRoute("/notes/:id");
  const noteId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch note details
  const { data: note, isLoading: isLoadingNote } = useQuery<Note>({
    queryKey: [`/api/notes/${noteId}`],
    enabled: noteId > 0,
  });

  // Fetch author
  const { data: author } = useQuery<User>({
    queryKey: [`/api/users/${note?.userId}`],
    enabled: !!note,
  });

  // Fetch category
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${note?.categoryId}`],
    enabled: !!note,
  });

  // Fetch ratings
  const { data: ratings = [] } = useQuery<RatingType[]>({
    queryKey: [`/api/notes/${noteId}/ratings`],
    enabled: noteId > 0,
  });

  // Fetch user's existing rating if logged in
  const { data: existingRating } = useQuery<RatingType>({
    queryKey: [`/api/notes/${noteId}/myrating`],
    enabled: !!user && noteId > 0,
    onSuccess: (data) => {
      if (data) {
        setUserRating(data.rating);
        setComment(data.comment || "");
      }
    },
  });

  // Calculate average rating
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  // Submit rating mutation
  const rateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/notes/${noteId}/rate`, {
        rating: userRating,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notes/${noteId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/notes/${noteId}/myrating`] });
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting rating",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle download
  const handleDownload = async () => {
    try {
      window.open(`/api/notes/${noteId}/download`, '_blank');
      toast({
        title: "Download started",
        description: "Your file is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked ? "Note removed from your saved items" : "Note saved to your bookmarks",
    });
  };

  const handleShareNote = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Note link copied to clipboard",
    });
  };

  const submitRating = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to rate this note",
        variant: "destructive",
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    rateMutation.mutate();
  };

  if (isLoadingNote) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Note not found</h2>
              <p className="text-gray-500">The note you're looking for doesn't exist or has been removed</p>
            </div>
          </main>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Note Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-white/20 rounded-md text-xs font-medium">
                    {category?.name || "Uncategorized"}
                  </span>
                  <span className="text-sm text-blue-100">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {note.uploadDate && format(new Date(note.uploadDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mt-2 mb-1">{note.title}</h1>
                <div className="flex items-center space-x-4 text-blue-100 text-sm">
                  <span>
                    <Eye className="inline h-4 w-4 mr-1" /> {note.views} views
                  </span>
                  <span>
                    <Download className="inline h-4 w-4 mr-1" /> {note.downloads} downloads
                  </span>
                  <span>
                    <ThumbsUp className="inline h-4 w-4 mr-1" /> {avgRating.toFixed(1)} ({ratings.length} ratings)
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden mr-3">
                      {author?.profileImage ? (
                        <img
                          src={author.profileImage}
                          alt={author.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-medium text-sm">
                          {author?.displayName.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{author?.displayName || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">{author?.username || "unknown"}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={toggleBookmark}
                      className={isBookmarked ? "text-primary" : ""}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${isBookmarked ? "fill-primary" : ""}`} /> 
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleShareNote}
                    >
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </div>
                </div>
                
                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{note.description}</p>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 flex items-center mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <FileIcon className="h-10 w-10 text-blue-500" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{note.fileName}</h3>
                    <p className="text-sm text-gray-500">
                      {note.fileType} • {Math.round(note.fileSize / 1024)} KB
                    </p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Rating and Comments Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" /> Ratings & Reviews ({ratings.length})
              </h2>
              
              {/* Leave a rating */}
              <div className="mb-6 border-b pb-6">
                <h3 className="text-lg font-medium mb-3">Rate this document</h3>
                <div className="flex items-center mb-4">
                  <Rating
                    value={userRating}
                    onChange={setUserRating}
                    size="lg"
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-500">
                    {userRating > 0 ? `You rated this ${userRating} out of 5` : "Click to rate"}
                  </span>
                </div>
                
                <Textarea
                  placeholder="Leave a comment (optional)"
                  className="mb-3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                
                <Button 
                  onClick={submitRating}
                  disabled={rateMutation.isPending || userRating === 0}
                >
                  {rateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Rating"
                  )}
                </Button>
              </div>
              
              {/* Display ratings & comments */}
              <div>
                <h3 className="text-lg font-medium mb-3">User Reviews</h3>
                
                {ratings.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">
                    No ratings yet. Be the first to rate this document!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <Card key={rating.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                <span className="text-xs font-medium">
                                  {/* Placeholder for user initial */}
                                  U
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">User {rating.userId}</p>
                                <Rating value={rating.rating} readOnly size="sm" />
                              </div>
                            </div>
                            {/* Could add timestamp here in a real implementation */}
                          </div>
                          {rating.comment && (
                            <p className="text-gray-700 mt-2">{rating.comment}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
