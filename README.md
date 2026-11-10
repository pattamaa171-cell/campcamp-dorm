# Camp Camp Dormitory Management System

ระบบบริหารจัดการหอพัก CAMP CAMP ครบวงจร (หอพักแคมป์แคมป์)
รองรับทั้งระบบผู้ดูแลหอพัก (Admin Portal) และระบบผู้เช่า (Tenant Portal)

---

## 🚀 ฟีเจอร์หลัก (Key Features)

### 1. ระบบผู้ดูแลหอพัก (Admin Portal)
- **ภาพรวมและแดชบอร์ด (Dashboard)**: แสดงสถานะห้องพัก, รายรับประจำเดือน, และอัตราการเข้าพัก
- **จัดการห้องพัก (Room Management)**: เพิ่ม แก้ไข สถานะห้องพัก (ว่าง, มีผู้เช่า, ซ่อมบำรุง) และกำหนดราคาค่าเช่า
- **จัดการผู้เช่า (Tenants)**: บันทึกข้อมูลผู้พักอาศัย สัญญาเช่า ข้อมูลติดต่อ และมิเตอร์น้ำ-ไฟ
- **การเงินและออกบิล (Billing & Invoices)**: คำนวณค่าน้ำ ค่าไฟ และค่าเช่าอัตโนมัติ พร้อมส่งใบแจ้งหนี้
- **ตรวจสอบการชำระเงิน (Payments & Slips)**: ตรวจสอบสลิปการโอนเงินและอนุมัติการชำระ
- **แจ้งซ่อมและประกาศ (Maintenance & Announcements)**: ติดตามสถานะงานซ่อม และส่งประกาศข่าวสารให้ผู้เช่า
- **สำรองและกู้คืนข้อมูล (Backup & Restore)**: Export/Import ข้อมูลระบบในรูปแบบ JSON

### 2. ระบบผู้เช่า (Tenant Portal)
- เข้าสู่ระบบด้วยเลขห้องและรหัสผ่าน
- ดูใบแจ้งหนี้ประจำเดือน ยอดเงิน และประวัติการชำระ
- แนบสลิปเพื่อแจ้งชำระเงินออนไลน์
- ส่งคำขอแจ้งซ่อมพร้อมระบุรายละเอียด
- ดูประกาศสำคัญจากทางหอพัก

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Build Tool**: Vite
- **Backend / API**: Node.js, Express, TSX
- **Database**: Google Cloud Firestore (Firebase) พร้อม Local Fallback Persistence

---

## 💻 วิธีการติดตั้งและรันโปรเจกต์ (Installation & Running)

1. **ติดตั้ง Dependencies**:
   ```bash
   npm install
   ```

2. **เริ่มรันระบบในโหมด Development**:
   ```bash
   npm run dev
   ```
   เปิดบราวเซอร์ไปที่: `http://localhost:3000`

3. **Build สำหรับ Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🐙 วิธีนำโค้ดขึ้น GitHub (Push to GitHub)

หากคุณแตกไฟล์ ZIP นี้ลงในเครื่องของคุณ และต้องการแชร์โค้ดขึ้น GitHub:

```bash
git init
git add .
git commit -m "feat: initial commit for Camp Camp Dormitory System"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```
