# สร้าง backend สำหรับตัวแปล KaraThai ด้วย Lovable AI Gateway

## สรุปสถานะปัจจุบัน

- แอปรันบน TanStack Start v1 + Vite 7 + Cloudflare Worker (nitro)
- ตัวแปลทำงานฝั่งเบราว์เซอร์ทั้งหมดใน `src/lib/translate/index.ts`
- ใช้ dictionary กับ phonetic fallback ภายในโค้ด ไม่มีการเรียก API ภายนอก
- ไม่มีฐานข้อมูล ไม่มี server function ไม่มี Lovable Cloud/Supabase

## เป้าหมาย

ย้ายตัวแปลไปทำงานฝั่ง server ด้วย Lovable AI Gateway เพื่อให้ได้คุณภาพการแปลแบบ contextual ตาม concept "พร้อมต่อยอดเป็น AI translator" โดยยังคง UX หน้าเดียวและ dictionary เป็น fallback สำหรับคำทั่วไป.

## ขั้นตอนการทำงาน

1. สร้าง server function สำหรับแปลภาษา
   - ไฟล์: `src/lib/translate.functions.ts`
   - รับ input: `{ text, from, to }`
   - เรียก Lovable AI Gateway ผ่าน AI SDK
   - ใช้ model เริ่มต้น `google/gemini-3.7-flash`
   - prompt เน้นการตีความจากเสียงและบริบท ไม่ใช่ character mapping

2. สร้าง provider helper สำหรับ Lovable AI Gateway
   - ไฟล์: `src/lib/ai-gateway.server.ts`
   - ใช้ `@ai-sdk/openai-compatible`
   - baseURL: `https://ai.gateway.lovable.dev/v1`
   - ส่ง `LOVABLE_API_KEY` ผ่าน header `Lovable-API-Key`

3. อัปเดต client-side translator
   - ไฟล์: `src/lib/translate/index.ts`
   - เปลี่ยน `translate()` ให้เรียก server function แทนการประมวลผลฝั่ง client
   - เก็บ dictionary ไว้เป็น fallback กรณี AI ล้มเหลวหรือไม่มี API key

4. ตรวจสอบและ provision `LOVABLE_API_KEY`
   - ตรวจสอบว่ามี key ใน project หรือไม่
   - หากไม่มีให้สร้างผ่าน tool

5. ทดสอบการทำงาน
   - ทดสอบแปลคำและประโยคทั้งสองทิศทาง
   - ตรวจสอบว่าไม่ expose API key ไปยัง client
   - ตรวจสอบ error handling สำหรับกรณี AI Gateway ล้มเหลว

## ข้อกำหนดทางเทคนิค

- ไม่เพิ่มฐานข้อมูล ไม่เพิ่ม authentication ตามข้อจำกัดเดิม
- API key ต้องอยู่ฝั่ง server เท่านั้น
- คงรูปแบบ SPA หน้าเดียวไว้เหมือนเดิม
- ไม่เปลี่ยนแปลง UI หลัก นอกจากอาจเพิ่มสถานะ "กำลังแปลด้วย AI" ให้ชัดเจนขึ้น
