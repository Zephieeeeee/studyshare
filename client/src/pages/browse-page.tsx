import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NotesList } from "@/components/notes/notes-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Note, Category } from "@shared/schema";
import { Search, Filter } from "lucide-react";

export default function BrowsePage() {
  const [_, params] = useRoute("/browse/category/:categoryId");
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const categoryId = params?.categoryId ? parseInt(params.categoryId) : undefined;

  // Extract search query from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [location]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get current category name if browsing by category
  const currentCategory = categoryId 
    ? categories.find(c => c.id === categoryId) 
    : undefined;

  // Build query string for API
  const getQueryString = () => {
    let query = `?sort=${sortBy}`;
    if (searchQuery) query += `&q=${encodeURIComponent(searchQuery)}`;
    if (categoryId) query += `&categoryId=${categoryId}`;
    return query;
  };

  // Fetch notes based on filters
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: [`/api/notes${getQueryString()}`],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Refresh query with new search params
    // This would update the URL in a full implementation
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Page header with title and filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {categoryId 
                  ? `Browse ${currentCategory?.name || 'Category'} Notes` 
                  : searchQuery 
                    ? `Search Results: "${searchQuery}"` 
                    : 'Browse All Notes'
                }
              </h1>
              
              <div className="flex items-center space-x-2">
                <Select
                  defaultValue={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="downloads">Most Downloads</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search form */}
            <div className="mt-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search notes by title, description or keywords..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </div>
            
            {/* Category quick filters */}
            {!categoryId && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${
                      categoryId === category.id
                        ? `bg-${category.color}-100 text-${category.color}-800 border-${category.color}-300`
                        : ""
                    }`}
                    asChild
                  >
                    <a href={`/browse/category/${category.id}`}>
                      {category.name}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* Results */}
          <NotesList
            title={notes.length > 0 ? `Results (${notes.length})` : "No Results Found"}
            notes={notes}
            emptyMessage={
              searchQuery
                ? `No notes found matching "${searchQuery}"`
                : categoryId
                ? "No notes found in this category"
                : "No notes available"
            }
          />
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
