// routes/nota.js
const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Cria uma nova nota ou atualiza se já existir, 
// exige :idAluno e :idBimestre na rota
router.post('/:idAluno/:idBimestre', notaController.createNota);

// Atualiza a nota para um aluno em um bimestre específico
router.put('/:idAluno/:idBimestre', notaController.updateNota);

// Média das notas do tipo avaliação por turma e bimestre
router.get('/media/avaliacao/:idTurma/:idBimestre', notaController.getMediaAvaliacaoByTurmaAndBimestre);

// Média das notas do tipo doutorzão por turma e bimestre
router.get('/media/doutorzao/:idTurma/:idBimestre', notaController.getMediaDoutorzaoByTurmaAndBimestre);


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


// Buscar notas de alunos para avaliação (tipoAvaliacao = 0)
router.get('/avaliacao/:idTurma/:idBimestre/:idMateria', notaController.getNotasAvaliacaoByTurmaBimestreMateria);

// Buscar notas de alunos para doutorzão (tipoAvaliacao = 1)
router.get('/doutorzao/:idTurma/:idBimestre/:idMateria', notaController.getNotasDoutorzaoByTurmaBimestreMateria);



module.exports = router;
