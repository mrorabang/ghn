export interface Employee {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: number;
  name: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  required_employees: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignment {
  id: number;
  shift_id: number;
  employee_id: number;
  date: string;
  status: 'assigned' | 'completed' | 'absent';
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
  shift?: Shift;
}

export interface WorkSchedule {
  id: number;
  date: string;
  shift_id: number;
  employee_id: number;
  created_at: string;
  employee?: Employee;
  shift?: Shift;
}

export interface ScheduleCell {
  date: string;
  dayOfWeek: string;
  shiftId: number;
  shiftName: string;
  employees: Employee[];
}

export interface ScheduleTable {
  dates: string[];
  shifts: Shift[];
  cells: ScheduleCell[][];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
