# Solarian Production Deployment Guide 🚀
คู่มือการนำระบบ Solarian ขึ้นโฮสต์ออนไลน์สำหรับเปิดให้บริการสาธารณะ (Production Ready)

Solarian ออกแบบมาให้ deploy ได้อย่างรวดเร็ว เบา และปลอดภัยในคอนเทนเนอร์เดียว (All-in-One Multi-stage Container) โดยรวมทั้งหน้าเว็บ Single-Page App (React + Vite + Tailwind CSS v4) และ Backend Engine (FastAPI + Swiss Ephemeris JPL DE431 + SQLite/AES-256) เข้าไว้ด้วยกัน

---

## 1. คุณสมบัติของระบบ Production
- **Zero-Config Single Port:** รันทุกบริการผ่านพอร์ต `8000` พอร์ตเดียว (API + Web UI + Static Assets)
- **Persistent Data:** ข้อมูลผู้ใช้, ดวงชะตาที่เข้ารหัส AES-256, และสถานะสมาชิกถูกเก็บใน Docker Volume ไม่สูญหายเมื่อรีสตาร์ตหรืออัปเกรดเวอร์ชัน
- **Server-Side AI Security:** ระบบจัดการ Gemini API Key ในฝั่งเซิร์ฟเวอร์ ผู้ใช้ทั่วไปไม่ต้องนำ API Key มาเอง
- **Built-in Role & Monetization Control:** รองรับสถานะ Admin, Free, Premium, Pro ทันที

---

## 2. การ Deploy ผ่าน Docker Compose (แนะนำ)

### ขั้นตอนที่ 1: เตรียม Server (VPS)
รองรับทั้ง Ubuntu 22.04 / 24.04 LTS, Debian 12, หรือ Cloud Providers (DigitalOcean, Hetzner, AWS EC2, Google Cloud Compute)

```bash
# ติดตั้ง Docker และ Docker Compose บนเครื่องเซิร์ฟเวอร์
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### ขั้นตอนที่ 2: Clone โค้ดและตั้งค่าไฟล์ Environment
```bash
git clone <your-repo-url> solarian
cd solarian

# คัดลอกไฟล์ตั้งค่า
cp .env.example .env

# แก้ไขไฟล์ .env
nano .env
```

ใส่ค่าที่ต้องการ:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key...
ADMIN_EMAIL=admin@yourdomain.com
JWT_SECRET_KEY=ใส่คีย์สุ่ม_32_ตัวอักษร_เช่น_รัน_python3_-c_"import secrets; print(secrets.token_hex(32))"
```

### ขั้นตอนที่ 3: สั่งรันระบบ
```bash
docker compose up -d --build
```

ตรวจสอบสถานะการทำงาน:
```bash
docker compose ps
docker compose logs -f
```
ระบบจะเริ่มทำงานทันทีที่ `http://<YOUR_SERVER_IP>:8000`

---

## 3. การตั้งค่าโดเมนและทำ HTTPS ฟรีด้วย Caddy (ง่ายและปลอดภัยที่สุด)

ติดตั้ง Caddy เพื่อผูกโดเมนและรับใบรับรอง SSL/TLS (HTTPS) อัตโนมัติ:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

สร้างไฟล์ `/etc/caddy/Caddyfile`:
```caddy
yourdomain.com {
    reverse_proxy 127.0.0.1:8000
}
```

สั่งรีโหลด Caddy:
```bash
sudo systemctl reload caddy
```
เพียงเท่านี้ เว็บไซต์ของคุณจะเปิดใช้งานผ่าน `https://yourdomain.com` ทันที!

---

## 4. การจัดการบัญชีแอดมิน (First Admin Setup)
1. เข้าไปที่หน้าเว็บ `https://yourdomain.com`
2. กดปุ่ม **"เข้าสู่ระบบ / สมัครสมาชิก"** ที่มุมขวาบน
3. สมัครสมาชิกด้วยอีเมลเดียวกับที่ระบุไว้ใน `ADMIN_EMAIL` (เช่น `admin@yourdomain.com`)
4. ระบบจะแต่งตั้งสิทธิ์ให้เป็น **Admin สูงสุด (Role: admin, Tier: pro)** โดยอัตโนมัติ
5. จะปรากฏเมนู **"แดชบอร์ดแอดมิน (Admin Panel)"** ใน Dropdown โปรไฟล์ขวาบน เพื่อใช้จัดการผู้ใช้คนอื่น ปรับ Tier และดูสถิติระบบ

---

## 5. การสำรองข้อมูล (Backup & Restore)
ฐานข้อมูล SQLite จะถูกเก็บไว้อย่างปลอดภัยใน Docker Volume:
```bash
# สำรองข้อมูลเป็นไฟล์ solarian_backup.db
docker run --rm -v solarian_solarian_data:/data -v $(pwd):/backup alpine cp /data/solarian.db /backup/solarian_backup.db
```
