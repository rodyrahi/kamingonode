const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process", // <- this one doesn't work in Windows
        "--disable-gpu",
        "--use-gl=egl",
      ],
    },
    authStrategy: new LocalAuth({
      clientId: 'raj',
    }),
  });
  
  client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
  });
  
  client.on('ready', () => {
    console.log('Client is ready!');
  });
  
  client.initialize();


  module.exports = client;
