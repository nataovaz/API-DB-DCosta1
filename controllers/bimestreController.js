const db = require('../config/db');

// Criar novo bimestre
exports.createBimestre = async (req, res) => {
    const { descricao, idMateria } = req.body;
    const query = 'INSERT INTO Bimestres (descricao, idMateria) VALUES (?, ?)';
    try {
        await db.query(query, [descricao, idMateria]);
        res.status(201).send('Bimestre criado com sucesso');
    } catch (err) {
        console.error('Erro ao criar bimestre:', err);
        res.status(500).json({ error: 'Erro ao criar bimestre', details: err });
    }
};

// Atualizar bimestre
exports.updateBimestre = async (req, res) => {
    const { idBimestre } = req.params;
    const { descricao, idMateria } = req.body;
    const query = 'UPDATE Bimestres SET descricao = ?, idMateria = ? WHERE idBimestre = ?';
    try {
        await db.query(query, [descricao, idMateria, idBimestre]);
        res.status(200).send('Bimestre atualizado com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar bimestre:', err);
        res.status(500).json({ error: 'Erro ao atualizar bimestre', details: err });
    }
};

// Deletar bimestre
exports.deleteBimestre = async (req, res) => {
    const { idBimestre } = req.params;
    const query = 'DELETE FROM Bimestres WHERE idBimestre = ?';
    try {
        await db.query(query, [idBimestre]);
        res.status(200).send('Bimestre deletado com sucesso');
    } catch (err) {
        console.error('Erro ao deletar bimestre:', err);
        res.status(500).json({ error: 'Erro ao deletar bimestre', details: err });
    }
};

// Buscar bimestres por matéria
exports.getBimestresByMateria = async (req, res) => {
    const { idMateria } = req.params;
    const query = 'SELECT * FROM Bimestres WHERE idMateria = ?';
    try {
        const [results] = await db.query(query, [idMateria]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar bimestres por matéria:', err);
        res.status(500).json({ error: 'Erro ao buscar bimestres por matéria', details: err });
    }
};
