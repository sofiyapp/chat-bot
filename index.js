const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '7630006515:AAGF-53ciMI3iZV5VyMi7FSscKxCrwV4L4U';
console.log('Бот был успешно запущен!');

const bot = new TelegramBot(TOKEN, {
  polling: true
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `
    Список доступных команд:
    1. /help - список команд
    2. /site - ссылка на сайт октагона
    3. /creator - ФИО создателя
  `;
  bot.sendMessage(chatId, helpText);
});

bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  const siteLink = 'https://octagon-students.ru'; 
  bot.sendMessage(chatId, `ссылка на сайт октагона: ${siteLink}`);
});

bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  const creatorName = 'Пьянзина София Сергеевна'; 
  bot.sendMessage(chatId, `Создатель бота: ${creatorName}`);
});
