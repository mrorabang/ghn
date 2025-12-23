import React, { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Download } from 'lucide-react';
import { Employee, Shift, ShiftAssignment, ScheduleCell } from '../types';
import { formatDate, formatDayOfWeek, getMonthDates } from '../utils/dateUtils';

interface ScheduleTableProps {
  employees: Employee[];
  shifts: Shift[];
  assignments: ShiftAssignment[];
  onAddEmployee: () => void;
  onAddShift: () => void;
  onEditEmployee: (employee: Employee) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteEmployee: (id: number) => void;
  onDeleteShift: (id: number) => void;
  onExportExcel: () => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  employees,
  shifts,
  assignments,
  onAddEmployee,
  onAddShift,
  onEditEmployee,
  onEditShift,
  onDeleteEmployee,
  onDeleteShift,
  onExportExcel,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthDates = useMemo(() => getMonthDates(currentMonth), [currentMonth]);

  const weekChunks = useMemo(() => {
    const chunks: Date[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      chunks.push(monthDates.slice(i, i + 7));
    }
    return chunks;
  }, [monthDates]);

  const dateIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    monthDates.forEach((d, idx) => {
      map.set(format(d, 'yyyy-MM-dd'), idx);
    });
    return map;
  }, [monthDates]);

  const scheduleCells = useMemo(() => {
    return shifts.map(shift => {
      return monthDates.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const cellAssignments = assignments.filter(
          assignment => assignment.shift_id === shift.id && assignment.date === dateStr
        );
        
        const cellEmployees = cellAssignments.map(assignment => 
          employees.find(emp => emp.id === assignment.employee_id)
        ).filter(Boolean) as Employee[];

        return {
          date: dateStr,
          dayOfWeek: formatDayOfWeek(date),
          shiftId: shift.id,
          shiftName: shift.name,
          employees: cellEmployees,
        } as ScheduleCell;
      });
    });
  }, [shifts, monthDates, assignments, employees]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Lịch Phân Ca - {format(currentMonth, 'MMMM yyyy', { locale: vi })}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <Download size={16} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: vi })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded hover:bg-gray-100 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={onAddEmployee}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Thêm Nhân Viên
        </button>
        <button
          onClick={onAddShift}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          <Plus size={16} />
          Thêm Ca Làm Việc
        </button>
      </div>

      {/* Table by weeks (mỗi tuần 7 ngày) */}
      <div className="space-y-6">
        {weekChunks.map((weekDates, weekIndex) => (
          <div
            key={weekIndex}
            className="overflow-x-auto border border-gray-300 rounded"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 min-w-[200px]">
                    Ca / Deadline
                    <span className="ml-2 text-xs text-gray-500">
                      Tuần {weekIndex + 1}
                    </span>
                    <button
                      onClick={onAddShift}
                      className="ml-2 p-1 hover:bg-gray-200 rounded"
                      title="Thêm ca làm việc"
                    >
                      <Plus size={14} />
                    </button>
                  </th>
                  {weekDates.map((date) => (
                    <th
                      key={date.toISOString()}
                      className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-[120px]"
                    >
                      <div>{formatDate(date)}</div>
                      <div className="text-sm text-gray-600">{formatDayOfWeek(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, shiftIndex) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{shift.name}</div>
                          {shift.start_time && shift.end_time && (
                            <div className="text-sm text-gray-600">
                              {shift.start_time} - {shift.end_time}
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            Cần: {shift.required_employees} người
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onEditShift(shift)}
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            title="Sửa ca làm việc"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteShift(shift.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            title="Xóa ca làm việc"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const cellIndex = dateIndexMap.get(dateStr);
                      const cell =
                        cellIndex !== undefined
                          ? scheduleCells[shiftIndex]?.[cellIndex]
                          : undefined;

                      const employeesInCell = cell?.employees || [];

                      return (
                        <td
                          key={`${shift.id}-${dateStr}`}
                          className="border border-gray-300 px-2 py-2 align-top min-h-[80px]"
                        >
                          <div className="space-y-1">
                            {employeesInCell.map((employee) => (
                              <div
                                key={employee.id}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex justify-between items-center group"
                              >
                                <span>{employee.name}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                  <button
                                    onClick={() => onEditEmployee(employee)}
                                    className="p-0.5 hover:bg-blue-200 rounded"
                                    title="Sửa nhân viên"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteEmployee(employee.id)}
                                    className="p-0.5 hover:bg-red-200 rounded text-red-600"
                                    title="Xóa nhân viên"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {employeesInCell.length === 0 && (
                              <div className="text-gray-400 text-center py-2 text-sm">
                                Trống
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {shifts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-4">Chưa có ca làm việc nào</div>
          <button
            onClick={onAddShift}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Thêm Ca Làm Việc Đầu Tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleTable;
