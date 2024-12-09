const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');

router.post('/', turmaController.createTurma);
router.get('/', turmaController.getTurma);
router.get('/:idProfessor', turmaController.getTurmaProf);
router.put('/:idTurma', turmaController.updateTurma);
router.delete('/:idTurma', turmaController.deleteTurma);

module.exports = router;
