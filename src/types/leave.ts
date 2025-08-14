export interface LeaveRequest {
  id: number
  user_id: number
  user_name: string
  employee_id: string
  leave_type: string
  start_date: string
  end_date: string
  days_requested: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: number
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
}
