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

// Estatísticas de habilidades por turma, bimestre e tipo de avaliação
router.get(
    '/stats/:idTurma/:idBimestre/:tipoAvaliacao',
    habilidadeController.getHabilidadesStatsByTurmaBimestreAndTipoAvaliacao
);

// Top 5 habilidades mais acertadas
router.get(
    '/top5/:idTurma/:idBimestre/:tipoAvaliacao',
    habilidadeController.getTop5HabilidadesByTurmaBimestreAndTipoAvaliacao
);

// Top 5 habilidades menos acertadas
router.get(
    '/top5erros/:idTurma/:idBimestre/:tipoAvaliacao',
    habilidadeController.getTop5ErrosByTurmaBimestreAndTipoAvaliacao
);

// Estatísticas por aluno, bimestre e tipo de avaliação
router.get(
    '/alunos/:idTurma/:idBimestre/:tipoAvaliacao',
    habilidadeController.getHabilidadesStatsByAlunoAndBimestre
);

module.exports = router;
