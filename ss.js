const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

// توکن ربات تلگرام که از BotFather دریافت کرده‌اید
const token = '8192427606:AAEMZzQNm6lOHQH5WBCIHS7flMq2WZMX2sI';
const bot = new TelegramBot(token, { polling: true });

// اتصال به دیتابیس SQLite
const db = new sqlite3.Database('./users.db');

// ایجاد جدول کاربران در دیتابیس (اگر قبلاً ایجاد نشده باشد)
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, first_name TEXT, last_name TEXT, chat_id INTEGER)");
});

// ساخت کیبورد اولیه
const mainMenuOptions = {
  reply_markup: {
    keyboard: [
      ['دریافت کانفیگ'],  // اولین ردیف دکمه‌ها
      ['درباره ما']        // گزینه جدید برای "درباره ما"
    ],
    resize_keyboard: true  // اندازه کیبورد متناسب با اندازه دکمه‌ها
  }
};

// ساخت کیبورد برای آموزش اتصال
const connectionGuideOptions = {
  reply_markup: {
    keyboard: [
      ['اندروید', 'آیفون'],  // اولین ردیف دو دکمه
      ['ویندوز', 'لینوکس']  // دومین ردیف دو دکمه
    ],
    resize_keyboard: true  // اندازه کیبورد متناسب با اندازه دکمه‌ها
  }
};

// کانفیگ‌ها برای ارسال به کاربران
const configs = [
  'vless://0b0a30f7-4cf1-42ad-9d0a-dd38a1d1178f@Telegram.Parsashonam:443?host=Usa-Parsashonam.ir&path=%2F%40Parsashonam%2C%40ParsashonamBots%2C%40Parsashonam_Bot%2Fws%2F%3Fed%3D2560&security=none&type=ws#%DB%8C%D8%A7%D8%AF%D8%AA%20%D9%86%D8%B1%D9%87%20%DA%A9%D8%A7%D9%86%D8%A7%D9%84%20%D8%B1%D9%88%20%D8%A8%D9%87%20%D9%88%D8%AF%D8%B3%D8%AA%D8%A7%D8%AA%20%D9%85%D8%B9%D8%B1%D9%81%DB%8C%20%DA%A9%D9%86%DB%8C%20%F0%9F%92%99-6405951461_379a0-1',
  'vless://0b0a30f7-4cf1-42ad-9d0a-dd38a1d1178f@[2a01:4ff:1f0:f207::1]:2222?security=none&type=tcp#@Parsashonam%20%F0%9F%87%BA%F0%9F%87%B8%20ipv6%E2%9A%A0%EF%B8%8F-6405951461_379a1-Ipv6',
  'vless://0b0a30f7-4cf1-42ad-9d0a-dd38a1d1178f@Zmaoz.Faculty.Ucdavis.Edu:443?path=%2F%40Parsashonam%2C%40ParsashonamBots%2C%40Parsashonam_Bot%2Fws%2F%3Fed%3D2560&security=tls&encryption=none&alpn=h2,http/1.1&host=Usa-Parsashonam.ir&fp=firefox&type=ws&sni=Zmaoz.Faculty.Ucdavis.Edu.#%40Parsashonam+%F0%9F%87%BA%F0%9F%87%B8.6405951461_379a',
  'vless://b55c626b-fb77-4f9f-acea-42e8b1fbc9f6@Telegram.Parsashonam:443?host=Usa-Parsashonam.ir&path=%2F%40Parsashonam%2C%40ParsashonamBots%2C%40Parsashonam_Bot%2Fws%2F%3Fed%3D2560&security=none&type=ws#%DB%8C%D8%A7%D8%AF%D8%AA%20%D9%86%D8%B1%D9%87%20%DA%A9%D8%A7%D9%86%D8%A7%D9%84%20%D8%B1%D9%88%20%D8%A8%D9%87%20%D9%88%D8%AF%D8%B3%D8%AA%D8%A7%D8%AA%20%D9%85%D8%B9%D8%B1%D9%81%DB%8C%20%DA%A9%D9%86%DB%8C%20%F0%9F%92%99-6405951461_605c0-1',
  'vless://b55c626b-fb77-4f9f-acea-42e8b1fbc9f6@[2a01:4ff:1f0:f207::1]:2222?security=none&type=tcp#@Parsashonam%20%F0%9F%87%BA%F0%9F%87%B8%20ipv6%E2%9A%A0%EF%B8%8F-6405951461_605c1-Ipv6',
  'vless://b55c626b-fb77-4f9f-acea-42e8b1fbc9f6@Zmaoz.Faculty.Ucdavis.Edu:443?path=%2F%40Parsashonam%2C%40ParsashonamBots%2C%40Parsashonam_Bot%2Fws%2F%3Fed%3D2560&security=tls&encryption=none&alpn=h2,http/1.1&host=Usa-Parsashonam.ir&fp=firefox&type=ws&sni=Zmaoz.Faculty.Ucdavis.Edu.#%40Parsashonam+%F0%9F%87%BA%F0%9F%87%B8.6405951461_605c'
];

