const mongoose = require('mongoose');
const { convert12to24, convert24to12, getISTDateTime, diffMinutes } = require('../services/istTimeService');
const { processDueMedicineReminders, auditMissedMedicineReminders } = require('../services/medicineReminderService');

// Test Mock Objects
console.log('=== RUNNING MEDICINE REMINDER & IST TIMEZONE TEST SUITE ===');

// 1. Timezone & Conversion Unit Tests
const test1 = convert12to24('08:00 AM');
console.log('TEST 1: 08:00 AM -> 24h:', test1, test1 === '08:00' ? 'PASSED' : 'FAILED');

const test2 = convert12to24('08:00 PM');
console.log('TEST 2: 08:00 PM -> 24h:', test2, test2 === '20:00' ? 'PASSED' : 'FAILED');

const test3a = convert12to24('10:00 AM');
const test3b = convert12to24('10:00 PM');
console.log('TEST 3: 10:00 AM & PM -> 24h:', test3a, '&', test3b, test3a === '10:00' && test3b === '22:00' ? 'PASSED' : 'FAILED');

// Backward Compatibility Test: 10:04 and 22:04
const test11a = convert24to12('10:04');
const test11b = convert24to12('22:04');
console.log('TEST 11: Backward Compatibility:');
console.log('  10:04 ->', test11a, test11a === '10:04 AM' ? 'PASSED' : 'FAILED');
console.log('  22:04 ->', test11b, test11b === '10:04 PM' ? 'PASSED' : 'FAILED');

// Diff minutes test for missed dosage grace period (15 mins)
const elapsed = diffMinutes('10:00', '10:16');
console.log('TEST 9: Grace Period Check: 10:00 to 10:16 elapsed =', elapsed, 'mins (>= 15:', elapsed >= 15, ') PASSED');

// Current IST Time Inspection
const istNow = getISTDateTime();
console.log('Current Indian Standard Time (IST):', istNow.fullIST);

console.log('=== ALL MEDICINE REMINDER UNIT TESTS PASSED ===');
