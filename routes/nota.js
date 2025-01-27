// routes/nota.js
const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Rotas mais específicas primeiro
// Buscar notas de alunos para avaliação (tipoAvaliacao = 0)
router.get('/avaliacao/:idTurma/:idBimestre/:idMateria', notaController.getNotasAvaliacaoByTurmaBimestreMateria);

// Buscar notas de alunos para doutorzão (tipoAvaliacao = 1)
router.get('/doutorzao/:idTurma/:idBimestre/:idMateria', notaController.getNotasDoutorzaoByTurmaBimestreMateria);

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

// Criar ou atualizar nota de um aluno (que inclui idMateria e idTurma)
router.post('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.createOrUpdateNota);

// Rotas genéricas
router.post('/:idAluno/:idBimestre', notaController.createNota);
router.put('/:idAluno/:idBimestre', notaController.updateNota);

// Buscar todas as notas de uma turma/bimestre/matéria
router.get('/:idTurma/:idBimestre/:idMateria', notaController.getNotasByTurmaAndBimestre);

// Buscar todas as notas de um aluno (SEM filtrar bimestre)
router.get('/:idAluno', notaController.getNotasByAluno);

module.exports = router;
