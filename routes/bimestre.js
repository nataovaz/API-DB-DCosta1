const express = require('express');
const router = express.Router();
const bimestreController = require('../controllers/bimestreController');

router.get('/materia/:idMateria', bimestreController.getBimestresByMateria);
router.post('/', bimestreController.createBimestre);
router.put('/:idBimestre', bimestreController.updateBimestre);
router.delete('/:idBimestre', bimestreController.deleteBimestre);

router.get('/:idTurma', bimestreController.getBimestresByTurma);

module.exports = router;
