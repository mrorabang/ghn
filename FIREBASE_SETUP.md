# Hướng dẫn cài đặt Firebase cho ứng dụng phân ca

## 1. Tạo project Firebase

1. Vào [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Đặt tên (ví dụ: `ghn-truc-schedule`)
3. Bỏ qua Google Analytics (hoặc bật nếu muốn)
4. Click **"Create project"**

## 2. Thêm app Web

1. Trong project mới, click icon **</>** (Web)
2. Đặt tên app: `ghn-truc-web`
3. Click **"Register app"**
4. Copy đoạn **firebaseConfig** (dạng object)

## 3. Điền config vào code

Mở file `src/firebase.js` và thay thế các `REPLACE_ME_...`:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 4. Tạo Firestore Database

1. Trong Firebase Console, menu bên trái → **Firestore Database**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho phép đọc/ghi tự do trong 30 ngày)
4. Chọn vị trí (Asia/Southeast Asia)
5. Click **"Create"**

## 5. Tạo collections và dữ liệu mẫu

### Collection: `employees`

Tạo 3 documents:

```json
// Document 1
{
  "name": "Nguyễn Văn A",
  "email": "a@example.com",
  "phone": "0123456789",
  "position": "Nhân viên",
  "active": true
}

// Document 2  
{
  "name": "Trần Thị B",
  "email": "b@example.com", 
  "phone": "0987654321",
  "position": "Nhân viên",
  "active": true
}

// Document 3
{
  "name": "Lê Văn C",
  "email": "c@example.com",
  "phone": "0912345678", 
  "position": "Nhân viên",
  "active": true
}
```

### Collection: `shifts`

Tạo 3 documents:

```json
// Document 1
{
  "name": "Ca Sáng",
  "description": "Ca làm việc buổi sáng",
  "startTime": "08:00",
  "endTime": "12:00", 
  "requiredEmployees": 2,
  "active": true
}

// Document 2
{
  "name": "Ca Chiều", 
  "description": "Ca làm việc buổi chiều",
  "startTime": "13:00",
  "endTime": "17:00",
  "requiredEmployees": 2,
  "active": true
}

// Document 3
{
  "name": "Ca Tối",
  "description": "Ca làm việc buổi tối", 
  "startTime": "18:00",
  "endTime": "22:00",
  "requiredEmployees": 1,
  "active": true
}
```

### Collection: `assignments`

Tạo vài documents mẫu (thay `employeeId` và `shiftId` bằng ID thật từ collections trên):

```json
// Document 1
{
  "employeeId": "ID_NHAN_VIEN_A",
  "shiftId": "ID_CA_SANG", 
  "date": "2025-01-01",
  "status": "assigned",
  "notes": "Phân ca thử"
}

// Document 2
{
  "employeeId": "ID_NHAN_VIEN_B",
  "shiftId": "ID_CA_SANG",
  "date": "2025-01-01", 
  "status": "assigned"
}

// Document 3
{
  "employeeId": "ID_NHAN_VIEN_C",
  "shiftId": "ID_CA_CHIEU",
  "date": "2025-01-02",
  "status": "assigned"
}
```

## 6. Chạy ứng dụng

1. Đảm bảo đã cài `firebase`:
   ```bash
   npm install firebase
   ```

2. Khởi động:
   ```bash
   npm start
   ```

3. Mở `http://localhost:3000` → sẽ thấy bảng phân ca với dữ liệu từ Firebase

## 7. Kiểm tra lỗi

Nếu không thấy dữ liệu:

1. Mở browser console (F12) → xem lỗi
2. Kiểm tra lại config trong `firebase.js`
3. Đảm bảo Firestore rules cho phép đọc/ghi (test mode)
4. Kiểm tra ID trong `assignments` có khớp với ID trong `employees`/`shifts`

## 8. Rules bảo mật (sau khi test)

Khi deploy production, vào Firestore → Rules và thay bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 2, 1);
    }
  }
}
```

Sau đó sẽ cần Firebase Authentication để bảo mật.
