-- Insert sample departments
INSERT INTO departments (name, description) VALUES
('IT', 'Information Technology Department'),
('HR', 'Human Resources Department'),
('Finance', 'Finance Department'),
('Marketing', 'Marketing Department'),
('Operations', 'Operations Department');

-- Insert sample users (password: 'password123' hashed with bcrypt)
INSERT INTO users (employee_id, name, email, password, role, department, position, hire_date) VALUES
('EMP001', 'Admin User', 'admin@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'admin', 'IT', 'System Administrator', '2024-01-01'),
('EMP002', 'John Doe', 'john@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'employee', 'IT', 'Software Developer', '2024-01-15'),
('EMP003', 'Jane Smith', 'jane@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'manager', 'HR', 'HR Manager', '2024-01-10'),
('EMP004', 'Mike Johnson', 'mike@company.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'employee', 'Finance', 'Accountant', '2024-02-01');

-- Insert sample work schedules (Monday to Friday, 9 AM to 5 PM)
INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time, is_working_day) VALUES
-- John Doe schedule
(2, 'monday', '09:00:00', '17:00:00', TRUE),
(2, 'tuesday', '09:00:00', '17:00:00', TRUE),
(2, 'wednesday', '09:00:00', '17:00:00', TRUE),
(2, 'thursday', '09:00:00', '17:00:00', TRUE),
(2, 'friday', '09:00:00', '17:00:00', TRUE),
(2, 'saturday', '00:00:00', '00:00:00', FALSE),
(2, 'sunday', '00:00:00', '00:00:00', FALSE),
-- Jane Smith schedule
(3, 'monday', '08:30:00', '16:30:00', TRUE),
(3, 'tuesday', '08:30:00', '16:30:00', TRUE),
(3, 'wednesday', '08:30:00', '16:30:00', TRUE),
(3, 'thursday', '08:30:00', '16:30:00', TRUE),
(3, 'friday', '08:30:00', '16:30:00', TRUE),
(3, 'saturday', '00:00:00', '00:00:00', FALSE),
(3, 'sunday', '00:00:00', '00:00:00', FALSE);

-- Insert sample attendance records
INSERT INTO attendance (user_id, date, check_in_time, check_out_time, total_hours, status, location, ip_address) VALUES
(2, '2024-01-15', '09:00:00', '17:00:00', 8.00, 'present', 'Office', '192.168.1.100'),
(2, '2024-01-16', '09:15:00', '17:00:00', 7.75, 'late', 'Office', '192.168.1.100'),
(3, '2024-01-15', '08:30:00', '16:30:00', 8.00, 'present', 'Office', '192.168.1.101'),
(3, '2024-01-16', '08:30:00', '16:30:00', 8.00, 'present', 'Office', '192.168.1.101');

INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time, is_working_day, day_type) VALUES
-- User ID 1 (Admin) - Monday to Friday work schedule
(1, 'monday', '09:00:00', '17:00:00', 1, 'kerja'),
(1, 'tuesday', '09:00:00', '17:00:00', 1, 'kerja'),
(1, 'wednesday', '09:00:00', '17:00:00', 1, 'kerja'),
(1, 'thursday', '09:00:00', '17:00:00', 1, 'kerja'),
(1, 'friday', '09:00:00', '17:00:00', 1, 'kerja'),
(1, 'saturday', '09:00:00', '17:00:00', 0, 'libur'),
(1, 'sunday', '09:00:00', '17:00:00', 0, 'libur'),

-- User ID 2 (John) - Monday to Friday work schedule  
(2, 'monday', '09:00:00', '17:00:00', 1, 'kerja'),
(2, 'tuesday', '09:00:00', '17:00:00', 1, 'kerja'),
(2, 'wednesday', '09:00:00', '17:00:00', 1, 'kerja'),
(2, 'thursday', '09:00:00', '17:00:00', 1, 'kerja'),
(2, 'friday', '09:00:00', '17:00:00', 1, 'kerja'),
(2, 'saturday', '09:00:00', '17:00:00', 0, 'libur'),
(2, 'sunday', '09:00:00', '17:00:00', 0, 'libur'),

-- User ID 3 (Jane) - Monday to Friday work schedule
(3, 'monday', '09:00:00', '17:00:00', 1, 'kerja'),
(3, 'tuesday', '09:00:00', '17:00:00', 1, 'kerja'),
(3, 'wednesday', '09:00:00', '17:00:00', 1, 'kerja'),
(3, 'thursday', '09:00:00', '17:00:00', 1, 'kerja'),
(3, 'friday', '09:00:00', '17:00:00', 1, 'kerja'),
(3, 'saturday', '09:00:00', '17:00:00', 0, 'libur'),
(3, 'sunday', '09:00:00', '17:00:00', 0, 'libur');
