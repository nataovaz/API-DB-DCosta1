// routes/nota.js
const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Rotas mais específicas primeiro
// Buscar notas de alunos para avaliação (tipoAvaliacao = 0)
router.get('/avaliacao/:idTurma/:idBimestre/:idMateria', notaController.getNotasAvaliacaoByTurmaBimestreMateria);


// Média das notas do tipo avaliação por turma e bimestre
router.get('/media/avaliacao/:idTurma/:idBimestre', notaController.getMediaAvaliacaoByTurmaAndBimestre);

// Média das notas do tipo doutorzão por turma e bimestre
router.get('/media/doutorzao/:idTurma/:idBimestre', notaController.getMediaDoutorzaoByTurmaAndBimestre);

// Buscar total de notas por turma e bimestre
router.get('/total/:idTurma/:idBimestre', notaController.getTotalNotasByTurmaAndBimestre);

// Dados de gráfico de faixas de nota, por turma e bimestre
router.get('/chartdata/:idTurma/:idBimestre', notaController.getChartDataByTurmaAndBimestre);

// Rotas relacionadas a um aluno específico
router.get('/aluno/:idAluno/:idBimestre/:idTurma', notaController.getNotasByAluno);
router.get('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.getNotaByAlunoAndMateria);

// Criar ou atualizar nota considerando tipoAvaliacao
router.post('/:idAluno/:idMateria/:idBimestre/:idTurma/:tipoAvaliacao', notaController.createOrUpdateNota);


// Rotas genéricas
router.post('/:idAluno/:idBimestre', notaController.createNota);
router.put('/:idAluno/:idBimestre', notaController.updateNota);


// **Atualizações separadas por tipo de avaliação**
router.put('/:idAluno/:idBimestre/:tipoAvaliacao', notaController.updateNotaTipoAvaliacao);


// Buscar todas as notas de uma turma/bimestre/matéria
router.get('/turma/:idTurma/bimestre/:idBimestre/materia/:idMateria', notaController.getNotasByTurmaAndBimestre);
router.get('/doutorzao/:idTurma/:idBimestre/:idMateria', notaController.getNotasDoutorzaoByTurmaBimestreMateria);



// Buscar todas as notas de um aluno (SEM filtrar bimestre)
router.get('/:idAluno', notaController.getNotasByAluno);

module.exports = router;
