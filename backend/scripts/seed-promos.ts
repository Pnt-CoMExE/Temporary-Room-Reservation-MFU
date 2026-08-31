import dotenv from "dotenv";
dotenv.config();
import { query } from "../db";

async function createPromoTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS promo_codes (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                discount NUMERIC(10,2) NOT NULL,
                limit_count INT NOT NULL DEFAULT 100,
                is_active BOOLEAN DEFAULT TRUE
            );
        `);
        console.log("Promo codes table created.");
    } catch(e: any) {
        console.error(e.message);
    } finally {
        process.exit();
    }
}
createPromoTable();
