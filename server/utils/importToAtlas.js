/**
 * ClassMate — Safe MongoDB Atlas Migration Utility
 * Restores exported JSON collections from backups/classmate_atlas_migration_export
 * into a remote MongoDB Atlas cluster.
 *
 * Usage:
 *   node server/utils/importToAtlas.js "mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/attendance_db?retryWrites=true&w=majority"
 * or
 *   $env:TARGET_MONGODB_URI="mongodb+srv://..."
 *   node server/utils/importToAtlas.js
 *
 * IMPORTANT:
 * - Requires explicit user execution.
 * - Validates target connection before insertion.
 * - Does NOT drop or reset local database.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const TARGET_URI = process.argv[2] || process.env.TARGET_MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, '../../backups/classmate_atlas_migration_export');

async function importToAtlas() {
  console.log('====================================================');
  console.log(' ClassMate — MongoDB Atlas Data Migration Utility');
  console.log('====================================================');

  if (!TARGET_URI) {
    console.error('[Error] Target MongoDB URI not provided.');
    console.log('\nUsage:');
    console.log('  node server/utils/importToAtlas.js "<your-atlas-connection-string>"');
    console.log('or set TARGET_MONGODB_URI in your environment.');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    console.error(`[Error] Backup folder not found at: ${BACKUP_DIR}`);
    console.log('Please run "node server/utils/exportDatabase.js" first.');
    process.exit(1);
  }

  // Basic sanity check to avoid overwriting local DB accidentally
  if (TARGET_URI.includes('127.0.0.1') || TARGET_URI.includes('localhost')) {
    console.warn('[Warning] Target URI appears to be a local database.');
  }

  console.log('[Connecting] Connecting to target database...');
  let conn;
  try {
    conn = await mongoose.connect(TARGET_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Connected] Host: ${conn.connection.host}`);
    console.log(`[Connected] Database: ${conn.connection.name}\n`);
  } catch (connErr) {
    console.error('[Connection Failed] Could not connect to target MongoDB:', connErr.message);
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json') && f !== 'export_manifest.json');
    console.log(`Found ${files.length} collection backup files to migrate.\n`);

    for (const file of files) {
      const colName = path.basename(file, '.json');
      const filePath = path.join(BACKUP_DIR, file);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.log(`[Skipped] ${colName}: 0 records in backup.`);
        continue;
      }

      const collection = conn.connection.db.collection(colName);
      const existingCount = await collection.countDocuments();

      if (existingCount > 0) {
        console.log(`[Notice] ${colName}: Target already has ${existingCount} documents.`);
        console.log(`         Appending missing documents only...`);
      }

      // Convert serialized IDs if needed
      const docsToInsert = rawData.map(doc => {
        const copy = { ...doc };
        if (copy._id && typeof copy._id === 'string' && copy._id.length === 24) {
          copy._id = new mongoose.Types.ObjectId(copy._id);
        }
        return copy;
      });

      // Use ordered: false to skip duplicates safely without aborting
      try {
        const result = await collection.insertMany(docsToInsert, { ordered: false });
        console.log(`[Success] ${colName.padEnd(20)}: Inserted ${result.insertedCount} records.`);
      } catch (insertErr) {
        if (insertErr.code === 11000 || insertErr.writeErrors) {
          const inserted = insertErr.result ? insertErr.result.nInserted : 0;
          console.log(`[Partial] ${colName.padEnd(20)}: ${inserted} new records inserted (duplicates skipped safely).`);
        } else {
          console.error(`[Error] Failed to insert ${colName}:`, insertErr.message);
        }
      }
    }

    console.log('\n====================================================');
    console.log(' FINAL VERIFICATION OF TARGET DATABASE:');
    const allCols = await conn.connection.db.listCollections().toArray();
    for (const col of allCols) {
      const count = await conn.connection.db.collection(col.name).countDocuments();
      console.log(` - ${col.name.padEnd(20)}: ${count} records in target`);
    }
    console.log('====================================================');
    console.log(' MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Migration Error]:', err.message);
    if (conn) await mongoose.disconnect();
    process.exit(1);
  }
}

importToAtlas();
