# AI Business App Documentation (TH/EN)

เอกสารนี้ให้ภาพรวมที่ครอบคลุมของ AI Business App รวมถึงสถาปัตยกรรม ฟีเจอร์ และคู่มือการใช้งาน
This document provides a comprehensive overview of the AI Business App, including its architecture, features, and user guide.

---

## 1. ภาพรวมโครงการ / Project Overview

**TH:** AI Business App เป็นแอปพลิเคชันธุรกิจอัจฉริยะที่ได้รับการพัฒนาขึ้นเพื่อตอบสนองความต้องการของผู้ใช้ในการจัดการข้อมูล การวิเคราะห์ และการทำงานร่วมกัน โดยใช้เทคโนโลยี AI และ RAG (Retrieval-Augmented Generation)

**EN:** AI Business App is an intelligent business application designed to meet user needs for data management, analysis, and collaboration, utilizing AI and Retrieval-Augmented Generation (RAG) technology.

### 1.1. ฟีเจอร์หลัก / Key Features

- **TH:** **RAG และการนำเข้าไฟล์**: รองรับไฟล์หลากหลายรูปแบบ (PDF, HTML, CSV, DOCX, MD, TXT) และเชื่อมต่อกับ Notion เพื่อการดึงข้อมูลที่มีประสิทธิภาพ
- **EN:** **RAG and File Import**: Supports various file formats (PDF, HTML, CSV, DOCX, MD, TXT) and integrates with Notion for efficient data retrieval.

- **TH:** **แชทและการแจ้งเตือน**: สตรีมข้อความแบบเรียลไทม์และการแจ้งเตือนสำหรับงานที่เสร็จสิ้น
- **EN:** **Chat and Notifications**: Real-time message streaming and notifications for completed tasks.

- **TH:** **แดชบอร์ดและการแสดงผลข้อมูล**: ข้อมูลสถิติ กราฟ และข้อมูลเชิงลึกจากการใช้งานระบบ
- **EN:** **Dashboard and Data Visualization**: Statistical data, graphs, and insights from system usage.

- **TH:** **การสร้างและแชร์เนื้อหา**: AI ช่วยสร้างบอร์ด, mind maps, และกราฟ พร้อมตัวเลือกการแชร์และฝังที่ง่ายดาย
- **EN:** **Content Creation and Sharing**: AI-assisted creation of boards, mind maps, and graphs, with easy sharing and embedding options.

- **TH:** **การสร้าง Prompt และเครื่องมือ**: เครื่องมือสำหรับสร้างและจัดการ AI prompts และเครื่องมือที่กำหนดเอง
- **EN:** **Prompt and Tool Generation**: Tools for creating and managing AI prompts and custom tools.

### 1.2. เทคโนโลยีที่ใช้ / Technology Stack

- **Frontend**: React.js, Material-UI, Recharts, React Flow, Socket.IO
- **Backend**: Flask, SQLAlchemy, FAISS, Sentence Transformers, Socket.IO
- **AI Models**: Google Gemini, Hugging Face Models, n8n for workflow automation
- **Database**: SQLite (Development), PostgreSQL (Production)
- **External Integrations**: Notion, Google Sheets, Airtable

## 2. สถาปัตยกรรมระบบ / System Architecture

**TH:** แอปพลิเคชันใช้สถาปัตยกรรมแบบ Microservices:
- **Frontend Service**: จัดการ UI/UX
- **Backend Service**: ให้บริการ API, ประมวลผลข้อมูล, และเชื่อมต่อกับฐานข้อมูลและบริการภายนอก
- **AI Service**: จัดการการประมวลผล RAG และการโต้ตอบกับโมเดล AI
- **Storage Service**: จัดการการจัดเก็บไฟล์และการสำรองข้อมูล
- **Integration Service**: จัดการการเชื่อมต่อกับ API ภายนอก

**EN:** The application uses a microservices architecture:
- **Frontend Service**: Manages the UI/UX.
- **Backend Service**: Provides APIs, handles data processing, and connects to databases and external services.
- **AI Service**: Manages RAG processing and AI model interactions.
- **Storage Service**: Handles file storage and backups.
- **Integration Service**: Manages connections to external APIs.

## 3. คู่มือการใช้งาน / User Guide

### 3.1. การเริ่มต้นใช้งาน / Getting Started

- **TH:** **การลงทะเบียนและเข้าสู่ระบบ**: สร้างบัญชีหรือเข้าสู่ระบบ
- **EN:** **Registration and Login**: Create an account or log in.

- **TH:** **การตั้งค่าโปรไฟล์**: อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์ของคุณ
- **EN:** **Profile Setup**: Update your personal information and profile picture.

### 3.2. ฟีเจอร์หลัก (สรุป) / Main Features (Summary)

- **Dashboard**: ดูข้อมูลสรุปและสถิติการใช้งานระบบ
- **Chat**: สนทนากับ AI โดยใช้ RAG เพื่อตอบคำถามจากเอกสารของคุณ
- **RAG and Search**: อัปโหลดเอกสารหรือเชื่อมโยงหน้า Notion เพื่อการดึงข้อมูลที่รวดเร็วและแม่นยำ
- **Workspace**: จัดระเบียบและจัดการงานและโปรเจกต์ของคุณ
- **Content Sharing**: แชร์เนื้อหาในรูปแบบต่างๆ (Word, MD, URL) หรือฝังลงบนเว็บไซต์อื่น
- **Board, Graph View, Mind Map**: สร้างและแก้ไขบอร์ดแบบ Miro, กราฟวิวแบบ Obsidian, และ mind maps
- **Prompt/Tool Generator**: สร้างและจัดการ prompts และเครื่องมือสำหรับ AI

---

*This document consolidates information from `readme2.md` and `readme4.md`.*
