import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockApi, mockAuth } from '../mockData';

// FRONTEND-ONLY VERSION: Using mock data instead of real API calls

// Simulates API delays for more realistic behavior
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 300));

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Mock API Request: ${method} ${url}`, data);
  
  // Simulate network delay
  await simulateDelay();
  
  // Create a mock response object
  const createMockResponse = (body: any) => {
    return {
      ok: true,
      status: 200,
      json: async () => body,
      text: async () => JSON.stringify(body)
    } as unknown as Response;
  };
  
  // Handle different API endpoints with mock data
  if (url === '/api/login' && data && typeof data === 'object') {
    const loginData = data as { username: string; password: string };
    const user = await mockAuth.login(loginData.username, loginData.password);
    if (!user) {
      throw new Error("Invalid username or password");
    }
    return createMockResponse(user);
  }
  
  if (url === '/api/register' && data) {
    const user = await mockAuth.register(data);
    return createMockResponse(user);
  }
  
  if (url === '/api/logout') {
    await mockAuth.logout();
    return createMockResponse({});
  }
  
  // Handle any other API requests
  console.warn(`Unhandled mock API request: ${method} ${url}`);
  return createMockResponse({});
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    console.log(`Mock Query: ${url}`);
    
    // Simulate network delay
    await simulateDelay();
    
    // Handle different API endpoints with mock data
    if (url === '/api/user') {
      const user = await mockAuth.getCurrentUser();
      if (!user && unauthorizedBehavior === "throw") {
        throw new Error("Unauthorized");
      }
      return user as unknown as T;
    }
    
    if (url === '/api/categories') {
      return await mockApi.getCategories() as unknown as T;
    }
    
    if (url === '/api/notes' || url.startsWith('/api/notes?')) {
      return await mockApi.getNotes() as unknown as T;
    }
    
    // Example of handling endpoints with parameters
    if (url.startsWith('/api/notes/category/')) {
      const categoryId = parseInt(url.split('/').pop() || '0');
      return await mockApi.getNotesByCategory(categoryId) as unknown as T;
    }
    
    if (url.includes('/notes/') && !url.includes('/ratings')) {
      const noteId = parseInt(url.split('/')[3]);
      return await mockApi.getNote(noteId) as unknown as T;
    }
    
    if (url.includes('/notes/') && url.includes('/ratings')) {
      const noteId = parseInt(url.split('/')[3]);
      return await mockApi.getRatingsByNote(noteId) as unknown as T;
    }
    
    // Handle users endpoint
    if (url === '/api/users') {
      return await mockApi.getUsers() as unknown as T;
    }
    
    if (url.startsWith('/api/users/') && url.includes('/notes')) {
      const userId = parseInt(url.split('/')[3]);
      return await mockApi.getNotesByUser(userId) as unknown as T;
    }
    
    if (url.startsWith('/api/users/') && !url.includes('/notes')) {
      const userId = parseInt(url.split('/')[3]);
      return await mockApi.getUser(userId) as unknown as T;
    }
    
    // Handle ratings endpoint
    if (url === '/api/ratings') {
      return await mockApi.getAllRatings() as unknown as T;
    }
    
    // For any other queries we might have missed
    console.warn(`Unhandled mock query: ${url}`);
    return [] as unknown as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
