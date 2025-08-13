export interface User {
    id: number
    employee_id: string
    name: string
    email: string
    password: string
    role: "admin" | "employee" | "manager"
    department?: string
    position?: string
    phone?: string
    address?: string
    hire_date?: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  
  export interface Attendance {
    id: number
    user_id: number
    date: string
    check_in_time?: string
    check_out_time?: string
    break_start_time?: string
    break_end_time?: string
    total_hours?: number
    status: "present" | "absent" | "late" | "half_day" | "sick_leave" | "vacation"
    notes?: string
    location?: string
    ip_address?: string
    created_at: string
    updated_at: string
  }
  
  export interface LeaveRequest {
    id: number
    user_id: number
    leave_type: "sick" | "vacation" | "personal" | "emergency" | "maternity" | "paternity"
    start_date: string
    end_date: string
    days_requested: number
    reason: string
    status: "pending" | "approved" | "rejected"
    approved_by?: number
    approved_at?: string
    rejection_reason?: string
    created_at: string
    updated_at: string
  }
  
  export interface WorkSchedule {
    id: number
    user_id: number
    day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
    start_time: string
    end_time: string
    is_working_day: boolean
    created_at: string
  }
  
  export interface OvertimeRecord {
    id: number
    user_id: number
    date: string
    start_time: string
    end_time: string
    hours: number
    reason?: string
    status: "pending" | "approved" | "rejected"
    approved_by?: number
    created_at: string
  }
  