/**
 * Script to drop old database indexes
 * Run this once to clean up old indexes like mobileNo_1
 * 
 * Usage: node src/scripts/dropOldIndexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voxvertex');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const dropOldIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const collectionObj = db.collection(collectionName);
      const indexes = await collectionObj.indexes();
      
      console.log(`\n📋 Checking indexes for collection: ${collectionName}`);
      
      for (const index of indexes) {
        const indexName = index.name;
        const indexKeys = Object.keys(index.key);
        
        // Check for old mobileNo index
        if (indexName.includes('mobileNo') || indexKeys.includes('mobileNo')) {
          console.log(`🗑️  Dropping old index: ${indexName}`);
          try {
            await collectionObj.dropIndex(indexName);
            console.log(`✅ Successfully dropped index: ${indexName}`);
          } catch (error) {
            console.error(`❌ Failed to drop index ${indexName}:`, error.message);
          }
        }
        
        // Check for phoneNumber unique index (should be sparse)
        if (indexKeys.includes('phoneNumber') && index.unique && !index.sparse) {
          console.log(`⚠️  Found non-sparse unique index on phoneNumber: ${indexName}`);
          console.log(`   This should be sparse to allow multiple null values`);
          console.log(`   Consider dropping and recreating with sparse: true`);
        }
      }
    }
    
    console.log('\n✅ Index cleanup completed');
  } catch (error) {
    console.error('❌ Error during index cleanup:', error);
  }
};

const main = async () => {
  await connectDB();
  await dropOldIndexes();
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed');
  process.exit(0);
};

main();


