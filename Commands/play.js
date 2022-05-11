'use strict';

// Importar o Voice do Discord.js
const DjsVoice = require('@discordjs/voice');

// Importar o YTDL do Discord.js para baixar o video
const Ytdl = require('ytdl-core');

// Importa o youtube-sr para pesquisar no youtube
const YtSearch = require('youtube-sr').default;

// Importa a função de criar mensagens do outro arquivo
const { embed } = require('../Functions/utils');

// Importa a função de criar filas de músicas e o YTDL_ARGS
const { createQueue, YTDL_ARGS } = require('../Functions/music');

// Exporta o comando
module.exports = {
	name: 'play',
	description: 'Toca uma música no canal de voz do usuário',
	async execute(message, args) {
		// Verifica se o usuário enviou uma musica
		if (args.length <= 0) return message.reply(embed(':x: | Você precisa me dizer o que quer tocar!'));

		// Pega o canal de voz do usuário
		const VoiceChannel = message.member.voice?.channel;
		// Verifica se o usuário está no canal de voz
		if (!VoiceChannel) return message.reply(embed(':x: | Você precisa estar em um canal de voz!'));

		// Importa a fila de dentro do client
		let Queue = message.client.Queues.get(message.guildId);
		// Verifica se a fila existe
		// Caso não exista, cria uma nova
		if (!Queue) Queue = createQueue(message);

		// Pesquire o video no youtube
		const song = await YtSearch.searchOne(args.join(' '), 'video', false);
		// Verifica se o video existe
		if (!song) return message.reply(embed(':x: | Não achei nada com esse nome!'));

		if (Queue.nowPlaying) {
			// Adiciona a música na fila
			Queue.songs.push(song);
			// Retorna a mensagem de que foi adicionada
			return message.reply(embed(`:white_check_mark: | Adicionado \`${song.title}\` à fila!`));
		}

		// Mosrta no console que o usuário está tocando
		console.log(`[Comando: Play]: ${message.author.username} adicionou a música ${song.title}`);

		// Procura uma conexão de voz
		let connection = DjsVoice.getVoiceConnection(message.guildId);
		// Verifica se a conexão existe
		if (!connection) {
			// Se não existir, conecta ao canal de voz
			console.log('[Conexão]: Criando conexão...');
			const _connection = DjsVoice.joinVoiceChannel({
				adapterCreator: message.guild.voiceAdapterCreator,
				guildId: message.guildId,
				channelId: VoiceChannel.id,
				debug: false,
			});

			console.log(_connection);

			// Quando a conexão estiver conectando, mostre no console
			_connection.on(DjsVoice.VoiceConnectionStatus.Connecting, () => {
				console.log('[Conexão]: Conectando...');
			});

			// Quando a conexão estiver conectada, mostre no console
			_connection.on(DjsVoice.VoiceConnectionStatus.Ready, () => {
				console.log('[Conexão]: Conectado ao canal de voz!');
				// Define o player desse servidor nessa conexão
				_connection.subscribe(Queue.player);
			});

			// Quando a conexão estiver com erro, mostre no console
			_connection.on('error', (err) => console.error(err));
			// Quando a conexão estiver desconectada, mostre no console
			_connection.on('disconnect', () => console.log('[Conexão]: Desconectado do canal de voz!'));

			connection = _connection;
		}

		// Baixa o video do youtube
		const stream = Ytdl(song.url || `https://www.youtube.com/watch?v=${song.id}`, YTDL_ARGS);
		console.log('[Comando: Play]: Baixando música...');

		// Encontra o formato do arquivo
		const probeType = await DjsVoice.demuxProbe(stream).catch(() => console.log('[Comando: Play]: Probe Error'));
		if (!probeType) return message.reply(embed(':x: | Não consegui achar o formato do vídeo!'));

		console.log('[Comando: Play]: Iniciando stream...');

		// Cria um recurso de download
		const resource = DjsVoice.createAudioResource(stream, { inputType: probeType.type });

		// Manda o Player tocar a musica
		Queue.player.play(resource);
		// Adiciona na fila que o bot está tocando
		Queue.nowPlaying = song;

		// Responde ao usuário que a música foi adicionada
		message.reply(embed(`:notes: | **Tocando agora:** \`${song.title}\``));
	},
};