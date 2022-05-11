'use strict';

const Discord = require('discord.js');

// Cria uma nova função que será exportada
// Essa função vai converter o texto em uma mensagem Embed, "Bonitinha"
function embed(text) {
	return {
		embeds: [new Discord.MessageEmbed().setDescription(text).setColor('RANDOM')],
	};
}

// Exporta a função
module.exports = {
	embed,
};