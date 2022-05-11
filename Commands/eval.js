'use strict';
/* eslint-disable no-unused-vars */

const { prefix } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'eval',
	description: 'FAZ COISAS RIDICULAS',
	/** @param {import('discord.js').Message} message*/
	async execute(message) {
		const idsDosDosos = ['391092670266867713', '632951004597452811', '485912377574031370'];

		if (!idsDosDosos.some(a => a == message.author.id)) return message.reply('QM VC ACHA Q É SEU PAU NO CU, PDE USEAR ESSA MERDA NN, VTNC!');

		const startTime = performance.now();
		let output;

		const Client = message.client;

		try {
			output = await eval(message.content.replace(/.+(\s+)?(eval|ev)\s/i, ''));
		}
		catch (err) {
			console.log(err);
			output = err;
		}
		const endTime = performance.now();

		const info = `\n Typeof: \`${ typeof output }\` | Class: \`${ output?.constructor?.name || 'Undefined' }\` | Tempo levado: \`${ (endTime - startTime).toFixed(3) }ms\` | Versão do Discord.js: \`${ Discord.version }\` | Versão do Node: \`${ process.versions.node }\` | Executado em: ${`<t:${(Date.now() / 1000).toFixed(0)}:F>`} `;

		const row = new Discord.MessageActionRow()
			.addComponents([
				new Discord.MessageButton().setCustomId('stringify').setEmoji('📃').setLabel('JSON').setStyle('PRIMARY'),
			]);

		/** @type {Discord.Message}*/
		const Msg = await message.reply({ content: `\`\`\`js\n${output}\`\`\` ${info}`, components: [ row ] }).catch(async err => message.reply({ content: `\`\`\`js\nEssa mensagem é muito grande, anexando um arquivo com a resposta\`\`\` ${info}`, files: [ { attachment: Buffer.from(output.toString()), name: `Eval result (Timestamp: ${Date.now()}).txt` } ], components: [ row ] }));

		const collector = new Discord.InteractionCollector(message.client, {
			message: Msg,
			componentType: 'BUTTON',
			idle: 30000,
		});

		collector.on('collect', async (interaction) => {

			if (interaction.user.id !== message.author.id) {
				return interaction.reply({ content: 'O SEU PNC N É SEU PRA RESPONDER', ephemeral: true });
			}

			collector.stop();
			if (interaction.customId == 'stringify') {
				Msg.edit({ components: [] });
				await interaction.reply({ content: `\`\`\`js\n${JSON.stringify(output, null, 4)}\`\`\` ${info}` }).catch(async err => interaction.reply({ content: `\`\`\`js\nEssa mensagem é muito grande, anexando um arquivo com a resposta\`\`\` ${info}`, files: [ { attachment: await Buffer.from(JSON.stringify(output, null, 4)), name: `Eval result (Timestamp: ${Date.now()}).txt` } ] }));
			}
		});

		collector.on('end', async () => {
			Msg.edit({ components: [] });
		});
	},
};