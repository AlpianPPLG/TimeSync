import { NextRequest } from "next/server"
import { JWT } from "next-auth/jwt"

// Mock the next-auth functions
export const mockAuth = {
  requireAuth: jest.fn(),
  requireRole: jest.fn()
}

// Mock the database pool
export const mockPool = {
  execute: jest.fn()
}

// Mock the JWT verification
export const mockJwtVerify = jest.fn()

// Mock the Next.js request
export const createMockRequest = (method: string, body?: any, headers?: HeadersInit) => {
  return new NextRequest('http://localhost:3000/api/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(body && { body: JSON.stringify(body) })
  })
}

// Mock user data for tests
export const mockAdminUser: JWT = {
  id: 1,
  employee_id: 'ADM001',
  role: 'admin',
  name: 'Admin User',
  email: 'admin@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
}

export const mockLeaveRequest = {
  id: 1,
  user_id: 2,
  leave_type: 'vacation',
  start_date: '2025-09-01',
  end_date: '2025-09-05',
  status: 'pending',
  reason: 'Vacation with family',
  days_requested: 5,
  created_at: '2025-08-14T00:00:00.000Z',
  updated_at: '2025-08-14T00:00:00.000Z',
  user_name: 'Test User',
  employee_id: 'EMP001'
}

// Reset all mocks before each test
export const resetMocks = () => {
  jest.clearAllMocks()
  mockAuth.requireAuth.mockReset()
  mockAuth.requireRole.mockReset()
  mockPool.execute.mockReset()
  mockJwtVerify.mockReset()
}
