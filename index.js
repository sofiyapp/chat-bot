//здравствуйте! я не успеваю сделать этот спринт до конца преддипломной практики (20.05) :(
// это весь черновик

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Sequelize, DataTypes } = require('sequelize');

// бд
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

// модели
const Group = sequelize.define('Group', {
  name: { type: DataTypes.STRING, allowNull: false },
  approved: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const User = sequelize.define('User', {
  telegramId: { type: DataTypes.STRING, unique: true },
  role: { type: DataTypes.ENUM('user', 'curator', 'admin'), defaultValue: 'user' },
});

User.belongsTo(Group);
Group.hasMany(User);

// бот
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await User.findOrCreate({ where: { telegramId: String(chatId) } });
  await bot.sendMessage(chatId, 'Привет! Выбери действие:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Выбрать группу', callback_data: 'select_group' }],
        [{ text: 'Добавить группу', callback_data: 'add_group' }],
        [{ text: 'Ожидающие группы', callback_data: 'pending_groups' }],
      ],
    },
  });
});

bot.on('callback_query', async (query) => {
  const { data, message } = query;
  const chatId = message.chat.id;

  if (data === 'add_group') {
    bot.sendMessage(chatId, 'Введите название группы:');
    bot.once('message', async (msg) => {
      const name = msg.text;
      await Group.create({ name });
      bot.sendMessage(chatId, `Заявка на добавление группы "${name}" отправлена на модерацию.`);
    });
  } else if (data === 'pending_groups') {
    const groups = await Group.findAll({ where: { approved: false } });
    if (groups.length === 0) {
      bot.sendMessage(chatId, 'Нет заявок на добавление.');
    } else {
      const names = groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n');
      bot.sendMessage(chatId, `Ожидают одобрения:\n${names}`);
    }
  }
});

// инициализация
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Бот запущен и подключён к БД');
  } catch (err) {
    console.error('Ошибка подключения к БД:', err);
  }
})();
