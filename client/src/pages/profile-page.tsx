import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NotesList } from "@/components/notes/notes-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Note } from "@shared/schema";
import { BookMarked, Upload, Download, User as UserIcon, Settings, FileText, BookmarkIcon } from "lucide-react";

export default function ProfilePage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    location === "/my-notes" ? "uploads" : "profile"
  );

  // Fetch notes uploaded by the user
  const { data: userNotes = [] } = useQuery<Note[]>({
    queryKey: [`/api/notes/user/${user?.id}`],
    enabled: activeTab === "uploads",
  });

  // The bookmarked notes would need to be implemented in the backend
  const { data: bookmarkedNotes = [] } = useQuery<Note[]>({
    queryKey: [`/api/users/${user?.id}/bookmarks`],
    enabled: activeTab === "bookmarks",
    // This is likely not implemented yet, will show empty state
  });

  // Statistics - these would need backend implementation
  const totalUploads = userNotes.length;
  const totalDownloads = userNotes.reduce((sum, note) => sum + note.downloads, 0);
  const averageRating = userNotes.length > 0 ? "4.2" : "0"; // Mock for display only

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-white">
                <div className="md:flex items-center">
                  <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                    <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-primary text-2xl font-bold">
                      {user?.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.displayName} 
                          className="h-full w-full object-cover rounded-full"
                        />
                      ) : (
                        user?.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-1">{user?.displayName}</h1>
                    <p className="text-blue-100 mb-2">@{user?.username}</p>
                    <p className="text-blue-100">{user?.email}</p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{totalUploads}</div>
                    <div className="text-blue-100 text-sm">Uploads</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{totalDownloads}</div>
                    <div className="text-blue-100 text-sm">Downloads</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{averageRating}</div>
                    <div className="text-blue-100 text-sm">Avg. Rating</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(val) => setActiveTab(val)}
              className="mb-6"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="uploads">
                  <FileText className="h-4 w-4 mr-2" />
                  My Uploads
                </TabsTrigger>
                <TabsTrigger value="bookmarks">
                  <BookmarkIcon className="h-4 w-4 mr-2" />
                  Bookmarks
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      View and update your profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          defaultValue={user?.displayName}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          defaultValue={user?.username}
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user?.email}
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button variant="outline" className="mr-2">
                        Change Password
                      </Button>
                      <Button>
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Activity</CardTitle>
                    <CardDescription>
                      Your recent activity on StudyShare
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border p-4 flex flex-col divide-y space-y-4">
                      {userNotes.length > 0 ? (
                        userNotes.slice(0, 5).map((note, index) => (
                          <div key={note.id} className={`flex items-center ${index > 0 ? 'pt-4' : ''}`}>
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{note.title}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(note.uploadDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {note.downloads} downloads
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Yet</h3>
                          <p className="text-gray-500">
                            Start uploading notes to see your activity here.
                          </p>
                          <Button asChild className="mt-4">
                            <a href="/upload">Upload Notes</a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* My Uploads Tab */}
              <TabsContent value="uploads">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">My Uploaded Notes</h2>
                  <Button asChild>
                    <a href="/upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New
                    </a>
                  </Button>
                </div>
                
                <NotesList
                  title=""
                  notes={userNotes}
                  emptyMessage={
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Notes Uploaded Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Share your knowledge with other students by uploading your notes.
                      </p>
                      <Button asChild>
                        <a href="/upload">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Your First Note
                        </a>
                      </Button>
                    </div>
                  }
                />
              </TabsContent>
              
              {/* Bookmarks Tab */}
              <TabsContent value="bookmarks">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">My Bookmarked Notes</h2>
                  <Button asChild variant="outline">
                    <a href="/browse">
                      <BookMarked className="mr-2 h-4 w-4" />
                      Browse More
                    </a>
                  </Button>
                </div>
                
                <NotesList
                  title=""
                  notes={bookmarkedNotes}
                  emptyMessage={
                    <div className="text-center py-8">
                      <BookmarkIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Bookmarked Notes</h3>
                      <p className="text-gray-500 mb-4">
                        Save notes you find useful for quick access later.
                      </p>
                      <Button asChild variant="outline">
                        <a href="/browse">
                          <BookMarked className="mr-2 h-4 w-4" />
                          Browse Notes
                        </a>
                      </Button>
                    </div>
                  }
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
