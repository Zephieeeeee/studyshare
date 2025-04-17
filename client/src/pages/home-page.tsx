import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NotesList } from "@/components/notes/notes-list";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function HomePage() {
  // Get user if authenticated, or null if guest
  const { user } = useAuth();
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Hero section */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-12 md:p-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="md:flex md:items-center md:justify-between">
                <div className="md:w-7/12">
                  <h1 className="text-3xl font-bold mb-3">Share Your Knowledge, Ace Your Exams</h1>
                  <p className="text-blue-100 mb-6">
                    Upload your notes to help others and download quality study materials from peers.
                    Join our community of students helping each other succeed.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                      <Link href="/upload">Upload Notes</Link>
                    </Button>
                    <Button asChild className="bg-blue-700 hover:bg-blue-800 text-white">
                      <Link href="/browse">Browse Notes</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block md:w-4/12">
                  <div className="rounded-lg overflow-hidden shadow-lg h-64 w-full bg-blue-700 flex items-center justify-center">
                    <svg className="h-24 w-24 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Categories Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Top Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href={`/browse/category/${category.id}`}>
                  <a className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition text-center">
                    <div className={`bg-${category.color}-100 text-${category.color}-600 rounded-full mx-auto mb-3 w-12 h-12 flex items-center justify-center`}>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-800">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {Math.floor(Math.random() * 300)} notes
                    </p>
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Recently Added Notes */}
          <NotesList 
            title="Recently Added Notes" 
            queryKey="/api/notes?sort=recent"
            viewAllLink="/browse"
          />
          
          {/* Most Popular Notes */}
          <NotesList 
            title="Most Popular Notes" 
            queryKey="/api/notes?sort=popular"
            viewAllLink="/browse?sort=popular"
          />
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
}
