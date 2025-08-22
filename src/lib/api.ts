/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth } from "@/components/auth/auth-provider"

export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const { token, refreshToken } = useAuth()
  
  // Set up headers
  const headers = new Headers(options.headers || {})
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  })
  
  // If unauthorized, try to refresh the token
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      
      const refreshData = await refreshResponse.json()
      
      if (refreshData.success && refreshData.token) {
        // Update the token in auth context
        refreshToken(refreshData.token)
        
        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${refreshData.token}`)
        response = await fetch(url, {
          ...options,
          headers,
        })
      } else {
        // If refresh fails, throw an error that will trigger logout
        throw new Error('Session expired. Please log in again.')
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw error
    }
  }
  
  return response
}

// Helper function to handle common API response patterns
export async function handleApiResponse<T = any>(
  response: Response
): Promise<{ data?: T; error?: string }> {
  const data = await response.json().catch(() => ({}))
  
  if (!response.ok) {
    return {
      error: data.message || 'An error occurred',
    }
  }
  
  return { data }
}
