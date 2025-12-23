import './App.css';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import MonthYearSelector from './components/MonthYearSelector';
import EmployeeModal from './components/EmployeeModal';
import ShiftModal from './components/ShiftModal';
import EmployeeModalManager from './components/EmployeeModalManager';
import DeadlineModalManager from './components/DeadlineModalManager';
import { Users, Calendar } from 'lucide-react';
import { getEmployees, addEmployee, updateEmployee, softDeleteEmployee } from './services/employeeService';
import { getShifts, addShift, updateShift, softDeleteShift } from './services/shiftService';
import { getAssignmentsByRange, addAssignment, deleteAssignmentsByRange } from './services/assignmentService';

// Helper functions
function getMonthDates(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const w = weekdays[date.getDay()];
  return { label: `${d}/${m}`, weekday: w };
}

function getEmployeesInCell(assignments, employees, shiftId, dateKey) {
  const cellAssignments = assignments.filter(
    (a) => a.shiftId === shiftId && a.date === dateKey
  );
  return cellAssignments
    .map((a) => employees.find((e) => e.id === a.employeeId))
    .filter(Boolean);
}

function formatShiftTime(shift) {
  if (!shift.startTime && !shift.endTime) return '';
  const start = shift.startTime ? shift.startTime.slice(0, 5) : '';
  const end = shift.endTime ? shift.endTime.slice(0, 5) : '';
  if (start && end) return `${start} - ${end}`;
  if (start) return `từ ${start}`;
  if (end) return `đến ${end}`;
  return '';
}

function formatRequired(shift) {
  const n = shift.requiredEmployees ?? 1;
  return 0;
}

function getWeekChunks(dates) {
  const chunks = [];
  for (let i = 0; i < dates.length; i += 7) {
    chunks.push(dates.slice(i, i + 7));
  }
  return chunks;
}

function renderCellEmployees(employees) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-[11px] text-slate-400 text-center italic">
        Trống
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {employees.map((e) => (
        <div
          key={e.id}
          className="text-[11px] px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-100"
        >
          {e.name}
        </div>
      ))}
    </div>
  );
}

function renderDateHeaders(dates) {
  const currentMonth = dates[0].getMonth();
  const currentYear = dates[0].getFullYear();
  let lastMonth = currentMonth;
  let headers = [];
  
  dates.forEach((d, index) => {
    const { label, weekday } = formatDisplay(d);
    const isNextMonth = d.getMonth() !== currentMonth;
    
    // Add month separator if entering next month
    if (d.getMonth() !== lastMonth && index > 0) {
      headers.push(
        <th key={`separator-${d.toISOString()}`} className="extended-month-header" colSpan="1">
          Tháng {d.getMonth() + 1} <span className="next-month-indicator">15 ngày tiếp theo</span>
        </th>
      );
    }
    
    headers.push(
      <th
        key={d.toISOString()}
        className={`border border-slate-300 px-3 py-2 text-center text-xs font-semibold min-w-[100px] ${
          isNextMonth ? 'bg-amber-50 text-amber-700' : 'text-slate-700'
        }`}
      >
        <div>{label}</div>
        <div className={`text-[11px] ${isNextMonth ? 'text-amber-600' : 'text-slate-500'}`}>{weekday}</div>
      </th>
    );
    
    lastMonth = d.getMonth();
  });
  
  return headers;
}

