const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Apaga um número específico de mensagens')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Número de mensagens para apagar')
                .setRequired(true)),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'O número deve ser maior que 0.', ephemeral: true });
        }

        // Tenta apagar o número especificado de mensagens
        try {
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            await interaction.reply({ content: `Apagadas ${deletedMessages.size} mensagens.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Houve um erro ao tentar apagar as mensagens. Certifique-se de que elas não têm mais de 14 dias.', ephemeral: true });
        }
    },
};
