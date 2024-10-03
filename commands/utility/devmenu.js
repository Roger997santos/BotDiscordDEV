const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Abre menu de projetos'),
        async execute(interaction) {
            //const target = interaction.options.getUser('target');
            //const reason = interaction.options.getString('reason') ?? 'No reason provided';
    
            const novoProjeto = new ButtonBuilder()
                .setCustomId('novo_proj')
                .setLabel('Novo Projeto')
                .setStyle(ButtonStyle.Primary);
    
            const editarProjeto = new ButtonBuilder()
                .setCustomId('editar_proj')
                .setLabel('Editar Projeto')
                .setStyle(ButtonStyle.Primary);
    
            const row = new ActionRowBuilder()
                .addComponents(novoProjeto, editarProjeto);
    
            

            const response = await interaction.reply({
                components: [row],
            });
            
            const collectorFilter = i => i.user.id === interaction.user.id;
            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
            
                if (confirmation.customId === 'editar_proj') {
                 
              
                    await confirmation.update({ content: `Projeto editado`, components: [] });
                } else if (confirmation.customId === 'novo_proj') {
                    await confirmation.update({ content: 'Novo projeto criado', components: [] });
                }
            } catch (e) {
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
            }

        },
};