function renderShiftRow(shift, dates, assignments, employees) {
  const currentMonth = dates[0].getMonth();
  
  return (
    <tr key={shift.id} className="hover:bg-slate-50">
      <td className="border border-slate-300 px-4 py-3 align-top bg-slate-50">
        <div className="font-semibold text-sm text-slate-800">{shift.name}</div>
        <div className="text-xs text-slate-500 mb-1">{formatShiftTime(shift)}</div>
        {/* <div className="text-[11px] text-slate-500">{formatRequired(shift)}</div>* Dữ liệu được tải từ Firebase Firestore */}
      </td>
      
      {dates.map((d) => {
        const dateKey = formatDateKey(d);
        const cellAssignments = assignments.filter(
          (a) => a.shiftId === shift.id && a.date === dateKey && a.status !== 'deleted'
        );
        const cellEmployees = cellAssignments.map((a) =>
          employees.find((e) => e.id === a.employeeId)
        ).filter(Boolean);
        
        const isNextMonth = d.getMonth() !== currentMonth;
        
        return (
          <td
            key={d.toISOString()}
            className={`border border-slate-300 px-2 py-2 text-center align-top ${
              isNextMonth ? 'bg-amber-50' : 'bg-white'
            }`}
          >
            {cellEmployees.length > 0 ? (
              <div className="space-y-1">
                {cellEmployees.map((e) => (
                  <div
                    key={e.id}
                    className={`text-[11px] px-2 py-1 rounded text-center block font-semibold ${
                      isNextMonth 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-blue-50 text-blue-800 border border-blue-100'
                    }`}
                  >
                    {e.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-[11px] text-center text-slate-400 ${
                isNextMonth ? 'text-amber-400' : ''
              }`}>
                —
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function App() {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showEmployeeManagerModal, setShowEmployeeManagerModal] = useState(false);
  const [showDeadlineManagerModal, setShowDeadlineManagerModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);

  // Load data từ Firebase (không chặn UI)
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      console.log('Bắt đầu load dữ liệu Firebase...');
      setLoading(true);

      try {
        const monthRange = getMonthRange(currentMonth);
        console.log('Month range:', monthRange);

        const [empRes, shiftRes, assignRes] = await Promise.all([
          getEmployees().catch((e) => {
            console.error('Lỗi getEmployees:', e);
            return [];
          }),
          getShifts().catch((e) => {
            console.error('Lỗi getShifts:', e);
            return [];
          }),
          getAssignmentsByRange(monthRange.start, monthRange.end).catch((e) => {
            console.error('Lỗi getAssignments:', e);
            return [];
          }),
        ]);

        if (cancelled) return;

        console.log('Firebase data loaded:', { empRes, shiftRes, assignRes });
        setEmployees(empRes || []);
        setShifts(shiftRes || []);
        setAssignments(assignRes || []);
      } catch (e) {
        if (!cancelled) {
          console.error('Lỗi load dữ liệu Firebase:', e);
          // Không alert để khỏi chặn UI, chỉ log lỗi
          setEmployees([]);
          setShifts([]);
          setAssignments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentMonth]);

  // Helper to get month range
  function getMonthRange(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      start: formatDateKey(firstDay),
      end: formatDateKey(lastDay),
    };
  }

  // Employee handlers
  const handleAddEmployee = async (employeeData) => {
    try {
      await addEmployee(employeeData);
      // Reload data
      const empRes = await getEmployees();
      setEmployees(empRes);
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      throw error;
    }
  };

  const handleUpdateEmployee = async (employeeId, employeeData) => {
    try {
      await updateEmployee(employeeId, employeeData);
      // Reload data
      const empRes = await getEmployees();
      setEmployees(empRes);
    } catch (error) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
      throw error;
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await softDeleteEmployee(employeeId);
      // Reload data
      const empRes = await getEmployees();
      setEmployees(empRes);
    } catch (error) {
      console.error('Lỗi khi xóa nhân viên:', error);
      throw error;
    }
  };

  // Shift handlers
  const handleAddShift = async (shiftData) => {
    try {
      await addShift(shiftData);
      // Reload data
      const shiftRes = await getShifts();
      setShifts(shiftRes);
    } catch (error) {
      console.error('Lỗi khi thêm ca làm việc:', error);
      throw error;
    }
  };

  const handleUpdateShift = async (shiftId, shiftData) => {
    try {
      await updateShift(shiftId, shiftData);
      // Reload data
      const shiftRes = await getShifts();
      setShifts(shiftRes);
    } catch (error) {
      console.error('Lỗi khi cập nhật ca làm việc:', error);
      throw error;
    }
  };

  const handleDeleteShift = async (shiftId) => {
    try {
      await softDeleteShift(shiftId);
      // Reload data
      const shiftRes = await getShifts();
      setShifts(shiftRes);
    } catch (error) {
      console.error('Lỗi khi xóa ca làm việc:', error);
      throw error;
    }
  };

  // Clear assignments handler
  const handleClearAssignments = async () => {
    if (window.confirm('Xóa tất cả phân ca trong tháng?')) {
      try {
        setLoading(true);
        const monthRange = getMonthRange(currentMonth);
        await deleteAssignmentsByRange(monthRange.start, monthRange.end);
        
        // Reload assignments
        const assignRes = await getAssignmentsByRange(monthRange.start, monthRange.end);
        setAssignments(assignRes);
        
        toast.success('Đã xóa tất cả phân ca!');
      } catch (error) {
        console.error('Lỗi khi xóa phân ca:', error);
        toast.error('Không thể xóa phân ca. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Auto assign shifts (simple algorithm)
  const handleAutoAssign = async () => {
    if (window.confirm('Tự động phân ca cho tất cả nhân viên?')) {
      try {
        setLoading(true);

        // Clear existing assignments for current month
        const monthRange = getMonthRange(currentMonth);
        await deleteAssignmentsByRange(monthRange.start, monthRange.end);

        // Simple round-robin assignment
        const activeEmployees = employees.filter(e => e.active !== false);
        const activeShifts = shifts.filter(s => s.active !== false);
        const monthDates = getMonthDates(currentMonth);

        const newAssignments = [];
        let employeeIndex = 0;

        activeShifts.forEach(shift => {
          monthDates.forEach(date => {
            const dateKey = formatDateKey(date);
            const requiredCount = shift.requiredEmployees || 1;

            for (let i = 0; i < requiredCount && i < activeEmployees.length; i++) {
              const employee = activeEmployees[employeeIndex % activeEmployees.length];
              newAssignments.push({
                employeeId: employee.id,
                shiftId: shift.id,
                date: dateKey,
                status: 'assigned'
              });
              employeeIndex++;
            }
          });
        });

        // Bulk insert
        await Promise.all(newAssignments.map(a => addAssignment(a)));

        // Reload assignments
        const assignRes = await getAssignmentsByRange(monthRange.start, monthRange.end);
        setAssignments(assignRes);

        toast.success('Đã phân ca tự động thành công!');
      } catch (error) {
        console.error('Lỗi khi phân ca tự động:', error);
        toast.error('Không thể phân ca tự động. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export to Excel (placeholder)
  const handleExportExcel = () => {
    toast.info('Chức năng xuất Excel đang phát triển...');
  };

  // Create demo data
  const handleCreateDemoData = async () => {
    if (window.confirm('Tạo dữ liệu demo cho Firebase?')) {
      try {
        setLoading(true);

        // Demo employees
        const demoEmployees = [
          { name: 'Nguyễn Văn An', email: 'an@example.com', phone: '0912345678', position: 'Nhân viên' },
          { name: 'Trần Thị Bình', email: 'binh@example.com', phone: '0923456789', position: 'Nhân viên' },
          { name: 'Lê Văn Cường', email: 'cuong@example.com', phone: '0934567890', position: 'Quản lý ca' },
          { name: 'Phạm Thị Dung', email: 'dung@example.com', phone: '0945678901', position: 'Nhân viên' },
          { name: 'Hoàng Văn Em', email: 'em@example.com', phone: '0956789012', position: 'Nhân viên' },
        ];

        // Demo shifts
        const demoShifts = [
          { name: 'Ca Sáng', description: 'Ca làm việc buổi sáng', startTime: '08:00', endTime: '12:00', requiredEmployees: 2 },
          { name: 'Ca Chiều', description: 'Ca làm việc buổi chiều', startTime: '13:00', endTime: '17:00', requiredEmployees: 2 },
          { name: 'Ca Tối', description: 'Ca làm việc buổi tối', startTime: '18:00', endTime: '22:00', requiredEmployees: 1 },
          { name: 'Ca Giao Hàng', description: 'Deadline giao hàng', startTime: '09:00', endTime: '18:00', requiredEmployees: 3 },
        ];

        // Add employees
        const employeeIds = [];
        for (const emp of demoEmployees) {
          const id = await addEmployee(emp);
          employeeIds.push(id);
        }

        // Add shifts
        const shiftIds = [];
        for (const shift of demoShifts) {
          const id = await addShift(shift);
          shiftIds.push(id);
        }

        // Create some sample assignments for current month
        const monthDates = getMonthDates(currentMonth);
        const demoAssignments = [];

        // Add assignments for first week of month
        for (let i = 0; i < 7 && i < monthDates.length; i++) {
          const date = monthDates[i];
          const dateKey = formatDateKey(date);

          // Assign employees to shifts
          demoAssignments.push({
            employeeId: employeeIds[0],
            shiftId: shiftIds[0], // Ca Sáng
            date: dateKey,
            status: 'assigned'
          });

          demoAssignments.push({
            employeeId: employeeIds[1],
            shiftId: shiftIds[0], // Ca Sáng
            date: dateKey,
            status: 'assigned'
          });

          demoAssignments.push({
            employeeId: employeeIds[2],
            shiftId: shiftIds[1], // Ca Chiều
            date: dateKey,
            status: 'assigned'
          });

          demoAssignments.push({
            employeeId: employeeIds[3],
            shiftId: shiftIds[1], // Ca Chiều
            date: dateKey,
            status: 'assigned'
          });

          demoAssignments.push({
            employeeId: employeeIds[4],
            shiftId: shiftIds[2], // Ca Tối
            date: dateKey,
            status: 'assigned'
          });
        }

        // Add assignments
        await Promise.all(demoAssignments.map(a => addAssignment(a)));

        // Reload data
        const monthRange = getMonthRange(currentMonth);
        const [empRes, shiftRes, assignRes] = await Promise.all([
          getEmployees(),
          getShifts(),
          getAssignmentsByRange(monthRange.start, monthRange.end),
        ]);

        setEmployees(empRes);
        setShifts(shiftRes);
        setAssignments(assignRes);

        toast.success(`Đã tạo ${demoEmployees.length} nhân viên, ${demoShifts.length} ca làm việc và ${demoAssignments.length} phân ca mẫu!`);
      } catch (error) {
        console.error('Lỗi khi tạo data demo:', error);
        toast.error('Không thể tạo data demo: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const activeEmployees = employees.filter((e) => e.active !== false);
  const activeShifts = shifts.filter((s) => s.active !== false);
  const activeAssignments = assignments.filter((a) => a.status !== 'deleted');
  const monthDates = getMonthDates(currentMonth);
  const weekChunks = getWeekChunks(monthDates);

  return (
    <div className="App excel-page min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Bảng phân ca nhân viên
        </h1>
        <p className="text-slate-600 mb-6">
          Cột dọc: <span className="font-semibold">Deadline / Ca làm việc</span> ·
          Cột ngang: <span className="font-semibold">Ngày (hiển thị thứ)</span> ·
          Ô: <span className="font-semibold">Danh sách nhân viên được phân ca</span>
        </p>

        <MonthYearSelector
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onYearChange={setCurrentMonth}
        />

        <div className="button-container">
          <button
            onClick={() => setShowEmployeeManagerModal(true)}
            className="btn-primary"
          >
            {/* <Users className="inline w-4 h-4 mr-2" /> */}
            Quản lý nhân viên ({employees.filter(e => e.active !== false).length})
          </button>

          <button
            onClick={() => setShowDeadlineManagerModal(true)}
            className="btn-primary"
          >
            {/* <Calendar className="inline w-4 h-4 mr-2" /> */}
            Quản lý deadline ({shifts.filter(s => s.active !== false).length})
          </button>

          <button
            onClick={handleAutoAssign}
            className="btn-secondary"
          >
            Tự động phân ca
          </button>

          <button
            onClick={handleClearAssignments}
            className="btn-success"
          >
            Xóa phân ca
          </button>

          {/* <button
            onClick={handleExportExcel}
            className="btn-outline"
          >
            Xuất Excel
          </button> */}

          {/* <button
            onClick={handleCreateDemoData}
            className="btn-outline"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}
          >
            Tạo Data Demo
          </button> */}
        </div>

        <div className="space-y-4">
          {weekChunks.map((weekDates, weekIndex) => (
            <div
              key={weekIndex}
              className="excel-table-wrapper overflow-x-auto rounded-lg border border-slate-300 bg-white shadow-sm"
            >
              <table className="excel-table min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700 min-w-[100px]">
                      {weekIndex === 0 && (
                        <>
                          Deadline / Ca làm việc
                        </>
                      )}
                    </th>
                    {weekDates.map((d) => {
                      const { label } = formatDisplay(d);
                      return (
                        <th
                          key={d.toISOString()}
                          className="border border-slate-300 px-2 py-1 text-center text-xs font-semibold text-slate-700 min-w-[100px]"
                        >
                          <div>{label}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {activeShifts.map((shift) =>
                    renderShiftRow(shift, weekDates, activeAssignments, activeEmployees)
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Thống kê tổng số ca làm việc của từng nhân viên */}
        <div className="stats-card mt-6">
          <h3>Thống kê số ca làm việc</h3>
          <div className="stats-grid">
            {activeEmployees.map(employee => {
              const employeeAssignments = activeAssignments.filter(a => a.employeeId === employee.id);
              const totalShifts = employeeAssignments.length;
              
              return (
                <div key={employee.id} className="employee-stat-card">
                  <div className="employee-name" title={employee.name}>
                    {employee.name}
                  </div>
                  <div className="employee-shift-count">
                    {totalShifts}
                  </div>
                  <div className="shift-label">ca</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Employee Manager Modal */}
      <EmployeeModalManager
        employees={employees}
        shifts={shifts}
        assignments={assignments}
        onAddEmployee={handleAddEmployee}
        onUpdateEmployee={handleUpdateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        isOpen={showEmployeeManagerModal}
        onClose={() => setShowEmployeeManagerModal(false)}
      />

      {/* Deadline Manager Modal */}
      <DeadlineModalManager
        shifts={shifts}
        assignments={assignments}
        employees={employees}
        onAddShift={handleAddShift}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
        isOpen={showDeadlineManagerModal}
        onClose={() => setShowDeadlineManagerModal(false)}
      />

      {/* Employee Modal */}
      <EmployeeModal
        employee={editingEmployee}
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        onSave={async (formData) => {
          try {
            if (editingEmployee) {
              await handleUpdateEmployee(editingEmployee.id, formData);
            } else {
              await handleAddEmployee(formData);
            }
            setShowEmployeeModal(false);
          } catch (error) {
            console.error('Lỗi khi lưu nhân viên:', error);
            throw error;
          }
        }}
        onDelete={handleDeleteEmployee}
      />

      {/* Shift Modal */}
      <ShiftModal
        shift={editingShift}
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        onSave={async (formData) => {
          try {
            if (editingShift) {
              await handleUpdateShift(editingShift.id, formData);
            } else {
              await handleAddShift(formData);
            }
            setShowShiftModal(false);
          } catch (error) {
            console.error('Lỗi khi lưu ca làm việc:', error);
            throw error;
          }
        }}
        onDelete={handleDeleteShift}
      />
    </div>
  );
}

export default App;
