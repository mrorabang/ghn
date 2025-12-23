import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const ShiftModal = ({ 
  shift, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    requiredEmployees: 1,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || '',
        description: shift.description || '',
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        requiredEmployees: shift.requiredEmployees || 1,
        active: shift.active !== false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        startTime: '',
        endTime: '',
        requiredEmployees: 1,
        active: true,
      });
    }
    setErrors({});
  }, [shift, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên ca làm việc không được để trống';
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (start >= end) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }
    
    if (formData.requiredEmployees < 1 || formData.requiredEmployees > 50) {
      newErrors.requiredEmployees = 'Số lượng nhân viên phải từ 1-50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      toast.success(shift ? 'Cập nhật ca làm việc thành công!' : 'Thêm ca làm việc thành công!');
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu ca làm việc:', error);
      toast.error('Không thể lưu ca làm việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      setLoading(true);
      try {
        await onDelete(shift.id);
        toast.success('Xóa ca làm việc thành công!');
        onClose();
      } catch (error) {
        console.error('Lỗi khi xóa ca làm việc:', error);
        toast.error('Không thể xóa ca làm việc. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {shift ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="space-y-4">
            <div className="modal-form-group">
              <label className="modal-label">
                Tên ca làm việc <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`modal-input ${errors.name ? 'error' : ''}`}
                placeholder="VD: Ca Sáng, Ca Tối, Giao hàng HCM"
                disabled={loading}
              />
              {errors.name && (
                <p className="modal-error">{errors.name}</p>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="modal-textarea"
                placeholder="Mô tả chi tiết về ca làm việc"
                disabled={loading}
              />
            </div>

            <div className="modal-grid-2">
              <div className="modal-form-group">
                <label className="modal-label">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Bắt đầu
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="modal-input"
                  disabled={loading}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Kết thúc
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`modal-input ${errors.endTime ? 'error' : ''}`}
                  disabled={loading}
                />
                {errors.endTime && (
                  <p className="modal-error">{errors.endTime}</p>
                )}
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Số lượng nhân viên cần <span className="required">*</span>
              </label>
              <input
                type="number"
                name="requiredEmployees"
                value={formData.requiredEmployees}
                onChange={handleChange}
                min="1"
                max="50"
                className={`modal-input ${errors.requiredEmployees ? 'error' : ''}`}
                disabled={loading}
              />
              {errors.requiredEmployees && (
                <p className="modal-error">{errors.requiredEmployees}</p>
              )}
            </div>

            <div className="modal-checkbox-group">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="modal-checkbox"
                disabled={loading}
              />
              <label htmlFor="active" className="modal-label">
                Đang hoạt động
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="modal-error-box">
              <p>{errors.submit}</p>
            </div>
          )}

          <div className="modal-footer">
            <div className="modal-footer-left">
              {shift && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="modal-btn modal-btn-danger"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              )}
            </div>
            <div className="modal-footer-right">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="modal-btn modal-btn-secondary"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="modal-btn modal-btn-primary"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
