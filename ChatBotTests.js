const mysql = require('mysql2');

// Создание подключения
const connection = mysql.createConnection({
  host: 'localhost',     // Сервер базы данных (на локальном ПК)
  user: 'root',           // Стандартный пользователь в XAMPP
  password: '',           // По умолчанию без пароля (если ты его не ставил)
  database: 'chatbottests' // Замени на название твоей БД!
});

// Подключение
connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err);
    return;
  }
  console.log('Подключение к БД прошло успешно!');
});

// Не забудь экспортировать, если надо
module.exports = connection;
