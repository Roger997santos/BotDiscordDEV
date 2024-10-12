const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,StringSelectMenuBuilder, ButtonBuilder,ButtonStyle,ChannelType} = require('discord.js');
const ProjectManager = require('./class/ProjectManager');

const projectManager = new ProjectManager();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('projeto')
        .setDescription('Gerencia projetos')
        .addSubcommand(subcommand =>
            subcommand
                .setName('criar')
                .setDescription('Cria um novo projeto'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deletar')
                .setDescription('Deleta um projeto existente')),
    async execute(interacao) {
        const subcomando = interacao.options.getSubcommand();

        if (subcomando === 'criar') {
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

                projectManager.addProject({
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

        } else if (subcomando === 'deletar') {
            
            const projetos = projectManager.getProjects();

            if (projetos.length === 0) {
                return interacao.reply({ content: 'Não há projetos para deletar.', ephemeral: true });
            }

            const opcoes = projetos.map(projeto => ({
                label: projeto.name,
                value: projeto.categoryId
            }));

            const linha = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('selecionar_projeto')
                        .setPlaceholder('Selecione um projeto')
                        .addOptions(opcoes)
                );

            await interacao.reply({ content: 'Selecione o projeto que deseja deletar:', components: [linha], ephemeral: true });

            const filtro = i => i.customId === 'selecionar_projeto' && i.user.id === interacao.user.id;
            const coletor = interacao.channel.createMessageComponentCollector({ filter: filtro, time: 60000 });
           
            coletor.on('collect', async interacaoSelecao => {
                const categoriaId = interacaoSelecao.values[0];
                const projeto = projetos.find(p => p.categoryId === categoriaId);
                const categoria = interacao.guild.channels.cache.get(categoriaId);

                if (!categoria) {
                    await interacaoSelecao.update({ content: 'Categoria não encontrada no servidor. Talvez ela já tenha sido deletada.', components: [] });
                    coletor.stop();
                    return;
                }

                const linhaConfirmacao = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirmar_delecao')
                            .setLabel('Confirmar')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancelar_delecao')
                            .setLabel('Cancelar')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interacaoSelecao.update({ content: `Tem certeza que deseja deletar o projeto "${projeto.name}" e todos os seus canais?`, components: [linhaConfirmacao] });

                const filtroBotoes = i => (i.customId === 'confirmar_delecao' || i.customId === 'cancelar_delecao') && i.user.id === interacao.user.id;
                const coletorBotoes = interacao.channel.createMessageComponentCollector({ filter: filtroBotoes, time: 60000 });

                coletorBotoes.on('collect', async interacaoBotao => {
                    // Adiciona deferUpdate para evitar erro de tempo de resposta
                    await interacaoBotao.deferUpdate();

                    if (interacaoBotao.customId === 'confirmar_delecao') {
                        const canais = interacao.guild.channels.cache.filter(canal => canal.parentId === categoria.id);
                        coletorBotoes.stop();
                        try {
                            // Deleta os canais da categoria
                            for (const [idCanal, canal] of canais) {
                                await canal.delete();
                            }
                        
                            // Deleta a categoria
                            await categoria.delete();
                            projectManager.removeProject(categoriaId);
                            
                            // Atualiza com mensagem de sucesso
                            await interacaoBotao.editReply({
                                content: `Projeto "${projeto.name}" e todos os seus canais foram deletados.`,
                                components: []
                            });
                            
                        } catch (error) {
                            console.error('Erro ao deletar projeto e canais:', error);
                            await interacaoBotao.editReply({
                                content: `Ocorreu um erro ao deletar o projeto "${projeto.name}".`,
                                components: []
                            });
                        }
                    } else if (interacaoBotao.customId === 'cancelar_delecao') {
                        await interacaoBotao.editReply({ content: 'Operação cancelada.', components: [] });
                    }
                    coletorBotoes.stop();
                });

                coletorBotoes.on('end', coletado => {
                    if (coletado.size === 0) {
                        interacaoSelecao.editReply({ content: 'Tempo esgotado.', components: [] });
                    }
                });

                coletor.stop();
            });

            coletor.on('end', coletado => {
                if (coletado.size === 0) {
                    interacao.editReply({ content: 'Tempo esgotado.', components: [] });
                }
            });

        } else {
            await interacao.reply('Subcomando não reconhecido.');
        }
    },
};