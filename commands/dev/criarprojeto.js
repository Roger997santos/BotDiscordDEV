const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createproject')
        .setDescription('Cria um novo projeto com o nome fornecido'),

    async execute(interaction) {
        // Criar o modal para capturar o nome do projeto
        const modal = new ModalBuilder()
            .setCustomId('modal_nome_projeto')
            .setTitle('Criar Novo Projeto');

        // Campo de texto para o nome do projeto
        const projectNameInput = new TextInputBuilder()
            .setCustomId('project_name')
            .setLabel('Nome do Projeto')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Adicionar o campo ao modal
        const modalRow = new ActionRowBuilder().addComponents(projectNameInput);
        modal.addComponents(modalRow);
        

        // Exibir o modal
        await interaction.showModal(modal);

        // Manipular a submissão do modal
        const filter = (modalInteraction) => modalInteraction.customId === 'modal_nome_projeto';
        interaction.awaitModalSubmit({ filter, time: 60_000 })
            .then(async (modalInteraction) => {
                const projectName = modalInteraction.fields.getTextInputValue('project_name');

                // Criar o canal com o nome fornecido
                await modalInteraction.guild.channels.create({
                    name: projectName,
                    type: 4, // 0 é o tipo de canal de texto
                });

                


                // Responder ao usuário
                await modalInteraction.reply({ content: `Projeto "${projectName}" criado com sucesso!`, ephemeral: true });
            })
            .catch(async (error) => {
                console.error(error);
                await interaction.followUp({ content: 'Ocorreu um erro ao criar o projeto.', ephemeral: true });
            });
    },
};
