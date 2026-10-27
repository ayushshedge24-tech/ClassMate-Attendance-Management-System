/**
 * ClassMate — Safe Local MongoDB Database Export Utility
 * Exports all existing collections and records to JSON files in backups/
 * Does NOT delete, reset, or alter any database records.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_db';
const OUTPUT_DIR = path.join(__dirname, '../../backups/classmate_atlas_migration_export');

async function exportDatabase() {
  console.log('====================================================');
  console.log(' ClassMate — Local Database Export Utility');
  console.log(' Connecting to local MongoDB:', LOCAL_URI);
  console.log('====================================================');

  try {
    const conn = await mongoose.connect(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections to export.\n`);

    const summary = {};

    for (const col of collections) {
      const colName = col.name;
      const documents = await conn.connection.db.collection(colName).find({}).toArray();
      const filePath = path.join(OUTPUT_DIR, `${colName}.json`);

      fs.writeFileSync(filePath, JSON.stringify(documents, null, 2), 'utf8');
      summary[colName] = documents.length;
      console.log(`[Exported] ${colName.padEnd(20)}: ${documents.length.toString().padStart(6)} records -> ${filePath}`);
    }

    const manifest = {
      exportedAt: new Date().toISOString(),
      sourceUri: LOCAL_URI,
      collections: summary,
      totalCollections: collections.length,
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'export_manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf8'
    );

    console.log('\n====================================================');
    console.log(' EXPORT COMPLETED SUCCESSFULLY!');
    console.log(` Backup saved to: ${OUTPUT_DIR}`);
    console.log(' All records preserved safely.');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Export Error] Failed to export database:', err.message);
    process.exit(1);
  }
}

exportDatabase();
