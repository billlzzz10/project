# Changelog - AI Assistant Chrome Extension

## เวอร์ชัน 1.1 (Fixed) - 23 กรกฎาคม 2025

### 🔧 การแก้ไขปัญหา
- **แก้ไข Service Worker registration failed (Status code: 15)**
  - ปรับปรุง manifest.json ให้รองรับ Manifest V3 อย่างถูกต้อง
  - เพิ่ม `type: "module"` สำหรับ service worker
  - ปรับปรุง permissions และ host_permissions

- **แก้ไข Content Security Policy (CSP) errors**
  - ดาวน์โหลด Chart.js และ marked.js มาเก็บไว้ในโฟลเดอร์ local
  - ลบการใช้ CDN scripts ที่ถูกบล็อกโดย CSP
  - เพิ่ม CSP directive ที่เหมาะสม

- **แก้ไขปัญหาการตั้งค่า API Key**
  - ปรับปรุงระบบ storage API ให้รองรับทั้ง Chrome extension และ fallback
  - เพิ่ม modal สำหรับใส่ API Key ที่สวยงามและใช้งานง่าย
  - ปรับปรุงการจัดการ error handling

### ✨ การปรับปรุง
- **UI/UX ที่ดีขึ้น**
  - Modal สำหรับใส่ API Key ที่มีการออกแบบไซเบอร์พังค์
  - ปรับปรุงการแสดงข้อผิดพลาดให้ชัดเจนขึ้น
  - เพิ่มลิงก์ไปยัง OpenAI Platform สำหรับขอ API Key

- **ความเสถียรที่ดีขึ้น**
  - ปรับปรุงการจัดการ error และ fallback mechanisms
  - เพิ่มการตรวจสอบความพร้อมใช้งานของ libraries
  - ปรับปรุงการจัดการ async operations

### 📁 ไฟล์ที่เพิ่ม/แก้ไข
- `manifest.json` - ปรับปรุงเป็น Manifest V3 ที่ถูกต้อง
- `popup.html` - ลบ CDN scripts, ใช้ไฟล์ local
- `popup.js` - เพิ่ม API Key modal และปรับปรุง error handling
- `utils/ai_api.js` - ปรับปรุงระบบ storage และ fallback
- `chart.min.js` - เพิ่มไฟล์ Chart.js local
- `marked.min.js` - เพิ่มไฟล์ marked.js local
- `CHANGELOG.md` - ไฟล์นี้

### 🚀 การติดตั้งและใช้งาน
1. ดาวน์โหลดไฟล์ `ai-assistant-chrome-extension-fixed.zip`
2. แตกไฟล์และโหลดใน Chrome Extensions (Developer Mode)
3. ใส่ OpenAI API Key เมื่อได้รับการแจ้ง
4. เริ่มใช้งานได้ทันที

### 🔍 การทดสอบ
- ✅ Service Worker ลงทะเบียนสำเร็จ
- ✅ ไม่มี CSP errors
- ✅ API Key modal ทำงานถูกต้อง
- ✅ Chart.js และ marked.js โหลดจากไฟล์ local
- ✅ UI แสดงผลถูกต้องในธีมไซเบอร์พังค์

---

## เวอร์ชัน 1.0 - 23 กรกฎาคม 2025

### ✨ ฟีเจอร์เริ่มต้น
- 🤖 แชท AI พร้อม streaming response
- 📊 สร้างกราฟและแผนภูมิจากข้อมูล
- 🎨 UI ธีมไซเบอร์พังค์
- 📁 อัปโหลดและวิเคราะห์ไฟล์ข้อมูล
- 💾 ส่งออกการสนทนาและกราฟ

### 🐛 ปัญหาที่พบ (แก้ไขแล้วในเวอร์ชัน 1.1)
- Service Worker registration failed
- CSP errors จาก CDN scripts
- ปัญหาการตั้งค่า API Key

