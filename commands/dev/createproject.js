const {SlashCommandBuilder,ModalBuilder,TextInputBuilder,TextInputStyle,ActionRowBuilder} = require('discord.js');

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

        // Adicionar o campo de texto ao modal
        const modalRow = new ActionRowBuilder().addComponents(projectNameInput);
        modal.addComponents(modalRow);

        // Exibir o modal
        await interaction.showModal(modal);

        // Manipular a submissão do modal
        const filter = (modalInteraction) => modalInteraction.customId === 'modal_nome_projeto';

        // Aguardar a submissão do modal com filtro e tempo limite de 60 segundos
        interaction.awaitModalSubmit({ filter, time: 60_000 })
            .then(async (modalInteraction) => {

                // Pegar o nome do projeto inserido pelo usuário
                const projectName = modalInteraction.fields.getTextInputValue('project_name');

                // Criar a categoria com o nome do projeto
                const category = await modalInteraction.guild.channels.create({
                    name: projectName,
                    type: 4, // Tipo 4 é para categorias
                });

                // Definir o padrão de canais do projeto
                const padraoProjeto = {
                    NomeCanais: [
                        "descrição", "etapas", "github", "links", "ambientes",
                        "docs", "config", "chat", "voz"
                    ],
                    Tipos: [0, 0, 0, 0, 0, 0, 0, 0, 2] // Tipos 0 para texto, 2 para voz
                };

                // Criar os canais do projeto de acordo com o padrão definido
                for (let i = 0; i < padraoProjeto.NomeCanais.length; i++) {
                    await interaction.guild.channels.create({
                        name: padraoProjeto.NomeCanais[i],
                        type: padraoProjeto.Tipos[i],
                        parent: category.id, // Definir a categoria criada como pai
                    });
                }

                // Responder ao usuário informando o sucesso
                await modalInteraction.reply({
                    content: `Projeto "${projectName}" criado com sucesso, incluindo canal de voz!`,
                    ephemeral: true
                });
            })
            .catch(async (error) => {
                console.error(error);

                // Caso ocorra erro, enviar resposta ao usuário
                await interaction.followUp({
                    content: 'Ocorreu um erro ao criar o projeto.',
                    ephemeral: true
                });
            });
    },
};
