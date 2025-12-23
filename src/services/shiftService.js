// Firestore service: shifts (deadline / ca làm việc) - CRUD đầy đủ
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

const shiftsCol = collection(db, 'shifts');

// Lấy tất cả ca làm việc (active)
export async function getShifts() {
  const q = query(shiftsCol, where('active', '==', true));
  const snap = await getDocs(q);
  const shifts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return shifts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

// Lấy ca làm việc theo ID
export async function getShiftById(id) {
  const ref = doc(db, 'shifts', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Thêm ca làm việc mới
export async function addShift(data) {
  const docRef = await addDoc(shiftsCol, {
    ...data,
    requiredEmployees: data.requiredEmployees ?? 1,
    active: data.active ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Cập nhật ca làm việc
export async function updateShift(id, data) {
  const ref = doc(db, 'shifts', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa ca làm việc (soft delete)
export async function softDeleteShift(id) {
  const ref = doc(db, 'shifts', id);
  await updateDoc(ref, {
    active: false,
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa ca làm việc vĩnh viễn
export async function deleteShift(id) {
  const ref = doc(db, 'shifts', id);
  await deleteDoc(ref);
  return id;
}

// Tìm kiếm ca làm việc theo tên
export async function searchShifts(searchTerm) {
  const q = query(
    shiftsCol,
    where('active', '==', true),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    orderBy('name')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Lấy ca làm việc theo khoảng thời gian
export async function getShiftsByTimeRange(startTime, endTime) {
  const q = query(
    shiftsCol,
    where('active', '==', true),
    where('startTime', '>=', startTime),
    where('endTime', '<=', endTime),
    orderBy('startTime')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Lấy số lượng ca làm việc active
export async function getActiveShiftCount() {
  const q = query(shiftsCol, where('active', '==', true));
  const snap = await getDocs(q);
  return snap.size;
}

// Kiểm tra tên ca đã tồn tại chưa
export async function checkShiftNameExists(name, excludeId = null) {
  let q = query(shiftsCol, where('name', '==', name));
  if (excludeId) {
    q = query(q, where('__name__', '!=', excludeId));
  }
  const snap = await getDocs(q);
  return !snap.empty;
}
