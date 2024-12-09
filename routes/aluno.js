const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const notaController = require('../controllers/notaController');

// Rotas relacionadas aos alunos
router.post('/', alunoController.createAluno);
router.get('/', alunoController.getAlunos);
router.get('/:idAluno', alunoController.getAlunoById);
router.put('/:idAluno', alunoController.updateAluno);
router.delete('/:idAluno', alunoController.deleteAluno);

// Rota para obter alunos por turma
router.get('/turma/:idTurma', alunoController.getAlunoByIdTurma);

// Rotas relacionadas às notas e habilidades dos alunos em uma turma e bimestre
router.get('/notas/media/:idTurma/:idBimestre', notaController.getMediaNotasByTurmaAndBimestre);
router.get('/alunoscomnotas/:idTurma/:idBimestre', alunoController.getAlunosComNotasByTurmaAndBimestre);
router.get('/:idAluno/habilidades/:idBimestre', alunoController.getHabilidadeByAlunoIdAndBimestre);
router.get('/:idAluno/notas/:idBimestre', alunoController.getNotaByAlunoIdAndBimestre);

// Rota para obter alunos por bimestre e professor
router.get('/bimestre/:idBimestre/professor/:idProfessor', alunoController.getAlunosByBimestreAndProfessor);

module.exports = router;
