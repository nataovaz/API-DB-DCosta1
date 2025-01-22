const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.json());

// Importar rotas
const professorRoutes = require('../routes/professor');
const turmaRoutes = require('../routes/turma');
const alunoRoutes = require('../routes/aluno');
const habilidadeRoutes = require('../routes/habilidade');
const notaRoutes = require('../routes/nota');
const materiaRoutes = require('../routes/materia');
const bimestreRoutes = require('../routes/bimestre');

// Registrar as rotas
// Exemplo: GET /api/habilidade => chama as rotas definidas em habilidadeRoutes
app.use('/api/professores', professorRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/habilidade', habilidadeRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/bimestres', bimestreRoutes);


// Rota de teste
app.get('/test', (req, res) => {
  res.send('API is working!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
