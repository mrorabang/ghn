import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit2, Trash2, ChevronDown, Calendar } from 'lucide-react';
import EmployeeModal from './EmployeeModal';

const EmployeeManager = ({ 
  employees, 
  shifts, 
  assignments, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  const activeEmployees = employees.filter(e => e.active !== false);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`)) {
      try {
        await onDeleteEmployee(employee.id);
        setIsDropdownOpen(false);
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        alert('Không thể xóa nhân viên. Vui lòng thử lại.');
      }
    }
  };

  const handleSaveEmployee = async (formData) => {
    try {
      if (modalMode === 'add') {
        await onAddEmployee(formData);
      } else {
        await onUpdateEmployee(selectedEmployee.id, formData);
      }
      setIsModalOpen(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu nhân viên:', error);
      throw error;
    }
  };

  const getEmployeeAssignments = (employeeId) => {
    return assignments.filter(a => a.employeeId === employeeId && a.status !== 'deleted');
  };

  const getEmployeeDeadline = (employeeId) => {
    const employeeAssignments = getEmployeeAssignments(employeeId);
    if (employeeAssignments.length === 0) return null;
    
    const sortedAssignments = employeeAssignments.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    return sortedAssignments[0].date;
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
      >
        <Users className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">
          Quản lý nhân viên ({activeEmployees.length})
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Danh sách nhân viên</h3>
              <button
                onClick={handleAddEmployee}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Thêm mới
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {activeEmployees.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                Chưa có nhân viên nào
              </div>
            ) : (
              activeEmployees.map((employee) => {
                const deadline = getEmployeeDeadline(employee.id);
                const assignmentCount = getEmployeeAssignments(employee.id).length;
                
                return (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 truncate">
                          {employee.name}
                        </span>
                        {employee.position && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {employee.position}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {employee.email && (
                          <span className="truncate">{employee.email}</span>
                        )}
                        {employee.phone && (
                          <span>{employee.phone}</span>
                        )}
                        <span className="font-medium text-blue-600">
                          {assignmentCount} ca
                        </span>
                      </div>
                      {deadline && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(deadline).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeEmployees.length > 0 && (
            <div className="p-2 border-t border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-600 text-center">
                Tổng cộng: {activeEmployees.length} nhân viên
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsDropdownOpen(false);
          }}
          onSave={handleSaveEmployee}
          onDelete={onDeleteEmployee}
        />
      )}

      {/* Overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default EmployeeManager;
