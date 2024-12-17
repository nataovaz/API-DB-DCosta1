const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Rotas relacionadas às notas
router.post('/', notaController.createNota);
router.get('/media/:idTurma/:idBimestre', notaController.getMediaNotasByTurmaAndBimestre);
router.get('/total/:idTurma/:idBimestre', notaController.getTotalNotasByTurmaAndBimestre);
router.put('/:idAluno', notaController.updateNota);
router.get('/:idAluno', notaController.getNotasByAluno);
router.get('/chartdata/:idTurma/:idBimestre', notaController.getChartDataByTurmaAndBimestre);

// Buscar nota do aluno para uma matéria, bimestre e turma específicos
router.get('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.getNotaByAlunoAndMateria);

// Criar ou atualizar nota do aluno
router.post('/:idAluno/:idMateria/:idBimestre/:idTurma', notaController.createOrUpdateNota);

// Buscar todas as notas de um aluno em uma turma e bimestre específicos
router.get('/aluno/:idAluno/:idBimestre/:idTurma', notaController.getNotasByAluno);


router.get('/:idTurma/:idBimestre/:idMateria', notaController.getNotasByTurmaAndBimestre);


module.exports = router;
