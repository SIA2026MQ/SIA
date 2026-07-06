import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { prisma } from './core/services/db.service';

const TARGET_DIR = path.join(__dirname, '../legacy-data');

// 🚨 SMART DATE PARSER: Handles both US and Indian/European WordPress Date Exports
function parseDateSafe(dateString: string): Date {
  if (!dateString) return new Date();

  dateString = dateString.trim();

  // Check if format is DD-MM-YYYY or DD/MM/YYYY (e.g., "25-06-2024 13:04")
  const ddMmYyyyMatch = dateString.match(/^(\d{2})[-/](\d{2})[-/](\d{4})\s*(.*)$/);

  if (ddMmYyyyMatch) {
    const [_, day, month, year, time] = ddMmYyyyMatch;
    // Rearrange to standard ISO format (YYYY-MM-DD) so Node.js can read it safely
    const cleanTime = time ? time + ':00' : '00:00:00';
    const isoString = `${year}-${month}-${day}T${cleanTime}.000Z`;
    const parsedDate = new Date(isoString);

    if (!isNaN(parsedDate.getTime())) return parsedDate;
  }

  // Fallback for native formats (e.g., "2024-11-04 11:29:04")
  const fallbackDate = new Date(dateString);
  return isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate;
}

async function parseAndSeedFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const legacyRecords: any[] = [];
    const fileName = path.basename(filePath);

    console.log(`⏳ Reading file: ${fileName}...`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Only process completed orders with a valid email
        if (row['Email (Billing)'] && row['Order Status'] === 'Completed') {

          legacyRecords.push({
            // 🚨 Keep ONLY the required fields for minimum bloat
            orderNumber: String(row['Order Number'] || 'Unknown'),
            email: row['Email (Billing)'].trim().toLowerCase(),
            firstName: row['First Name (Billing)'] || '',
            lastName: row['Last Name (Billing)'] || '',
            courseName: row['Item Name'] ? row['Item Name'].trim() : 'Unknown Course',
            purchasedAt: parseDateSafe(row['Order Date']),
          });

        }
      })
      .on('end', async () => {
        if (legacyRecords.length === 0) {
          console.log(`⚠️ No completed records found in ${fileName}.`);
          resolve();
          return;
        }

        try {
          // Push to the database securely
          const result = await prisma.legacyOrder.createMany({
            data: legacyRecords,
            skipDuplicates: true,
          });
          console.log(`✅ Successfully ingested ${result.count} valid rows from ${fileName}`);
          resolve();
        } catch (error) {
          console.error(`❌ Failed to insert ${fileName} into Database:`, error);
          reject(error);
        }
      })
      .on('error', (err) => reject(err));
  });
}

async function main() {
  try {
    if (!fs.existsSync(TARGET_DIR)) {
      console.error(`❌ Folder not found at: ${TARGET_DIR}. Please create it and add your CSVs.`);
      return;
    }

    const files = fs.readdirSync(TARGET_DIR).filter(file => file.endsWith('.csv'));

    if (files.length === 0) {
      console.log('⚠️ No CSV files found inside the legacy-data folder.');
      return;
    }

    console.log(`🚀 Bulk Ingestion Started. Found ${files.length} CSV files.`);

    for (const file of files) {
      const fullPath = path.join(TARGET_DIR, file);
      await parseAndSeedFile(fullPath);
    }

    console.log('\n🎉 ALL DONE! System migration preparation complete. All data quarantined safely.');

  } catch (err) {
    console.error('❌ Critical execution failure:', err);
  } finally {
    // Gracefully close the connection pool when the script finishes
    await prisma.$disconnect();
  }
}

main();