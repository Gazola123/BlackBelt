'use strict';

const { embed } = require('../Functions/utils.js');

module.exports = {
	name: 'skip',
	description: 'Pula a música atual',
	async execute(message) {
		// Pega a fila do usuário
		const Queue = message.client.Queues.get(message.guildId);
		// Verifica se a fila existe ou se o usuário está tocando
		if (!Queue || !Queue.nowPlaying) return message.reply(embed(':x: | Não estou tocando nada!'));

		// Pega a música atual
		const song = Queue.nowPlaying;

		console.log(`[Comando: Skip]: ${message.author.username} pulou a música ${song.title}`);

		// Manda o player parar de tocar
		// Como na criação da fila a gente definiu que se o player não tivesse tocando nada
		// Ele iria procurar uma musica na fila e tocar ela ou se não tivesse nenhuma só ia parar
		Queue.player.stop();

		message.reply(embed(`:white_check_mark: | Pulei a música \`${song.title}\``));
	},
};