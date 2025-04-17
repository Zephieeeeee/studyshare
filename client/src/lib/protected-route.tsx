import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useState, useEffect } from "react";

type User = {
  id: number;
  username: string;
  displayName: string;
};

function ProtectedRouteContent({
  component: Component,
}: {
  component: () => React.JSX.Element;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Removed to allow guest access
  // if (!user) {
  //   return <Redirect to="/auth" />;
  // }

  return <Component />;
}

export function ProtectedRoute({
  path,
  component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route path={path}>
      {() => <ProtectedRouteContent component={component} />}
    </Route>
  );
}
