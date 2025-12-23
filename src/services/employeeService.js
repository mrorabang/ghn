// Firestore service: employees (nhân viên) - CRUD đầy đủ
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

const employeesCol = collection(db, 'employees');

// Lấy tất cả nhân viên (active)
export async function getEmployees() {
  const q = query(employeesCol, where('active', '==', true));
  const snap = await getDocs(q);
  const employees = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side để tránh cần index
  return employees.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

// Lấy nhân viên theo ID
export async function getEmployeeById(id) {
  const ref = doc(db, 'employees', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Thêm nhân viên mới
export async function addEmployee(data) {
  const docRef = await addDoc(employeesCol, {
    ...data,
    active: data.active ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Cập nhật nhân viên
export async function updateEmployee(id, data) {
  const ref = doc(db, 'employees', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa nhân viên (soft delete - chuyển active=false)
export async function softDeleteEmployee(id) {
  const ref = doc(db, 'employees', id);
  await updateDoc(ref, {
    active: false,
    updatedAt: serverTimestamp(),
  });
  return id;
}

// Xóa nhân viên vĩnh viễn
export async function deleteEmployee(id) {
  const ref = doc(db, 'employees', id);
  await deleteDoc(ref);
  return id;
}

// Tìm kiếm nhân viên theo tên
export async function searchEmployees(searchTerm) {
  const q = query(
    employeesCol,
    where('active', '==', true),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff'),
    orderBy('name')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Kiểm tra email đã tồn tại chưa
export async function checkEmailExists(email, excludeId = null) {
  let q = query(employeesCol, where('email', '==', email));
  if (excludeId) {
    q = query(q, where('__name__', '!=', excludeId));
  }
  const snap = await getDocs(q);
  return !snap.empty;
}

// Lấy số lượng nhân viên active
export async function getActiveEmployeeCount() {
  const q = query(employeesCol, where('active', '==', true));
  const snap = await getDocs(q);
  return snap.size;
}
