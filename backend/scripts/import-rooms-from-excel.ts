import path from "path";
import dotenv from "dotenv";
import { importRoomsFromExcelFile } from "../src/services/roomImport.service";

dotenv.config();

const defaultFile = path.resolve(__dirname, "../../data/room-pricing-rates.xlsx");
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultFile;

async function main() {
  console.log(`📂 Importing rooms from: ${filePath}`);
  const count = await importRoomsFromExcelFile(filePath);
  console.log(`✅ Imported ${count} room(s) successfully`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
