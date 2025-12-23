import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const EmployeeModal = ({ 
  employee, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        position: employee.position || '',
        active: employee.active !== false,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        active: true,
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhân viên không được để trống';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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
      toast.success(employee ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!');
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu nhân viên:', error);
      toast.error('Không thể lưu nhân viên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      setLoading(true);
      try {
        await onDelete(employee.id);
        toast.success('Xóa nhân viên thành công!');
        onClose();
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        toast.error('Không thể xóa nhân viên. Vui lòng thử lại.');
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
            {employee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
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
                Tên nhân viên <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`modal-input ${errors.name ? 'error' : ''}`}
                placeholder="Nhập tên nhân viên"
                disabled={loading}
              />
              {errors.name && (
                <p className="modal-error">{errors.name}</p>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`modal-input ${errors.email ? 'error' : ''}`}
                placeholder="email@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="modal-error">{errors.email}</p>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`modal-input ${errors.phone ? 'error' : ''}`}
                placeholder="0123456789"
                disabled={loading}
              />
              {errors.phone && (
                <p className="modal-error">{errors.phone}</p>
              )}
            </div>

            <div className="modal-form-group">
              <label className="modal-label">
                Chức vụ
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="modal-input"
                placeholder="Nhân viên, Quản lý, v.v."
                disabled={loading}
              />
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
                Đang làm việc
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
              {employee && onDelete && (
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

export default EmployeeModal;
