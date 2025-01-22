const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Cria uma nova nota ou atualiza se já existir, 
// exige :idAluno e :idBimestre na rota
router.post('/:idAluno/:idBimestre', notaController.createNota);

// Atualiza a nota para um aluno em um bimestre específico
router.put('/:idAluno/:idBimestre', notaController.updateNota);

// Buscar média de notas por turma e bimestre
router.get('/media/:idTurma/:idBimestre', notaController.getMediaNotasByTurmaAndBimestre);

// Buscar total de notas por turma e bimestre
router.get('/total/:idTurma/:idBimestre', notaController.getTotalNotasByTurmaAndBimestre);

// Buscar todas as notas de um aluno (SEM filtrar bimestre)
router.get('/:idAluno', notaController.getNotasByAluno);

// Dados de gráfico de faixas de nota, por turma e bimestre
router.get('/chartdata/:idTurma/:idBimestre', notaController.getChartDataByTurmaAndBimestre);

// Buscar nota do aluno para uma matéria, bimestre e turma específicos
router.get('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.getNotaByAlunoAndMateria);

// Criar ou atualizar nota do aluno (que inclui idMateria e idTurma)
router.post('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.createOrUpdateNota);

// Buscar todas as notas de um aluno em uma turma e bimestre específicos
router.get('/aluno/:idAluno/:idBimestre/:idTurma', notaController.getNotasByAluno);

// Buscar todas as notas de uma turma/bimestre/matéria
router.get('/:idTurma/:idBimestre/:idMateria', notaController.getNotasByTurmaAndBimestre);

module.exports = router;
