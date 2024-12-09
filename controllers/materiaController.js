const db = require('../config/db');


exports.getMateria = async (req, res) => {
    const query = `SELECT * FROM Materias`;
    try {
        const [results] = await db.query(query);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma matéria encontrada para a turma fornecida' });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar matéria por ID de turma:', err);
        res.status(500).json({ error: 'Erro ao buscar matéria por ID de turma', details: err });
    }
};


// Listar todas as matérias e seus bimestres
exports.getMateriasAndBimestres = async (req, res) => {
    const query = `
        SELECT m.idMateria, m.nomeMateria, b.idBimestre, b.descricao
        FROM Materias m
        JOIN Bimestres b ON m.idMateria = b.idMateria
    `;
    try {
        const [results] = await db.query(query);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma matéria encontrada' });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar matérias e bimestres:', err);
        res.status(500).json({ error: 'Erro ao listar matérias e bimestres', details: err });
    }
};



exports.getMateriasAndBimestresTurma = async (req, res) => {
    const { idTurma } = req.params;
    const query = `
        SELECT * FROM (SELECT m.idTurma, m.idMateria, m.nomeMateria, b.idBimestre, b.descricao 
        FROM Materias m JOIN Bimestres b ON m.idMateria = b.idMateria) AS sub
        WHERE idTurma = ?
    `;
    try {
        const [results] = await db.query(query, [idTurma]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma matéria encontrada' });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar matérias e bimestres do idTurma:', err);
        res.status(500).json({ error: 'Erro ao listar matérias e bimestres do idTurma', details: err });
    }
};

// Listar matéria por ID de bimestre
/*exports.getMateriaByBimestre = async (req, res) => {
    const { idBimestre } = req.params;
    const query = `
        SELECT m.idMateria, m.nomeMateria
        FROM Materias m
        JOIN Bimestres b ON m.idMateria = b.idMateria
        WHERE b.idBimestre = ?
    `;
    try {
        const [results] = await db.query(query, [idBimestre]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma matéria encontrada para o bimestre fornecido' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Erro ao buscar matéria por ID de bimestre:', err);
        res.status(500).json({ error: 'Erro ao buscar matéria por ID de bimestre', details: err });
    }
};
*/

exports.getMateriaByTurma = async (req, res) => {
    const { idTurma } = req.params;
    const query = `SELECT * FROM Materias WHERE idTurma = ?`;
    try {
        const [results] = await db.query(query, [idTurma]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhuma matéria encontrada para a turma fornecida' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Erro ao buscar matéria por ID de turma:', err);
        res.status(500).json({ error: 'Erro ao buscar matéria por ID de turma', details: err });
    }
};