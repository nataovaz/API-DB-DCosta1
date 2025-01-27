// routes/habilidade.js
const express = require('express');
const router = express.Router();
const habilidadeController = require('../controllers/habilidadeController');

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

// Estatísticas de habilidades (mais/menos acertadas) — VERSÃO COM 3 PARÂMETROS
// Ex: /api/habilidade/stats/31/1/27
router.get('/stats/:idTurma/:idBimestre/:idMateria', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);

// Estatísticas de habilidades sem "idMateria" — VERSÃO COM 2 PARÂMETROS
// Ex: /api/habilidade/stats/31/1
router.get('/stats/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);

// Top 5 habilidades mais acertadas
router.get('/top5/:idTurma/:idBimestre', habilidadeController.getTop5HabilidadesByTurmaAndBimestre);

// Top 5 erros (habilidades menos dominadas)
router.get('/top5erros/:idTurma/:idBimestre', habilidadeController.getTop5ErrosByTurmaAndBimestre);

// Estatísticas de habilidades por aluno e bimestre
router.get('/habilidadesalunos/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByAlunoAndBimestre);

module.exports = router;
