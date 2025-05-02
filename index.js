const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');

// Токен Telegram-бота
const TOKEN = '7630006515:AAGF-53ciMI3iZV5VyMi7FSscKxCrwV4L4U';

// Запуск бота с polling
const bot = new TelegramBot(TOKEN, { polling: true });
console.log('Бот был успешно запущен!');

// Подключение к базе данных
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chatbottests'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ', err);
  } else {
    console.log('Успешное подключение к базе данных');
  }
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpText = `
Список команд:
/help - список команд
/site - сайт Октагона
/creator - создатель бота
/randomitem - случайный предмет из БД
/deleteitem - удалить предмет по ID
/getitembyid - получить предмет по ID
`;
  bot.sendMessage(chatId, helpText);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Сайт Октагона: https://octagon-students.ru');
});

// Команда /creator
bot.onText(/\/creator/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Создатель бота: Пьянзина София Сергеевна');
});

// Команда /randomitem
bot.onText(/\/randomitem/, (msg) => {
  db.query('SELECT * FROM items ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err) {
      console.error('Ошибка при выполнении запроса:', err);
      bot.sendMessage(msg.chat.id, 'Ошибка при получении данных.');
    } else if (results.length === 0) {
      bot.sendMessage(msg.chat.id, 'Нет доступных предметов.');
    } else {
      const item = results[0];
      bot.sendMessage(msg.chat.id, `(${item.id}) - ${item.name}: ${item.desc}`);
    }
  });
});

// Команда /deleteitem 
bot.onText(/\/deleteitem/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Введите ID предмета, который хотите удалить:');
  bot.once('message', (responseMsg) => {
    const id = parseInt(responseMsg.text, 10);
    if (isNaN(id)) {
      bot.sendMessage(chatId, 'Ошибка: пожалуйста, введите числовой ID.');
      return;
    }
    console.log(`Запрос на удаление предмета с ID: ${id}`);
    db.query('DELETE FROM items WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Ошибка при удалении предмета из базы данных:', err);
        bot.sendMessage(chatId, 'Ошибка при удалении предмета.');
        return;
      }
      if (result.affectedRows === 0) {
        bot.sendMessage(chatId, `Ошибка`);
      } else {
        bot.sendMessage(chatId, `Удачно`);
      }
    });
  });
});

// Команда /getitembyid
bot.onText(/\/getitembyid/i, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Введите ID предмета, информацию о котором хотите получить:');

  bot.once('message', (responseMsg) => {
    const id = parseInt(responseMsg.text, 10);

    if (isNaN(id)) {
      bot.sendMessage(chatId, 'Ошибка: пожалуйста, введите числовой ID.');
      return;
    }
    console.log(`Запрос на получение предмета с ID: ${id}`);
    db.query('SELECT * FROM items WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err);
        bot.sendMessage(chatId, 'Ошибка при получении данных.');
      } else if (results.length === 0) {
        bot.sendMessage(chatId, `Предмет с ID ${id} не найден.`);
      } else {
        const item = results[0];
        bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.desc}`);
      }
    });
  });
});

