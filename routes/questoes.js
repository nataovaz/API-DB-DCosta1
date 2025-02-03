const express = require('express');
const router = express.Router();
const questaoController = require('../controllers/questoesController');

// Criar ou atualizar notas de questões associadas ao aluno, bimestre e matéria
router.post('/:idAluno/:idBimestre', questaoController.createNotaQuestao);

// Buscar notas de questões e habilidades de um aluno por bimestre e matéria
router.get('/:idAluno/:idBimestre', questaoController.getNotasQuestoesByAluno);

module.exports = router;
