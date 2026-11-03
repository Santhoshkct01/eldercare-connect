/**
 * SMS Notification Service
 * Dispatches real SMS through Twilio if credentials are configured.
 * Otherwise, outputs a structured simulation log so testing works out-of-the-box.
 */
const sendSMS = async (toPhone, messageBody) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    try {
      const twilio = require('twilio')(sid, token);
      const res = await twilio.messages.create({
        body: messageBody,
        from: from,
        to: toPhone,
      });
      console.log(`[SMS SUCCESS] Sent to ${toPhone} | SID: ${res.sid}`);
      return { success: true, sid: res.sid, mode: 'LIVE_TWILIO' };
    } catch (err) {
      console.error(`[SMS TWILIO ERROR]: ${err.message}`);
      return { success: false, error: err.message, mode: 'LIVE_TWILIO' };
    }
  } else {
    // Development / Testing Mock Log
    console.log(`\n================== [AUTOMATION SMS DISPATCH] ==================`);
    console.log(`TO: ${toPhone}`);
    console.log(`MESSAGE:\n${messageBody}`);
    console.log(`STATUS: DISPATCHED (Mock simulation - Add TWILIO credentials in .env for live carrier SMS)`);
    console.log(`=================================================================\n`);
    return { success: true, mode: 'SIMULATION_LOG' };
  }
};

module.exports = { sendSMS };
