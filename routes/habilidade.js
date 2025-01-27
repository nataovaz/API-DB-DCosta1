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
router.get('/stats/:idTurma/:idBimestre/:tipoAvaliacao', habilidadeController.getHabilidadesStatsByTurmaBimestreAndTipoAvaliacao);
router.get('/top5/:idTurma/:idBimestre/:tipoAvaliacao', habilidadeController.getTop5HabilidadesByTurmaBimestreAndTipoAvaliacao);
router.get('/top5erros/:idTurma/:idBimestre/:tipoAvaliacao', habilidadeController.getTop5ErrosByTurmaBimestreAndTipoAvaliacao);
router.get('/alunos/:idTurma/:idBimestre/:tipoAvaliacao', habilidadeController.getHabilidadesStatsByAlunoBimestreAndTipoAvaliacao);


module.exports = router;
