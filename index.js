// index.js
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const dayjs = require('dayjs');
const { createCanvas } = require('canvas');
const fs = require('fs');

// CONFIGURAÇÃO
const TARGET_DATE = dayjs('2027-03-26'); // Data final
const GROUP_NAME = 'Praia - abril/2027'; // Nome exato do grupo WhatsApp

// Inicializa o cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// QR Code para login
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Bot pronto
client.on('ready', () => {
    console.log('Bot conectado.');

    // Lista grupos (para verificar nomes)
    // console.log('Grupos disponíveis:');
    // client.getChats().then(chats => chats.filter(c => c.isGroup).forEach(g => console.log(g.name)));

    // Cron diário: 08:00
    cron.schedule('19 1 * * *', async () => {
        const today = dayjs();
        const diff = TARGET_DATE.diff(today, 'day');

        const filePath = generateImage(diff);

        const chats = await client.getChats();
        const group = chats.find(chat => chat.name === GROUP_NAME);

        if (group) {
            const media = MessageMedia.fromFilePath(filePath);
            await group.sendMessage(media);
            console.log(`Imagem enviada: ${diff} dias restantes.`);
        } else {
            console.log('Grupo não encontrado.');
        }
    });
});

// Função que gera a imagem da contagem regressiva
function generateImage(days) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FALTAM', width / 2, 100);

    // Número de dias
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 150px Arial';
    ctx.fillText(days.toString(), width / 2, 250);

    // Rodapé
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.fillText('DIAS', width / 2, 320);

    // Salva imagem
    const buffer = canvas.toBuffer('image/png');
    const filePath = './countdown.png';
    fs.writeFileSync(filePath, buffer);

    return filePath;
}

// Inicializa o bot
client.initialize();