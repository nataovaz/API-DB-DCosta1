const db = require('../config/db');

// Criar nova turma
exports.createTurma = async (req, res) => {
    const { idProfessor, nomeSerie } = req.body;
    const query = 'INSERT INTO Turmas (idProfessor, nomeSerie) VALUES (?, ?)';
    try {
        await db.query(query, [idProfessor, nomeSerie]);
        res.status(201).send('Turma criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar turma:', err);
        res.status(500).json({ error: 'Erro ao criar turma', details: err });
    }
};

// Listar todas as turmas de um professor
exports.getTurma = async (req, res) => {
    const query = 'SELECT * FROM Turmas';
    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar turmas:', err);
        res.status(500).json({ error: 'Erro ao listar turmas', details: err });
    }
};


exports.getTurmaProf = async (req, res) => {
    const { idProfessor } = req.params;

    try {
        // Primeiro, obtenha as informações do professor
        const [professorResult] = await db.query('SELECT * FROM Professores WHERE idProfessor = ?', [idProfessor]);
        if (professorResult.length === 0) {
            return res.status(404).json({ error: 'Professor não encontrado' });
        }

        const professor = professorResult[0];
        const prioridade = professor.prioridade; // Acessando diretamente o campo prioridade

        //console.log('Prioridade do professor:', prioridade); // Adicionando log para depuração

        let query;
        if (prioridade == 1 || prioridade == "1" || prioridade == "01") {
            query = 'SELECT * FROM Turmas';
        } else if (prioridade == "00" || prioridade == 0 | prioridade == '0') {
            query = 'SELECT * FROM Turmas WHERE idProfessor = ?';
        }
        if (!query) {
            return res.status(400).json({ error: 'Prioridade inválida' });
        }
        const [results] = await db.query(query, [idProfessor]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar turmas:', err);
        res.status(500).json({ error: 'Erro ao listar turmas', details: err });
    }
};

// Atualizar turma
exports.updateTurma = async (req, res) => {
    const { idTurma } = req.params;
    const { idProfessor, nomeSerie } = req.body;
    const query = 'UPDATE Turmas SET idProfessor = ?, nomeSerie = ? WHERE idTurma = ?';
    try {
        await db.query(query, [idProfessor, nomeSerie, idTurma]);
        res.status(200).send('Turma atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar turma:', err);
        res.status(500).json({ error: 'Erro ao atualizar turma', details: err });
    }
};

// Deletar turma
exports.deleteTurma = async (req, res) => {
    const { idTurma } = req.params;
    const query = 'DELETE FROM Turmas WHERE idTurma = ?';
    try {
        await db.query(query, [idTurma]);
        res.status(200).send('Turma deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar turma:', err);
        res.status(500).json({ error: 'Erro ao deletar turma', details: err });
    }
};