// تابعی برای انتخاب سه کانفیگ رندوم
function getRandomConfigs() {
  const shuffled = configs.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3); // انتخاب 3 کانفیگ رندوم
}

// وقتی که ربات شروع به کار می‌کند
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name;

  // بررسی می‌کنیم که آیا کاربر قبلاً در دیتابیس ثبت شده است یا نه
  db.get("SELECT * FROM users WHERE chat_id = ?", [chatId], (err, row) => {
    if (err) {
      console.error('Error checking user:', err);
    } else if (!row) {  // اگر کاربر پیدا نشد
      // ذخیره اطلاعات کاربر در دیتابیس
      const stmt = db.prepare("INSERT INTO users (chat_id, username, first_name, last_name) VALUES (?, ?, ?, ?)");
      stmt.run(chatId, username, firstName, lastName, (err) => {
        if (err) {
          console.error('Error saving user data:', err);
        } else {
          console.log('User data saved successfully');
        }
      });
      stmt.finalize();
    } else {
      console.log('User already exists');
    }
  });

  // ارسال پیام خوش‌آمدگویی
  bot.sendMessage(chatId, 'سلام! لطفا یکی از گزینه‌ها را انتخاب کنید:', mainMenuOptions);
});

// پاسخ به دکمه‌های انتخاب شده
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === 'دریافت کانفیگ') {
    // انتخاب 3 کانفیگ رندوم
    const randomConfigs = getRandomConfigs();

    // تبدیل کانفیگ‌ها به یک رشته
    let allConfigs = randomConfigs.join("\n\n");

    // اضافه کردن اطلاعات ربات و کانال در انتهای پیام
    let finalMessage = `\`\`\`${allConfigs}\`\`\`\n\nربات دریافت کانفیگ رایگان @YourBotUsername\nکانال ما @YourChannelUsername`;

    // ارسال پیام به کاربر به صورت کد قابل کپی
    bot.sendMessage(chatId, finalMessage, { parse_mode: 'MarkdownV2' });
  } else if (text === 'درباره ما') {
    const aboutMessage = `
      درباره ما:
      این ربات با هدف ارتقاء آزادی اینترنت ساخته شده است. تلاش ما این است که امکانات دسترسی آزاد به اینترنت را برای کاربران فراهم کنیم.
      
      شعار ما:
      "آزادی اینترنت حق همه است."
      
      درست شده توسط 0003
    `;
    bot.sendMessage(chatId, aboutMessage, mainMenuOptions);
  } else if (text === 'آموزش اتصال') {
    bot.sendMessage(chatId, 'لطفا سیستم‌عامل خود را انتخاب کنید:', connectionGuideOptions);
  } else if (text === 'اندروید') {
    bot.sendMessage(chatId, 'برای آموزش اتصال به اندروید، لطفا به این لینک مراجعه کنید: [لینک اندروید]', connectionGuideOptions);
  } else if (text === 'آیفون') {
    bot.sendMessage(chatId, 'برای آموزش اتصال به آیفون، لطفا به این لینک مراجعه کنید: [لینک آیفون]', connectionGuideOptions);
  } else if (text === 'ویندوز') {
    bot.sendMessage(chatId, 'برای آموزش اتصال به ویندوز، لطفا به این لینک مراجعه کنید: [لینک ویندوز]', connectionGuideOptions);
  } else if (text === 'لینوکس') {
    bot.sendMessage(chatId, 'برای آموزش اتصال به لینوکس، لطفا به این لینک مراجعه کنید: [لینک لینوکس]', connectionGuideOptions);
  } 
});

// بستن دیتابیس پس از اتمام کار
process.on('exit', () => {
  db.close();
});
