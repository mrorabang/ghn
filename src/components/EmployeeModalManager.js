import React, { useState } from 'react';
import Modal from 'react-modal';
import { X, Users, UserPlus, Edit2, Trash2, Calendar, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import EmployeeModal from './EmployeeModal';

Modal.setAppElement('#root');

const EmployeeModalManager = ({ 
  employees, 
  shifts, 
  assignments, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  isOpen,
  onClose
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');

  const activeEmployees = employees.filter(e => e.active !== false);
  const filteredEmployees = activeEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setModalMode('add');
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('edit');
    setIsEmployeeModalOpen(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`)) {
      try {
        await onDeleteEmployee(employee.id);
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        toast.error('Không thể xóa nhân viên. Vui lòng thử lại.');
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
      setIsEmployeeModalOpen(false);
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        },
        content: {
          position: 'static',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '90vw',
          maxWidth: '1200px',
          height: '90vh',
          overflow: 'hidden',
          padding: '0',
          border: 'none'
        }
      }}
    >
      {/* Header */}
      <div className="employee-manager-header">
        <div className="employee-manager-title">
          <Users className="w-6 h-6" />
          <h2>Quản lý nhân viên</h2>
          <span className="employee-manager-badge">
            {activeEmployees.length} nhân viên
          </span>
        </div>
        <button
          onClick={onClose}
          className="employee-manager-close-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="employee-manager-search">
        <div className="employee-manager-search-container">
          <div className="employee-manager-search-input-wrapper">
            <Search className="employee-manager-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, chức vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="employee-manager-search-input"
            />
          </div>
          <button
            onClick={handleAddEmployee}
            className="employee-manager-add-btn"
          >
            <UserPlus className="w-4 h-4" />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="employee-manager-body">
        {filteredEmployees.length === 0 ? (
          <div className="employee-manager-empty">
            <Users className="employee-manager-empty-icon" />
            <p className="employee-manager-empty-text">
              {searchTerm ? 'Không tìm thấy nhân viên nào' : 'Chưa có nhân viên nào'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddEmployee}
                className="employee-manager-empty-add-btn"
              >
                Thêm nhân viên đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="employee-manager-grid">
            {filteredEmployees.map((employee) => {
              const deadline = getEmployeeDeadline(employee.id);
              const assignmentCount = getEmployeeAssignments(employee.id).length;
              
              return (
                <div
                  key={employee.id}
                  className="employee-manager-card"
                >
                  <div className="employee-manager-card-content">
                    <div className="employee-manager-card-info">
                      <div className="employee-manager-card-header">
                        <div className="employee-manager-avatar">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="employee-manager-name">
                            {employee.name}
                          </h3>
                          {employee.position && (
                            <span className="employee-manager-position">
                              {employee.position}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="employee-manager-details">
                        {employee.email && (
                          <div className="flex items-center gap-2">
                            <span className="employee-manager-detail-label">Email:</span>
                            <span className="employee-manager-detail-value">{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center gap-2">
                            <span className="employee-manager-detail-label">ĐT:</span>
                            <span className="employee-manager-detail-value">{employee.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="employee-manager-detail-label employee-manager-assignments">
                            {assignmentCount} ca làm việc
                          </span>
                        </div>
                      </div>

                      {deadline && (
                        <div className="employee-manager-deadline">
                          <Calendar className="w-4 h-4" />
                          <span>Deadline gần nhất: {new Date(deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="employee-manager-card-actions">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="employee-manager-action-btn employee-manager-edit-btn"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="employee-manager-action-btn employee-manager-delete-btn"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="employee-manager-footer">
        <span>
          Hiển thị {filteredEmployees.length} / {activeEmployees.length} nhân viên
        </span>
        <button
          onClick={onClose}
          className="employee-manager-close-footer-btn"
        >
          Đóng
        </button>
      </div>

      {/* Employee Modal */}
      {isEmployeeModalOpen && (
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          onDelete={onDeleteEmployee}
        />
      )}
    </Modal>
  );
};

export default EmployeeModalManager;
