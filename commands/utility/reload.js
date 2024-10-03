const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('recarrega comandos.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('coloque o comando com / que sera recarregado')
				.setRequired(true)),
	async execute(interaction) {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`o comando \`${commandName}\` não existe!`);
		}

		delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

		try {
	        const newCommand = require(`../${command.category}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`Comando \`${newCommand.data.name}\` foi recarregado!`);
		} catch (error) {
	        console.error(error);
	        await interaction.reply(`erro ao recarregar \`${command.data.name}\`:\n\`${error.message}\``);
		}
	},
};