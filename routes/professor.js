const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');

router.post('/', professorController.createProfessor);
router.get('/', professorController.getProfessores);
router.get('/:cpf', professorController.getProfessoresByCPF);
router.put('/:idProfessor', professorController.updateProfessor);
router.delete('/:idProfessor', professorController.deleteProfessor);

module.exports = router;
