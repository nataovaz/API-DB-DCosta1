const express = require('express');
const router = express.Router();
const habilidadeController = require('../controllers/habilidadeController');

// 1) Criar nova habilidade
router.post('/', habilidadeController.createHabilidade);

// 2) Criar nova habilidade se não existir
router.post('/create-if-not-exists', habilidadeController.createHabilidadeIfNotExists);

// 3) Atualizar habilidade
router.put('/:idHabilidade', habilidadeController.updateHabilidade);

// 4) Deletar habilidade
router.delete('/:idHabilidade', habilidadeController.deleteHabilidade);

// 5) Listar todas as habilidades
router.get('/', habilidadeController.getHabilidades);

// 6) Estatísticas de habilidades (mais/menos acertadas) — VERSÃO COM 3 PARÂMETROS
//    Ex: /api/habilidade/stats/31/1/27
router.get('/stats/:idTurma/:idBimestre/:idMateria', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);

// 6.1) (Opcional) Estatísticas de habilidades sem "idMateria" — VERSÃO COM 2 PARÂMETROS
//     Se seu controller aceitar sem idMateria, você pode expor esta rota:
router.get('/stats/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);

// 7) Top 5 habilidades mais acertadas
router.get('/top5/:idTurma/:idBimestre', habilidadeController.getTop5HabilidadesByTurmaAndBimestre);

// 8) Top 5 erros (habilidades menos dominadas)
router.get('/top5erros/:idTurma/:idBimestre', habilidadeController.getTop5ErrosByTurmaAndBimestre);

// 9) Estatísticas de habilidades por aluno e bimestre
router.get('/habilidadesalunos/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByAlunoAndBimestre);

module.exports = router;
