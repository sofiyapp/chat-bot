const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '8051623135:AAEBNN4V1aTrbjCpdOOZppLSFWmQIXANTNQ';
const userTasks = {};
const bot = new TelegramBot(TOKEN, { polling: true });
console.log('Бот был успешно запущен!');

// команда /help
bot.onText(/\/help/i, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
Доступные команды:

/view_all_tasks - 📄 Показать список всех задач
/add_task – ➕ Добавить задачу
/edit_task – 📝 Изменить описание задачи
/set_deadline – 📅 Установить срок задачи
/done_task – ✅ Пометить как выполненную 
/remove_task – 🗑 Удалить задачи 
/clear_tasks – 🔥 Удалить все задачи 
    `;
    bot.sendMessage(chatId, helpText);
});

// команда /view_all_tasks
bot.onText(/\/view_all_tasks/, (msg) => {
    const chatId = msg.chat.id;
    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        return bot.sendMessage(chatId, 'У вас пока нет задач.');
    }
    let taskList = '📋 Ваши задачи:\n';
    userTasks[chatId].forEach((task, index) => {
        taskList += `${index + 1}. ${task.text}\n`;
    });
    bot.sendMessage(chatId, taskList);
});

// команда /add_task
bot.onText(/\/add_task/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Какую задачу нужно добавить?');
    bot.once('message', (newMsg) => {
        if (newMsg.text.startsWith('/')) return;
        const task = newMsg.text;
        if (!userTasks[chatId]) {
            userTasks[chatId] = [];
        }
        userTasks[chatId].push({ text: task, completed: false });
        bot.sendMessage(chatId, `Задача добавлена в список дел!✅`);
    });
});

// команда /edit_task
bot.onText(/\/edit_task/, (msg) => {
    const chatId = msg.chat.id;
    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        bot.sendMessage(chatId, 'У вас пока нет задач для изменения.');
        return;
    }
    let taskList = 'Выберите номер задачи, которую хотите изменить:\n\n';
    userTasks[chatId].forEach((task, index) => {
        taskList += `${index + 1}. ${task.text} ${task.completed ? '✅' : ''}\n`;
    });
    bot.sendMessage(chatId, taskList);
    bot.once('message', (numberMsg) => {
        const taskIndex = parseInt(numberMsg.text) - 1;
        if (
            isNaN(taskIndex) ||
            taskIndex < 0 ||
            taskIndex >= userTasks[chatId].length
        ) {
            bot.sendMessage(chatId, 'Неверный номер задачи.');
            return;
        }
        bot.sendMessage(chatId, 'Введите новое описание задачи:');
        bot.once('message', (newTextMsg) => {
            if (newTextMsg.text.startsWith('/')) return;
            userTasks[chatId][taskIndex].text = newTextMsg.text;
            bot.sendMessage(chatId, 'Изменения сохранены!');
            // обновлённый список задач
            let updatedList = '📋 Обновлённый список задач:\n';
            userTasks[chatId].forEach((task, index) => {
                updatedList += `${index + 1}. ${task.text}\n`;
            });
            bot.sendMessage(chatId, updatedList);
        });
    });
});

// команда /done_task
bot.onText(/\/done_task/, (msg) => {
    const chatId = msg.chat.id;

    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        bot.sendMessage(chatId, 'У вас пока нет задач.');
        return;
    }
    let taskList = 'Какие задачи уже выполнены? Введите номера через пробел или запятую:\n\n';
    userTasks[chatId].forEach((task, index) => {
        const status = task.completed ? '✅' : '';
        taskList += `${index + 1}. ${task.text} ${status}\n`;
    });
    bot.sendMessage(chatId, taskList);
    bot.once('message', (numberMsg) => {
        const input = numberMsg.text;
        if (input.startsWith('/')) return;
        const indexes = input
            .split(/[\s,]+/)
            .map(num => parseInt(num.trim()) - 1)
            .filter(index => !isNaN(index) && index >= 0 && index < userTasks[chatId].length);
        if (indexes.length === 0) {
            bot.sendMessage(chatId, 'Не удалось распознать корректные номера задач.');
            return;
        }
        indexes.forEach(i => userTasks[chatId][i].completed = true);
        // обновлённый список
        let updatedList = '📋 Обновлённый список задач:\n';
        userTasks[chatId].forEach((task, index) => {
            const status = task.completed ? '✅' : '';
            updatedList += `${index + 1}. ${task.text} ${status}\n`;
        });
        bot.sendMessage(chatId, 'Выбранные задачи помечены как выполненные!');
        bot.sendMessage(chatId, updatedList);
    });
});

// команда /set_deadline
bot.onText(/\/set_deadline/, (msg) => {
    const chatId = msg.chat.id;

    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        bot.sendMessage(chatId, 'У вас пока нет задач для установки дедлайна.');
        return;
    }
    let taskList = 'Выберите номер задачи, для которой хотите установить дедлайн:\n\n';
    userTasks[chatId].forEach((task, index) => {
        taskList += `${index + 1}. ${task.text} ${task.completed ? '✅' : ''}\n`;
    });

    bot.sendMessage(chatId, taskList);

    bot.once('message', (numberMsg) => {
        const taskIndex = parseInt(numberMsg.text) - 1;
        if (
            isNaN(taskIndex) ||
            taskIndex < 0 ||
            taskIndex >= userTasks[chatId].length
        ) {
            bot.sendMessage(chatId, 'Неверный номер задачи.');
            return;
        }

        bot.sendMessage(chatId, 'Введите дату и время (в формате: DD.MM.YYYY HH:mm):');

        bot.once('message', (deadlineMsg) => {
            const deadline = deadlineMsg.text;
            const deadlineRegex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
            const match = deadline.match(deadlineRegex);

            if (!match) {
                bot.sendMessage(chatId, 'Неверный формат даты и времени. Попробуйте снова.');
                return;
            }

            const [_, day, month, year, hour, minute] = match;
            const deadlineDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
            const formattedDeadline = `${day}.${month}.${year} ${hour}:${minute}`;
            userTasks[chatId][taskIndex].deadline = formattedDeadline;

            // Вычисление оставшегося времени
            const now = new Date();
            const diffMs = deadlineDate - now;
            let timeLeft = '';

            if (diffMs > 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                timeLeft = `⏱ Осталось: ${diffDays}д. ${diffHours}ч. ${diffMinutes}мин.`;
            } else {
                timeLeft = '⚠️ Срок уже истёк!';
            }

            // Обновлённый список задач
            let updatedList = '📋 Обновлённый список задач:\n';
            userTasks[chatId].forEach((task, index) => {
                const status = task.completed ? '✅' : '';
                const deadlineText = task.deadline ? ` ⏳ ${task.deadline}` : '';
                const remaining = (index === taskIndex) ? `\n   ${timeLeft}` : '';
                updatedList += `${index + 1}. ${task.text} ${status}${deadlineText}${remaining}\n`;
            });

            bot.sendMessage(chatId, 'Дедлайн установлен! ⏳');
            bot.sendMessage(chatId, updatedList);
        });
    });
});

// команда /remove_task 
bot.onText(/\/remove_task/, (msg) => {
    const chatId = msg.chat.id;

    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        bot.sendMessage(chatId, 'У вас пока нет задач для удаления.');
        return;
    }
    let taskList = 'Введите номера задач, которые хотите удалить (через пробел):\n\n';
    userTasks[chatId].forEach((task, index) => {
        taskList += `${index + 1}. ${task.text}\n`;
    });
    bot.sendMessage(chatId, taskList);
    bot.once('message', (msg) => {
        const numbers = msg.text.split(' ')
            .map(n => parseInt(n) - 1)
            .filter(n => !isNaN(n) && n >= 0 && n < userTasks[chatId].length);

        if (numbers.length === 0) {
            bot.sendMessage(chatId, 'Не удалось распознать номера задач.');
            return;
        }
        numbers.sort((a, b) => b - a).forEach(i => userTasks[chatId].splice(i, 1));
        bot.sendMessage(chatId, 'Выбранные задачи удалены ✅');
        if (userTasks[chatId].length > 0) {
            let updated = '📋 Обновлённый список задач:\n';
            userTasks[chatId].forEach((task, i) => {
                updated += `${i + 1}. ${task.text}\n`;
            });
            bot.sendMessage(chatId, updated);
        } else {
            bot.sendMessage(chatId, 'У вас больше нет задач.');
        }
    });
});

// команда /clear_tasks 
bot.onText(/\/clear_tasks/, (msg) => {
    const chatId = msg.chat.id;

    if (!userTasks[chatId] || userTasks[chatId].length === 0) {
        bot.sendMessage(chatId, 'У вас и так нет задач.');
        return;
    }
    bot.sendMessage(chatId, 'Вы уверены, что хотите удалить все задачи? (да/нет)');
    bot.once('message', (confirmMsg) => {
        const text = confirmMsg.text.toLowerCase();

        if (text === 'да') {
            delete userTasks[chatId];
            bot.sendMessage(chatId, 'Все задачи удалены 🔥');
        } else {
            bot.sendMessage(chatId, 'Удаление отменено. Ваши задачи остались без изменений.');
        }
    });
});


