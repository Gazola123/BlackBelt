'use strict';

const DjsVoice = require('@discordjs/voice');
const Ytdl = require('ytdl-core');

// Cria uma fila nova e define algumas funções ao player
function createQueue(message) {

	// Cria um novo player
	const Player = new DjsVoice.AudioPlayer({
		behaviors: {
			// Quando a musica acabar o Player vai emitir um Pause
			noSubscriber: DjsVoice.NoSubscriberBehavior.Pause,
		},
		debug: true,
	});

	// Quando o Player der um erro, mostre no console
	Player.on('error', (error) => console.error(error));

	// Quando o Player terminar uma música, mostre no console
	// E use a função checkQueue para verificar se existe mais músicas na fila
	Player.on(DjsVoice.AudioPlayerStatus.Idle, () => {
		console.log('[Player]: Música terminada!');
		// Verifica se existe mais músicas na fila
		checkQueue(message);
	});

	// Cria uma nova fila
	const Queue = {
		// O Player da fila
		player: Player,
		// A música que está tocando
		nowPlaying: null,
		// A lista de músicas
		songs: [],
	};

	// Associa a fila ao servidor pelo ID
	message.client.Queues.set(message.guildId, Queue);

	// Retorna a fila
	return Queue;
}

async function checkQueue(message) {

	console.log('[Player]: Verificando fila...');

	// Pega a fila do servidor
	const Queue = message.client.Queues.get(message.guildId);
	// Verifica se a fila existe
	if (!Queue) return false;

	// Define o nowPlaying como vazio
	Queue.nowPlaying = null;

	// Verifica se a fila está vazia
	if (Queue.songs.length <= 0) return false;

	// Pega a primeira música da fila
	const song = Queue.songs.shift();

	// Baixa o video do youtube
	const stream = Ytdl(song.url || `https://www.youtube.com/watch?v=${song.id}`, YTDL_ARGS);
	console.log('[Player]: Baixando música...');

	// Encontra o formato do arquivo
	const probeType = await DjsVoice.demuxProbe(stream).catch(() => console.log('Probe Error'));
	if (!probeType) return false;

	console.log('[Player]: Iniciando stream...');

	// Cria um recurso de download
	const resource = DjsVoice.createAudioResource(stream, { inputType: probeType.type });

	// Manda o Player tocar a musica
	Queue.player.play(resource);
	Queue.nowPlaying = song;

	// Retorna a fila
	return true;
}

// Argumentos de funcionamento interno do YTDL
const YTDL_ARGS = {
	// Escolhe a melhor qualidade de audio
	quality: 'highestaudio',
	// N sei oq faz klkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
	highWaterMark: 1048576 * 64,
	dlChunkSize: 0,
};

// Exporta a função
module.exports = {
	createQueue,
	YTDL_ARGS,
};