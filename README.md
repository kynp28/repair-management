# Homglai Repair Tracking System — ร้านหอมไกล ชลบุรี

ระบบแจ้งซ่อมและติดตามสถานะงานซ่อมแบบเรียลไทม์ พัฒนาด้วย **Next.js (App Router)**, **Prisma ORM**, **MySQL 8.0 (Docker)** และ **Swagger UI** สำหรับทดสอบ API

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (สำหรับทีมพัฒนา)

### 1. ติดตั้งแพ็กเกจ
```bash
npm install
```

### 2. รันฐานข้อมูล MySQL 8.0 ด้วย Docker
เปิด Docker Desktop แล้วรันคำสั่ง:
```bash
docker compose up -d
```
*(MySQL จะทำงานที่พอร์ต `3307` ชื่อฐานข้อมูล `homglai_service` เพื่อไม่ให้ชนกับพอร์ต `3306` เดิมในเครื่อง)*

### 3. ตั้งค่าไฟล์ `.env` และเตรียมฐานข้อมูล (Prisma)
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```bash
cp .env.example .env
```
ภายในไฟล์ `.env` จะใช้ค่า:
```env
DATABASE_URL="mysql://root:rootpassword123@localhost:3307/homglai_service"
```

จากนั้นรันคำสั่งสร้างตาราง (Migration) และนำเข้าข้อมูลตัวอย่าง (Seed):
```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

### 4. รันเซิร์ฟเวอร์และเปิดหน้า Swagger API Docs
```bash
npm run dev
```
- 🌐 **หน้าเว็บหลัก**: [http://localhost:3000](http://localhost:3000)
- 📄 **หน้า Swagger UI (ทดสอบยิง API)**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- 🔗 **OpenAPI JSON Spec**: [http://localhost:3000/api/doc](http://localhost:3000/api/doc)

---

## 📌 รายการ API Endpoints หลัก

| Method | Endpoint | คำอธิบาย |
| :--- | :--- | :--- |
| `GET` | `/api/catalog` | ดึงรายการอะไหล่และบริการมาตรฐานทั้งหมด |
| `POST` | `/api/catalog` | เพิ่มรายการอะไหล่/บริการใหม่เข้าคลัง |
| `GET` | `/api/repair-orders` | ดึงรายการใบแจ้งซ่อมทั้งหมด (กรอง `status` หรือค้นหา `search`) |
| `POST` | `/api/repair-orders` | พนักงานหน้าร้านสร้างใบรับซ่อมใหม่ (สร้างลูกค้าใหม่อัตโนมัติถ้ายังไม่มีเบอร์โทร) |
| `GET` | `/api/repair-orders/[id]` | ดูรายละเอียดใบแจ้งซ่อมตาม ID |
| `PATCH` | `/api/repair-orders/[id]/quote` | ช่างบันทึกผลตรวจเช็ค อัปเดตรายการอะไหล่ คำนวณยอดรวม และเปลี่ยนสถานะรออนุมัติ |
| `PATCH` | `/api/repair-orders/[id]/status` | ช่าง/แอดมินอัปเดตสถานะงานซ่อมแบบเรียลไทม์ |
| `GET` | `/api/track/[trackingUuid]` | ลูกค้าดูสถานะใบงานซ่อม รายการอะไหล่ และยอดรวมแบบไม่ต้องล็อกอิน |
| `POST` | `/api/track/[trackingUuid]/approve` | ลูกค้ากดอนุมัติซ่อม (`APPROVE`) หรือยกเลิกซ่อม (`CANCEL`) |
