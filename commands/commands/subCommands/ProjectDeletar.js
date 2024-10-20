class ProjectDeletar {
    async deletar(interacao,dateProject) {
        const {ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const projetos = dateProject.getProjects();

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
                await interacaoBotao.deferUpdate();

                if (interacaoBotao.customId === 'confirmar_delecao') {
                    const canais = interacao.guild.channels.cache.filter(canal => canal.parentId === categoria.id);
                    coletorBotoes.stop();
                    try {
                        for (const [idCanal, canal] of canais) {
                            await canal.delete().catch(err => console.error(`Erro ao deletar o canal ${canal.name}:`, err));
                        }

                        await categoria.delete();
                        dateProject.removeProject(categoriaId);

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

    }
}

module.exports = ProjectDeletar;
