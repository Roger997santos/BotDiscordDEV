const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');



module.exports = {
    data: new SlashCommandBuilder()
        .setName('dev')
        .setDescription('Abre menu de projetos'),

    async execute(interaction) {
        // Criar o botão "Novo Projeto"
        const novoProjeto = new ButtonBuilder()
            .setCustomId('novo_proj')
            .setLabel('Novo Projeto')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(novoProjeto);

        // Responder com o botão
        await interaction.reply({ content: 'Escolha uma opção:', components: [row] });

        // Coletar a interação com o botão
        const collectorFilter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter: collectorFilter, time: 60_000 });

        


        collector.on('collect', async (buttonInteraction) => {
  


            await buttonInteraction.deferUpdate(); // Reconhecer o clique do botão

            if (buttonInteraction.customId === 'novo_proj') {
              
                     


                
                    
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ content: 'Confirmação não recebida dentro de 1 minuto, cancelando.', components: [] });
            }
        });
    },
};
