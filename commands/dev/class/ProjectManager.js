const fs = require('fs');
const path = require('path');

// Classe para gerenciar projetos
class ProjectManager {
    constructor() {
        // Define o caminho absoluto para o arquivo projects.json na raiz do projeto
        this.filePath = path.resolve(__dirname, '..', 'projects.json');
        this.projects = this.loadProjects();
    }

    // Carrega os projetos do arquivo JSON
    loadProjects() {
        if (fs.existsSync(this.filePath)) {
            const data = fs.readFileSync(this.filePath, 'utf8');
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Erro ao parsear o arquivo projects.json:', error);
                return [];
            }
        } else {
            return [];
        }
    }

    // Salva os projetos no arquivo JSON
    saveProjects() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.projects, null, 4), 'utf8');
        } catch (error) {
            console.error('Erro ao salvar o arquivo projects.json:', error);
        }
    }

    // Adiciona um novo projeto
    addProject(project) {
        this.projects.push(project);
        this.saveProjects();
    }

    // Remove um projeto pelo ID da categoria
    removeProject(categoryId) {
        this.projects = this.projects.filter(project => project.categoryId !== categoryId);
        this.saveProjects();
    }

    // Obtém todos os projetos
    getProjects() {
        return this.projects;
    }
}

module.exports = ProjectManager;
