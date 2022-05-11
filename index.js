'use strict';

// Importar o Discord.js
const Discord = require('discord.js');

// Importa o FS para ler arquivos
const fs = require('fs');


// Importar a configuração do bot
const Config = require('./config.json');
// Caso a configuração não tenha um token ou o token seja invalido, encerra o bot
if (!Config.token || /[A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g.test(Config.token) === false) {
	throw new Error('Não foi possível encontrar o token do bot!');
}
// Caso a configuração não tenha um prefixo, encerra o bot
if (!Config.prefix) {
	throw new Error('Não foi possível encontrar o prefixo do bot!');
}

// Criar um novo cliente
const Client = new Discord.Client({
	intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
});


// Cria uma nova propriedade no `Client` chamada `Queues` para armazenar as filas de músicas
Client.Queues = new Discord.Collection();
// Cria uma nova propriedade no `Client` chamada `Commands` para armazenar os commandos
Client.Commands = new Discord.Collection();

// Caso os diretórios não existam saia com um erro
if (!fs.existsSync('./commands')) {
	throw new Error('[Cliente]: Não foi possível encontrar o diretório de comandos!');
}

// Caso não exista nenhum arquivo de comandos, saia com um erro
if (!fs.readdirSync('./commands').length) {
	throw new Error('[Cliente]: Não foi possível encontrar nenhum comando no diretórido de comandos!');
}

// Leia os commandos do diretório de commandos e filtre apenas arquivos de JavaScript
// fs.readdirSync() retorna um array com os nomes de todos os arquivos do diretório
const commandsFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandsFiles) {
	// Importa o arquivo de comando
	const Command = require(`./commands/${file}`);
	console.log(`[Cliente]: Carregando o comando ${Command.name}`);

	// Adiciona o comando ao `Client.Commands`
	Client.Commands.set(Command.name, Command);
}

Client.once('ready', () => console.log('[Cliente]: #familia tamo pronto pra fuder!'));

Client.on('messageCreate', async (message) => {
	if (message.author.bot) return;

	// Se não começar com o prefixo, não faz nada
	if (!message.content.startsWith(Config.prefix)) return;

	// Separa a mensagem por espaços
	const args = message.content.slice(Config.prefix.length).trim().split(/ +/);

	// Pega o primeiro argumento e chama de commandName
	const commandName = args.shift().toLowerCase();

	// Pega o commando do `Client.Commands`
	const Command = Client.Commands.get(commandName);

	// Se não existir o comando, não faz nada
	if (!Command) return;

	console.log(`[Comando]: ${message.author.username} executou o comando ${commandName}`);

	// O try/catch é usado para tratar erros, ou seja, caso algum erro ocorra, o bot não irá falhar
	try {
		// Use e propriedade `.execute()` do commando que é uma função
		await Command.execute(message, args);
	}
	catch (error) {
		message.reply(`:x: | Houve um erro ao executar esse comando: \`${error.message}\``);
		console.error(error);
	}
});

Client.login(Config.token);