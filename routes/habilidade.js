const express = require('express');
const router = express.Router();
const habilidadeController = require('../controllers/habilidadeController');

// Rotas relacionadas às habilidades
router.get('/stats/:idTurma/:idBimestre/:idMateria', habilidadeController.getHabilidadesStatsByTurmaAndBimestre);
router.get('/top5/:idTurma/:idBimestre', habilidadeController.getTop5HabilidadesByTurmaAndBimestre);
router.post('/', habilidadeController.createHabilidade);
router.post('/create-if-not-exists', habilidadeController.createHabilidadeIfNotExists);
router.put('/:idHabilidade', habilidadeController.updateHabilidade);
router.delete('/:idHabilidade', habilidadeController.deleteHabilidade);
router.get('/', habilidadeController.getHabilidades);
router.get('/habilidadesalunos/:idTurma/:idBimestre', habilidadeController.getHabilidadesStatsByAlunoAndBimestre);
router.get('/top5erros/:idTurma/:idBimestre', habilidadeController.getTop5ErrosByTurmaAndBimestre);

module.exports = router;
