const express = require('express');
const router = express.Router();
const habilidadeController = require('../controllers/habilidadeController');

// Estatísticas de habilidades (mais/menos acertadas) por turma, bimestre e matéria
router.get('/stats/:idTurma/:idBimestre/:idMateria', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);

// Top 5 habilidades mais acertadas
router.get('/top5/:idTurma/:idBimestre', habilidadeController.getTop5HabilidadesByTurmaAndBimestre);

// Criar nova habilidade
router.post('/', habilidadeController.createHabilidade);

// Criar nova habilidade se não existir
router.post('/create-if-not-exists', habilidadeController.createHabilidadeIfNotExists);

// Atualizar habilidade
router.put('/:idHabilidade', habilidadeController.updateHabilidade);

// Deletar habilidade
router.delete('/:idHabilidade', habilidadeController.deleteHabilidade);

// Listar todas as habilidades
router.get('/', habilidadeController.getHabilidades);

// Estatísticas de habilidades por aluno e bimestre (para cada aluno)
router.get('/habilidadesalunos/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByAlunoAndBimestre);

// Top 5 erros (habilidades menos dominadas)
router.get('/top5erros/:idTurma/:idBimestre', habilidadeController.getTop5ErrosByTurmaAndBimestre);

module.exports = router;
