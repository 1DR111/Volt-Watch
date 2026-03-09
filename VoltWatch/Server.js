const express       = require('express');
const cors          = require('cors');
const path          = require('path');
const AfricasTalking = require('africastalking');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'index.html')));

// ── Africa's Talking ──────────────────────────────────────
const AT = AfricasTalking({
  apiKey:   'atsk_9381ad5f44f92f625e3ba047b202773a7a4ed2548b4f0994d844b4f24910f4687a148a85',
  username: 'sandbox',
});
const sms = AT.SMS;

// ── SMS Route ─────────────────────────────────────────────
// The website POSTs here → server calls AT → returns result
app.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'to and message are required' });
  }

  console.log(`\n[SMS] Sending to ${to}`);
  console.log(`[MSG] ${message.split('\n')[0]}...`);

  try {
    const result = await sms.send({ to: [to], message, from });
    const recipient = result.SMSMessageData.Recipients[0];

    console.log(`[AT]  Status: ${recipient.status} | Cost: ${recipient.cost}`);

    res.json({
      success:   true,
      status:    recipient.status,
      cost:      recipient.cost,
      messageId: recipient.messageId,
      number:    recipient.number,
    });

  } catch (err) {
    console.error('[AT ERROR]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Serve the website ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────
const PORT = 3000 ;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   VoltWatch Server Running ⚡         ║
║   Open: http://localhost:${PORT}        ║
║   SMS endpoint: POST /send-sms       ║
╚══════════════════════════════════════╝
  `);
});
