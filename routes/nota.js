const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Rotas relacionadas às notas

// Criar nota, agora exigindo o bimestre
router.post('/:idAluno/:idBimestre', notaController.createNota);
router.put('/:idAluno/:idBimestre', notaController.updateNota);

// Buscar média de notas por turma e bimestre
router.get('/media/:idTurma/:idBimestre', notaController.getMediaNotasByTurmaAndBimestre);

// Buscar total de notas por turma e bimestre
router.get('/total/:idTurma/:idBimestre', notaController.getTotalNotasByTurmaAndBimestre);

router.get('/:idAluno', notaController.getNotasByAluno);

router.get('/chartdata/:idTurma/:idBimestre', notaController.getChartDataByTurmaAndBimestre);

// Buscar nota do aluno para uma matéria, bimestre e turma específicos
router.get('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.getNotaByAlunoAndMateria);

// Criar ou atualizar nota do aluno (nesse exemplo, se quiser manter)
router.post('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.createOrUpdateNota);

// Buscar todas as notas de um aluno em uma turma e bimestre específicos
router.get('/aluno/:idAluno/:idBimestre/:idTurma', notaController.getNotasByAluno);

// Buscar todas as notas de uma turma/bimestre/matéria
router.get('/:idTurma/:idBimestre/:idMateria', notaController.getNotasByTurmaAndBimestre);

module.exports = router;
