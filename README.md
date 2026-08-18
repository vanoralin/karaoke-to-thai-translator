# KaraThai Translate

สร้างเว็บไซต์ แปลภาษาคาราโอเกะ ↔ ภาษาไทย แบบ Single Page Application โดยเน้น UI ที่เรียบง่าย ทันสมัย และใช้งานง่าย ทุกอย่างจบภายในหน้าเดียว

Core Concept

เว็บไซต์สำหรับแปลงข้อความระหว่าง:

ภาษาไทย → ภาษาคาราโอเกะ

ภาษาคาราโอเกะ → ภาษาไทย

การแปล Karaoke → Thai ต้องพยายาม ตีความจากเสียงและบริบท ไม่ใช่จับคู่ตัวอักษรแบบตรงตัว

ตัวอย่าง:

ter → เธอ

chan → ฉัน

rao → เรา

khun → คุณ

mai pen rai → ไม่เป็นไร

รองรับทั้งคำเดี่ยวและประโยคยาว

Page Layout

ให้ทุกอย่างอยู่ใน หน้าเดียว ไม่ต้องมีหลายหน้า

Header

ด้านบนของหน้าให้มี:

KaraThai

Subtitle:
แปลภาษาคาราโอเกะ ↔ ไทย จากเสียงที่คุณตั้งใจสื่อ

จัดวางให้อยู่ตรงกลางและมีพื้นที่ว่างพอสมควร

Translation Box

วาง Translation Card ขนาดใหญ่ไว้ตรงกลางหน้า

ใช้ layout แบบ 2 columns บน Desktop

Left Panel

Dropdown เลือกภาษาต้นทาง

ไทย

Karaoke

Textarea ขนาดใหญ่

Placeholder:

ไทย: พิมพ์ภาษาไทยที่นี่...

Karaoke: phim karaoke tee nee...

Center

วางปุ่ม Swap ↔ ระหว่างสองช่อง

เมื่อกด:

สลับภาษาต้นทางและปลายทาง

สลับข้อความทั้งสองช่องถ้าเป็นไปได้

Right Panel

แสดงภาษาปลายทาง

พื้นที่แสดงผลลัพธ์ขนาดใหญ่

ปุ่ม คัดลอก ที่มุมด้านบนของผลลัพธ์

Translate Button

ด้านล่างของสองช่อง ให้มีปุ่มหลักขนาดใหญ่:

แปลภาษา

ใช้ turquoise เป็นสีหลักของปุ่ม

ด้านล่างปุ่มแสดงข้อความเล็กๆ:

ระบบจะตีความจากเสียงและบริบท ไม่ได้แปลแบบตัวอักษรต่ออักษร

Visual Design

ใช้ Turquoise Theme เป็น visual identity หลักของเว็บไซต์

Color Direction

ใช้โทน turquoise ที่ดูสด สะอาด และ modern เช่น:

Primary: #14B8A6

Primary Dark: #0F766E

Primary Light: #CCFBF1

Background: #F0FDFA

Card: #FFFFFF

Text: #134E4A

Secondary Text: #64748B

ไม่ใช้สีเยอะเกินไป ให้ turquoise เป็น accent หลักของ interface

Overall Style

Clean

Modern

Friendly

Minimal

Soft rounded corners

Subtle shadows

Plenty of whitespace

ไม่ดูเป็นเว็บแปลภาษาที่แข็งหรือเป็นทางการเกินไป

ให้ความรู้สึกเหมือนเครื่องมือเล็กๆ ที่ใช้งานสนุกและเข้าใจง่าย

ใช้ border-radius ประมาณ 16-20px

ใช้ shadow แบบ subtle เท่านั้น ไม่ต้องมีเงาหนัก

Typography

ใช้ font ที่รองรับภาษาไทยได้ดี เช่น:

Noto Sans Thai

Typography ต้องอ่านง่ายและมี hierarchy ชัดเจน

Logo: ใหญ่และ bold

Heading: bold

Textarea: ขนาดประมาณ 18px

Result: ขนาดประมาณ 18px

Helper text: ขนาดเล็กและ muted

Responsive

Desktop:

Translation card อยู่ตรงกลาง

Input และ Output วางซ้าย-ขวา

Swap button อยู่ตรงกลาง

Mobile:

เปลี่ยนเป็น layout บน-ล่าง

Input อยู่ด้านบน

Swap button อยู่ระหว่าง Input และ Output

Output อยู่ด้านล่าง

ปุ่มแปลเต็มความกว้าง

ต้องใช้งานได้ดีบนหน้าจอมือถือขนาดประมาณ 390px

Interaction

เพิ่ม interaction เล็กน้อยเท่าที่จำเป็น:

Hover state ของปุ่ม

Focus state ของ textarea ใช้ turquoise border

Swap button มี hover effect

Copy button แสดงสถานะ คัดลอกแล้ว ชั่วคราว

Translate button แสดง loading state ระหว่างประมวลผล

ไม่ต้องใส่ animation เยอะ

Functionality

ตอนนี้ทำ translation logic แบบ mock/frontend ก่อน และออกแบบโครงสร้าง code ให้สามารถเปลี่ยนไปเรียก AI API ในอนาคตได้ง่าย

สำหรับ Karaoke → Thai ให้เน้น phonetic interpretation เช่น:

ter → เธอ

ไม่ควรแปลแบบ character mapping เช่น:

ter → เตอ

รองรับ:

คำเดี่ยว

หลายคำ

ประโยค

ตัวพิมพ์เล็ก/ใหญ่

การเว้นวรรคที่ไม่สมบูรณ์

Do NOT Add

อย่าสร้างฟีเจอร์เหล่านี้:

Login

Register

User Profile

Database

Translation History

Dashboard

Settings

Sidebar

Multiple pages

Subscription

Payment

Complex navigation

เว็บไซต์นี้ควรมี concept ง่ายๆ:

พิมพ์ → แปล → คัดลอก

ทำให้หน้าเว็บดู polished และพร้อมสำหรับการนำไปต่อยอดเป็น AI translator ในภายหลัง

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4d85d19b-c03c-4dfa-a70a-487e07a0cc04).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
