
class ProjectCriar {
  
    async criar(interacao,dateProject){
        const {ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType } = require('discord.js'); 

        const modal = new ModalBuilder()
                .setCustomId('modal_nome_projeto')
                .setTitle('Criar Novo Projeto');

            const entradaNomeProjeto = new TextInputBuilder()
                .setCustomId('nome_projeto')
                .setLabel('Nome do Projeto')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(25);

            const linhaModal = new ActionRowBuilder().addComponents(entradaNomeProjeto);
            modal.addComponents(linhaModal);

            await interacao.showModal(modal);

            try {
                const interacaoModal = await interacao.awaitModalSubmit({
                    filter: (modalInteracao) => modalInteracao.customId === 'modal_nome_projeto' && modalInteracao.user.id === interacao.user.id,
                    time: 60_000
                });

                await interacaoModal.deferReply({ ephemeral: true });

                const nomeProjeto = interacaoModal.fields.getTextInputValue('nome_projeto');

                const categoria = await interacaoModal.guild.channels.create({
                    name: nomeProjeto,
                    type: ChannelType.GuildCategory,
                });

                const padraoProjeto = {
                    nomesCanais: [
                        "descrição", "etapas", "github", "links", "ambientes",
                        "docs", "config", "chat", "voz"
                    ],
                    tipos: [
                        ChannelType.GuildText, ChannelType.GuildText, ChannelType.GuildText,
                        ChannelType.GuildText, ChannelType.GuildText, ChannelType.GuildText,
                        ChannelType.GuildText, ChannelType.GuildText, ChannelType.GuildVoice
                    ]
                };

                for (let i = 0; i < padraoProjeto.nomesCanais.length; i++) {
                    await interacao.guild.channels.create({
                        name: padraoProjeto.nomesCanais[i],
                        type: padraoProjeto.tipos[i],
                        parent: categoria.id,
                    });
                }

                dateProject.addProject({
                    name: nomeProjeto,
                    categoryId: categoria.id,
                    createdBy: interacao.user.id,
                    createdAt: new Date().toISOString()
                });

                await interacaoModal.editReply({
                    content: `Projeto "${nomeProjeto}" criado com sucesso!`,
                });

            } catch (erro) {
                console.error('Erro na submissão do modal:', erro);

                await interacao.followUp({
                    content: 'Ocorreu um erro ao criar o projeto. Por favor, tente novamente.',
                    ephemeral: true
                });
            }

    }

}

module.exports = ProjectCriar;