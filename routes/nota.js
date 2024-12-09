const express = require('express');
const router = express.Router();
const notaController = require('../controllers/notaController');

// Rotas relacionadas às notas
router.get('/media/:idTurma/:idBimestre', notaController.getMediaNotasByTurmaAndBimestre);
router.post('/', notaController.createNota);
router.put('/:idNota', notaController.updateNota);
router.delete('/:idNota', notaController.deleteNota);
router.get('/chartdata/:idTurma/:idBimestre', notaController.getChartDataByTurmaAndBimestre);
router.get('/total/:idTurma/:idBimestre', notaController.getTotalNotasByTurmaAndBimestre);

module.exports = router;
