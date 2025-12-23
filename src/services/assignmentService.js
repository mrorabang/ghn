// Firestore service: assignments (lịch phân ca) - CRUD đầy đủ
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const assignmentsCol = collection(db, 'assignments');

// Lấy assignment theo khoảng ngày
export async function getAssignmentsByRange(startDate, endDate) {
  const q = query(
    assignmentsCol,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snap = await getDocs(q);
  const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return assignments.sort((a, b) => {
    const dateCompare = (a.date || '').localeCompare(b.date || '');
    if (dateCompare !== 0) return dateCompare;
    return (a.shiftId || '').localeCompare(b.shiftId || '');
  });
}

// Lấy assignment theo ID
export async function getAssignmentById(id) {
  const ref = doc(db, 'assignments', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Thêm assignment mới
export async function addAssignment(data) {
  const docRef = await addDoc(assignmentsCol, {
    ...data, // employeeId, shiftId, date, status, notes?
    status: data.status || 'assigned',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Cập nhật assignment
export async function updateAssignment(id, data) {
  const ref = doc(db, 'assignments', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa assignment (soft delete - chuyển status=deleted)
export async function softDeleteAssignment(id) {
  const ref = doc(db, 'assignments', id);
  await updateDoc(ref, {
    status: 'deleted',
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa assignment vĩnh viễn
export async function deleteAssignment(id) {
  const ref = doc(db, 'assignments', id);
  await deleteDoc(ref);
  return id;
}

// Lấy assignment theo nhân viên
export async function getAssignmentsByEmployee(employeeId, startDate, endDate) {
  const q = query(
    assignmentsCol,
    where('employeeId', '==', employeeId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    where('status', '!=', 'deleted')
  );
  const snap = await getDocs(q);
  const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return assignments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

// Lấy assignment theo ca
export async function getAssignmentsByShift(shiftId, startDate, endDate) {
  const q = query(
    assignmentsCol,
    where('shiftId', '==', shiftId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    where('status', '!=', 'deleted')
  );
  const snap = await getDocs(q);
  const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return assignments.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

// Lấy assignment theo ngày
export async function getAssignmentsByDate(date) {
  const q = query(
    assignmentsCol,
    where('date', '==', date),
    where('status', '!=', 'deleted')
  );
  const snap = await getDocs(q);
  const assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return assignments.sort((a, b) => (a.shiftId || '').localeCompare(b.shiftId || ''));
}

// Kiểm tra nhân viên đã được phân ca trong ngày chưa
export async function checkEmployeeAssignmentExists(employeeId, date, shiftId = null) {
  let q = query(
    assignmentsCol,
    where('employeeId', '==', employeeId),
    where('date', '==', date),
    where('status', '!=', 'deleted')
  );
  if (shiftId) {
    q = query(q, where('shiftId', '==', shiftId));
  }
  const snap = await getDocs(q);
  return !snap.empty;
}

// Bulk insert assignments (tạo nhiều assignment cùng lúc)
export async function bulkAddAssignments(assignments) {
  const results = [];
  for (const assignment of assignments) {
    try {
      const id = await addAssignment(assignment);
      results.push({ success: true, id, data: assignment });
    } catch (error) {
      results.push({ success: false, error, data: assignment });
    }
  }
  return results;
}

// Xóa tất cả assignments theo khoảng thời gian
export async function deleteAssignmentsByRange(startDate, endDate) {
  const q = query(
    assignmentsCol,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const snap = await getDocs(q);
  const deletePromises = snap.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  return snap.size;
}
