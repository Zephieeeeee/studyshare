import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import UploadPage from "@/pages/upload-page";
import BrowsePage from "@/pages/browse-page";
import NoteDetailsPage from "@/pages/note-details-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/upload" component={UploadPage} />
      <ProtectedRoute path="/browse" component={BrowsePage} />
      <ProtectedRoute path="/browse/category/:categoryId" component={BrowsePage} />
      <ProtectedRoute path="/notes/:id" component={NoteDetailsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/my-notes" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
