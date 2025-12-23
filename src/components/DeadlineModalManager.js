import React, { useState } from 'react';
import Modal from 'react-modal';
import { X, Calendar, UserPlus, Edit2, Trash2, Clock, Users, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import ShiftModal from './ShiftModal';

Modal.setAppElement('#root');

const DeadlineModalManager = ({ 
  shifts, 
  assignments, 
  employees, 
  onAddShift, 
  onUpdateShift, 
  onDeleteShift,
  isOpen,
  onClose
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');

  const activeShifts = shifts.filter(s => s.active !== false);
  const filteredShifts = activeShifts.filter(shift =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shift.description && shift.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddShift = () => {
    setSelectedShift(null);
    setModalMode('add');
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift) => {
    setSelectedShift(shift);
    setModalMode('edit');
    setIsShiftModalOpen(true);
  };

  const handleDeleteShift = async (shift) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa deadline "${shift.name}"?`)) {
      try {
        await onDeleteShift(shift.id);
      } catch (error) {
        console.error('Lỗi khi xóa deadline:', error);
        toast.error('Không thể xóa deadline. Vui lòng thử lại.');
      }
    }
  };

  const handleSaveShift = async (formData) => {
    try {
      if (modalMode === 'add') {
        await onAddShift(formData);
      } else {
        await onUpdateShift(selectedShift.id, formData);
      }
      setIsShiftModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu deadline:', error);
      throw error;
    }
  };

  const getShiftAssignments = (shiftId) => {
    return assignments.filter(a => a.shiftId === shiftId && a.status !== 'deleted');
  };

  const getShiftEmployees = (shiftId) => {
    const shiftAssignments = getShiftAssignments(shiftId);
    return shiftAssignments.map(assignment => 
      employees.find(emp => emp.id === assignment.employeeId)
    ).filter(Boolean);
  };

  const formatShiftTime = (shift) => {
    if (!shift.startTime && !shift.endTime) return '';
    const start = shift.startTime ? shift.startTime.slice(0, 5) : '';
    const end = shift.endTime ? shift.endTime.slice(0, 5) : '';
    if (start && end) return `${start} - ${end}`;
    if (start) return `từ ${start}`;
    if (end) return `đến ${end}`;
    return '';
  };

  const formatRequired = (shift) => {
    const count = shift.requiredEmployees || 1;
    return `Cần ${count} nhân viên`;
  };

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
      <div className="deadline-manager-header">
        <div className="deadline-manager-title">
          <Calendar className="w-6 h-6" />
          <h2>Quản lý Deadline</h2>
          <span className="deadline-manager-badge">
            {activeShifts.length} deadline
          </span>
        </div>
        <button
          onClick={onClose}
          className="deadline-manager-close-btn"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="deadline-manager-search">
        <div className="deadline-manager-search-container">
          <div className="deadline-manager-search-input-wrapper">
            <Search className="deadline-manager-search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả deadline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="deadline-manager-search-input"
            />
          </div>
          <button
            onClick={handleAddShift}
            className="deadline-manager-add-btn"
          >
            <Calendar className="w-4 h-4" />
            Thêm deadline
          </button>
        </div>
      </div>

      {/* Deadline List */}
      <div className="deadline-manager-body">
        {filteredShifts.length === 0 ? (
          <div className="deadline-manager-empty">
            <Calendar className="deadline-manager-empty-icon" />
            <p className="deadline-manager-empty-text">
              {searchTerm ? 'Không tìm thấy deadline nào' : 'Chưa có deadline nào'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddShift}
                className="deadline-manager-empty-add-btn"
              >
                Thêm deadline đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="deadline-manager-grid">
            {filteredShifts.map((shift) => {
              const assignedEmployees = getShiftEmployees(shift.id);
              const assignmentCount = getShiftAssignments(shift.id).length;
              
              return (
                <div
                  key={shift.id}
                  className="deadline-manager-card"
                >
                  <div className="deadline-manager-card-content">
                    <div className="deadline-manager-card-info">
                      <div className="deadline-manager-card-header">
                        <div className="deadline-manager-avatar">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="deadline-manager-name">
                            {shift.name}
                          </h3>
                          {shift.description && (
                            <span className="deadline-manager-description">
                              {shift.description}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="deadline-manager-details">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="deadline-manager-detail-label">Thời gian:</span>
                          <span className="deadline-manager-detail-value">{formatShiftTime(shift)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="deadline-manager-detail-label">Yêu cầu:</span>
                          <span className="deadline-manager-detail-value">{formatRequired(shift)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="deadline-manager-detail-label deadline-manager-assignments">
                            {assignmentCount} nhân viên được phân
                          </span>
                        </div>
                      </div>

                      {assignedEmployees.length > 0 && (
                        <div className="deadline-manager-employees">
                          <div className="deadline-manager-employees-header">
                            <Users className="w-4 h-4" />
                            <span>Nhân viên được phân:</span>
                          </div>
                          <div className="deadline-manager-employee-list">
                            {assignedEmployees.slice(0, 3).map((employee) => (
                              <div key={employee.id} className="deadline-manager-employee-chip">
                                {employee.name}
                              </div>
                            ))}
                            {assignedEmployees.length > 3 && (
                              <div className="deadline-manager-employee-more">
                                +{assignedEmployees.length - 3} nữa
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="deadline-manager-card-actions">
                      <button
                        onClick={() => handleEditShift(shift)}
                        className="deadline-manager-action-btn deadline-manager-edit-btn"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteShift(shift)}
                        className="deadline-manager-action-btn deadline-manager-delete-btn"
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
      <div className="deadline-manager-footer">
        <span>
          Hiển thị {filteredShifts.length} / {activeShifts.length} deadline
        </span>
        <button
          onClick={onClose}
          className="deadline-manager-close-footer-btn"
        >
          Đóng
        </button>
      </div>

      {/* Shift Modal */}
      {isShiftModalOpen && (
        <ShiftModal
          shift={selectedShift}
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          onSave={handleSaveShift}
          onDelete={onDeleteShift}
        />
      )}
    </Modal>
  );
};

export default DeadlineModalManager;
