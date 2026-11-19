# VisionTrack Forecast

4-Zone Cafeteria Crowd Density Monitoring Demo (`All`, `Zone 1`, `Zone 2`, `Zone 3`, `Zone 4`).

## วิธีรันโปรเจกต์ (How to Run)

1. ตรวจสอบว่ามี **Node.js** (v18 ขึ้นไป) ติดตั้งในเครื่อง
2. นำไฟล์คลิปวิดีโอผลลัพธ์ของแต่ละโซนไปวางในโฟลเดอร์ `videos/` โดยตั้งชื่อไฟล์เป็น:
   - `zone1.mp4`
   - `zone2.mp4`
   - `zone3.mp4`
   - `zone4.mp4`
3. รันคำสั่ง:
   ```bash
   node server.mjs
   ```
4. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
