import { NextResponse } from 'next/server'
import { createMockRequest, mockAdminUser, mockLeaveRequest, mockAuth, mockPool, resetMocks } from '../../test-utils'
import { POST as rejectHandler } from '@/app/api/leave-requests/[id]/reject/route'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn()
}))

// Mock the database pool
jest.mock('@/lib/db', () => ({
  execute: jest.fn()
}))

describe('POST /api/leave-requests/[id]/reject', () => {
  const rejectionReason = 'Insufficient leave balance'
  
  beforeEach(() => {
    resetMocks()
    // Mock auth to return admin user
    mockAuth.requireAuth.mockReturnValue(mockAdminUser)
    mockAuth.requireRole.mockReturnValue(true)
  })

  it('should reject a leave request successfully', async () => {
    // Mock database response
    mockPool.execute
      .mockResolvedValueOnce([[mockLeaveRequest]]) // Check if request exists
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update request

    const request = createMockRequest('POST', { rejection_reason: rejectionReason })
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await rejectHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Pengajuan cuti berhasil ditolak')
    
    // Verify database was called correctly
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [1, 'pending']
    )
    expect(mockPool.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE'),
      [mockAdminUser.id, rejectionReason, 1]
    )
  })

  it('should return 400 if rejection reason is missing', async () => {
    const request = createMockRequest('POST', {})
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await rejectHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Alasan penolakan wajib diisi')
  })

  it('should return 403 for non-admin users', async () => {
    // Mock non-admin user
    mockAuth.requireRole.mockReturnValue(false)

    const request = createMockRequest('POST', { rejection_reason: rejectionReason })
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await rejectHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Hanya admin yang diizinkan')
  })

  it('should handle database errors', async () => {
    // Mock database error
    mockPool.execute.mockRejectedValueOnce(new Error('Database error'))

    const request = createMockRequest('POST', { rejection_reason: rejectionReason })
    const context = { params: Promise.resolve({ id: '1' }) }
    
    const response = await rejectHandler(request, context) as NextResponse
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toContain('kesalahan')
  })
})
