const { SlashCommandBuilder, PermissionsBitField} = require('discord.js');
const ProjectDataManager = require('./class/ProjectDataManager'); // Importa a classe ProjectDataManager

const ProjectCriar = require('./subCommands/ProjectCriar');
const ProjectDeletar = require('./subCommands/ProjectDeletar');

const projectCriar = new ProjectCriar();
const projectDeletar = new ProjectDeletar();
const dateProject = new ProjectDataManager(); // Instanciando como dateProject

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

        if (interacao.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            
            if (subcomando === 'criar') {
                projectCriar.criar(interacao, dateProject)


            } else if (subcomando === 'deletar') {
                projectDeletar.deletar(interacao, dateProject)

            } else {
                await interacao.reply('Subcomando não reconhecido.');
            }

        } else {

            interacao.reply({ content: 'Você não possui permissão para usar esse comando', ephemeral: true });
            console.log(`Usuário ${interacao.user.tag} usou um comando sem permissão`);

        }
        
        
    },
};
