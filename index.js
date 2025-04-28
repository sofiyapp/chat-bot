const TelegramBot = require('node-telegram-bot-api')
const TOKEN = '7630006515:AAGF-53ciMI3iZV5VyMi7FSscKxCrwV4L4U'
const bot = new TelegramBot (TOKEN, {
    polling: true
})
bot.on('message', (msg) =>{
    console.log(msg)
    bot.sendMessage(msg.chat.id, 'Привет, октагон!' )
})