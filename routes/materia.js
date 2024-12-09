const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');

router.get('/', materiaController.getMateria);  
router.get('/bimestres', materiaController.getMateriasAndBimestres);
//router.get('/:idBimestre', materiaController.getMateriaByBimestre);  // Adicione esta linha
router.get('/:idTurma', materiaController.getMateriaByTurma);  
router.get('/bimestres/:idTurma', materiaController.getMateriasAndBimestresTurma);


module.exports = router;
