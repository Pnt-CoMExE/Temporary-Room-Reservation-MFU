import dotenv from "dotenv";
dotenv.config();
import { query } from "../db";

async function createBannersTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS banners (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255),
                image_url TEXT,
                link VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE
            );
        `);
        const res = await query("SELECT COUNT(*) FROM banners");
        if (parseInt(res.rows[0].count as string) === 0) {
            await query(`
                INSERT INTO banners (title, image_url, link) VALUES 
                ('ต้อนรับเปิดเทอมใหม่ ลดราคาพื้นที่กิจกรรม 20%', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop', '/rooms'),
                ('เปิดให้บริการแล้ว! MFU Co-Working Space', 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&auto=format&fit=crop', '/rooms'),
                ('จองลานกิจกรรมประดู่แดงล่วงหน้า รับฟรีอุปกรณ์เสริม', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop', '/rooms')
            `);
        }
        console.log("Banners table created and seeded.");
    } catch(e: any) {
        console.error(e.message);
    } finally {
        process.exit();
    }
}
createBannersTable();
