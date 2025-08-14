import { NextResponse } from 'next/server'
import { createMockRequest, mockAdminUser, mockLeaveRequest, mockAuth, mockPool, resetMocks } from '../../test-utils'
import { POST as approveHandler } from '@/app/api/leave-requests/[id]/approve/route'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn()
}))

// Mock the database pool
jest.mock('@/lib/db', () => ({
  execute: jest.fn()
}))

describe('POST /api/leave-requests/[id]/approve', () => {
  beforeEach(() => {
    resetMocks()
    // Mock auth to return admin user
    mockAuth.requireAuth.mockReturnValue(mockAdminUser)
    mockAuth.requireRole.mockReturnValue(true)
  })

  it('should approve a leave request successfully', async () => {
    // Mock database response
    mockPool.execute
      .mockResolvedValueOnce([[mockLeaveRequest]]) // Check if request exists
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update request

    const request = createMockRequest('POST')
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await approveHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Pengajuan cuti berhasil disetujui')
    
    // Verify database was called correctly
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [1, 'pending']
    )
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE'),
      [mockAdminUser.id, 1]
    )
  })

  it('should return 404 if leave request not found', async () => {
    // Mock empty result for leave request
    mockPool.execute.mockResolvedValueOnce([[]])

    const request = createMockRequest('POST')
    const context = { params: Promise.resolve({ id: '999' }) }
    
    const response = await approveHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toContain('tidak ditemukan')
  })

  it('should return 403 for non-admin users', async () => {
    // Mock non-admin user
    mockAuth.requireRole.mockReturnValue(false)

    const request = createMockRequest('POST')
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await approveHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Hanya admin yang diizinkan')
  })

  it('should handle database errors', async () => {
    // Mock database error
    mockPool.execute.mockRejectedValueOnce(new Error('Database error'))

    const request = createMockRequest('POST')
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await approveHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toContain('kesalahan')
  })
})
