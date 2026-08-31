import dotenv from "dotenv";
dotenv.config();
import { query } from "../db";

async function createLogsTable() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS admin_activity_logs (
                id SERIAL PRIMARY KEY,
                admin_name VARCHAR(255) NOT NULL,
                action VARCHAR(255) NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Activity logs table verified/created.");
    } catch(e: any) {
        console.error(e.message);
    } finally {
        process.exit();
    }
}
createLogsTable();
