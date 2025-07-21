# AI Business App

แอปพลิเคชันธุรกิจอัจฉริยะที่ใช้เทคโนโลยี AI และ RAG (Retrieval-Augmented Generation) เพื่อช่วยในการจัดการข้อมูล การวิเคราะห์ และการทำงานร่วมกัน

**สถานะปัจจุบัน (As of July 2025):** โปรเจกต์นี้ได้ผ่านการ Refactor โครงสร้างครั้งใหญ่เพื่อเตรียมความพร้อมสำหรับการพัฒนาต่อยอด

## 🚀 การเปลี่ยนแปลงล่าสุด

- **จัดระเบียบโครงสร้างโปรเจกต์:** แยกโค้ด Backend (Flask) และ Frontend (React) ออกจากกันอย่างชัดเจน
- **อัปเกรดสภาพแวดล้อม:** เปลี่ยนมาใช้ **Python 3.11** เพื่อความเสถียรและรองรับไลบรารีทั้งหมด
- **แก้ไข Dependencies:** แก้ไขและติดตั้ง Dependencies ทั้งหมดให้ทำงานร่วมกันได้อย่างถูกต้อง
- **Refactor UI:** แก้ไข Frontend component ให้ใช้ **Material-UI** เป็นหลักเพื่อความสอดคล้องกัน

## 🚀 ฟีเจอร์หลัก

- **ระบบ RAG และการนำเข้าไฟล์** - รองรับไฟล์หลากหลายรูปแบบ (PDF, HTML, CSV, DOCX, MD, TXT)
- **ระบบแชทแบบเรียลไทม์** - สตรีมข้อความและแจ้งเตือน
- **Dashboard และ Data Visualization** - แสดงข้อมูลสถิติและกราฟ
- **Work Storage และ Profile Management** - จัดการงานและโปรไฟล์
- **Content Sharing และ Embedding** - แชร์เนื้อหาหลายรูปแบบ
- **AI ช่วยสร้าง Mind Map, Board, Graph** - สร้างแผนภาพและกราฟแบบอัตโนมัติ

## 🏗️ สถาปัตยกรรม

```
ai-business-app/
├── backend/           # Flask API Server
│   ├── src/          # Source code
│   ├── main.py       # Entry point
│   └── requirements.txt
├── frontend/         # React Application
│   ├── src/          # React components
│   ├── public/       # Static files
│   └── package.json
├── docs/             # Documentation
└── README.md
```

## 🛠️ เทคโนโลยีที่ใช้

### Backend
- **Python 3.11**
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **FAISS** - Vector search
- **Sentence Transformers** - Text embeddings
- **Socket.IO** - Real-time communication
- **Celery** - Background tasks

### Frontend
- **React.js** - UI framework
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **React Flow** - Mind maps and graphs
- **Socket.IO Client** - Real-time features

### AI Models
- **Google Gemini 2.5 Flash**
- **Hugging Face Models**

## 🚀 การติดตั้งและรันโปรเจ็กต์

### ข้อกำหนดระบบ
- Python 3.11+
- Node.js 20+
- Redis (สำหรับ Celery)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# สร้างไฟล์ .env จาก template
cp .env.template .env
# แก้ไข .env ใส่ API keys และการตั้งค่าต่างๆ

# รันแอป
python main.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend จะรันที่ `http://localhost:3000` (หรือ port อื่นถ้า 3000 ไม่ว่าง)

### Redis Setup (สำหรับ Background Tasks)

```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# ดาวน์โหลดจาก https://redis.io/download
```

## 📚 Documentation

รายละเอียดเพิ่มเติมอยู่ในโฟลเดอร์ `docs/`:

- [คู่มือการใช้งาน](docs/คู่มือการใช้งาน_AI_Business_App.md)
- [คู่มือการ Deploy](docs/คู่มือการ_Deploy_AI_Business_App_2.md)
- [รายงานการทดสอบ](docs/รายงานการทดสอบแอปพลิเคชัน_AI_Business_App_(เวอร์ชั.md)
- [สรุปการพัฒนา](docs/สรุปการพัฒนา_AI_Business_App_(เวอร์ชันแก้ไข).md)

## 🔧 การกำหนดค่า

### Environment Variables (.env)

```env
# Database
DATABASE_URL=sqlite:///ai_business_app.db

# AI API Keys
GOOGLE_API_KEY=your-google-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# External Integrations
NOTION_API_KEY=your-notion-api-key
N8N_WEBHOOK_URL=your-n8n-webhook-url

# Redis
REDIS_URL=redis://localhost:6379/0
```

## 🚀 Production Deployment

ดู [คู่มือการ Deploy](docs/คู่มือการ_Deploy_AI_Business_App_2.md) สำหรับรายละเอียดการ deploy

## 🤝 Contributing

1. Fork โปรเจ็กต์
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจ็กต์นี้ใช้สิทธิ์แบบ MIT License

## 📞 ติดต่อ

หากมีคำถามหรือต้องการความช่วยเหลือ สามารถติดต่อผ่าน Issues ใน GitHub

---

## 📈 สถานะการพัฒนา

- ✅ Phase 1-10: เสร็จสิ้นแล้ว
- ✅ ระบบ RAG และการนำเข้าไฟล์
- ✅ ระบบแชทแบบเรียลไทม์
- ✅ Dashboard และ Data Visualization
- ✅ Work Storage และ Profile Management
- ✅ Content Sharing และ Embedding
- ✅ AI Mind Map, Board, Graph Generator

ดูรายละเอียดใน [todo.md](todo.md)
