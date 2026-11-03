require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function testDatabase() {
  console.log('--- Starting MongoDB Connectivity & CRUD Test ---');
  try {
    await connectDB();
    console.log('Connected to target database successfully.');

    // Define a test collection schema
    const TestSchema = new mongoose.Schema({
      testId: String,
      timestamp: { type: Date, default: Date.now },
      status: String
    });
    const TestModel = mongoose.model('ConnectionTest', TestSchema);

    // 1. Write Test
    const newRecord = await TestModel.create({
      testId: 'test-' + Date.now(),
      status: 'READ_WRITE_VERIFIED'
    });
    console.log('Write Test: SUCCESS, created document ID:', newRecord._id);

    // 2. Read Test
    const fetched = await TestModel.findById(newRecord._id);
    if (!fetched || fetched.status !== 'READ_WRITE_VERIFIED') {
      throw new Error('Read test did not return expected record');
    }
    console.log('Read Test: SUCCESS, fetched document:', fetched.testId);

    // 3. Clean up test record
    await TestModel.findByIdAndDelete(newRecord._id);
    console.log('Cleanup Test: SUCCESS');

    console.log('--- ALL MONGODB VERIFICATION TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('--- MONGODB TEST FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

testDatabase();
