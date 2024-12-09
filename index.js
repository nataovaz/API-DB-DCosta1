const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Importar rotas
const professorRoutes = require('./routes/professor');
const turmaRoutes = require('./routes/turma');
const alunoRoutes = require('./routes/aluno');
const habilidadeRoutes = require('./routes/habilidade');
const notaRoutes = require('./routes/nota');
const materiaRoutes = require('./routes/materia');



// Usar rotas
app.use('/api/professores', professorRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/habilidades', habilidadeRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/materias', materiaRoutes);  // Adicione esta linha

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/test', (req, res) => {
    res.send('API is working!');
});
