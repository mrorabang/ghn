import React, { useState, useEffect } from 'react';
import { X, Save, Clock } from 'lucide-react';
import { Shift } from '../types';

interface ShiftModalProps {
  shift?: Shift;
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({
  shift,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    required_employees: 1,
    is_active: true,
  });

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name,
        description: shift.description || '',
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        required_employees: shift.required_employees,
        is_active: shift.is_active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        start_time: '',
        end_time: '',
        required_employees: 1,
        is_active: true,
      });
    }
  }, [shift, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên ca làm việc');
      return;
    }
    if (formData.required_employees < 1) {
      alert('Số lượng nhân viên cần phải lớn hơn 0');
      return;
    }
    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {shift ? 'Sửa Ca Làm Việc' : 'Thêm Ca Làm Việc Mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên ca làm việc *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock size={16} className="inline mr-1" />
                Bắt đầu
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock size={16} className="inline mr-1" />
                Kết thúc
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng nhân viên cần *
            </label>
            <input
              type="number"
              name="required_employees"
              value={formData.required_employees}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Ca làm việc đang hoạt động
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              <Save size={16} />
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftModal;
