const db = require('../config/db');

// Criar novo professor
exports.createProfessor = async (req, res) => {
    const { nome, dataNasc, prioridade, cpf, senha } = req.body;
    const query = 'INSERT INTO Professores (nome, dataNasc, prioridade, cpf, senha) VALUES (?, ?, ?, ?, ?)';
    try {
        await db.query(query, [nome, dataNasc, prioridade, cpf, senha]);
        res.status(201).send('Professor criado com sucesso');
    } catch (err) {
        console.error('Erro ao criar professor:', err);
        res.status(500).json({ error: 'Erro ao criar professor', details: err });
    }
};

// Listar todos os professores
exports.getProfessores = async (req, res) => {
    const query = 'SELECT * FROM Professores';
    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar professores:', err);
        res.status(500).json({ error: 'Erro ao listar professores', details: err });
    }
};

// Procurar Professor Pelo CPF
exports.getProfessoresByCPF = async (req, res) => {
    const { cpf } = req.params;
    const query = 'SELECT * FROM Professores WHERE cpf = ?';
    try {
        const [results] = await db.query(query, [cpf]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao procurar professor:', err);
        res.status(500).json({ error: 'Erro ao procurar professor', details: err });
    }
};

// Atualizar professor
exports.updateProfessor = async (req, res) => {
    const { idProfessor } = req.params;
    const { nome, dataNasc, prioridade, cpf, senha } = req.body;
    const query = 'UPDATE Professores SET nome = ?, dataNasc = ?, prioridade = ?, cpf = ?, senha = ? WHERE idProfessor = ?';
    try {
        await db.query(query, [nome, dataNasc, prioridade, cpf, senha, idProfessor]);
        res.status(200).send('Professor atualizado com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar professor:', err);
        res.status(500).json({ error: 'Erro ao atualizar professor', details: err });
    }
};

// Deletar professor
exports.deleteProfessor = async (req, res) => {
    const { idProfessor } = req.params;
    const query = 'DELETE FROM Professores WHERE idProfessor = ?';
    try {
        await db.query(query, [idProfessor]);
        res.status(200).send('Professor deletado com sucesso');
    } catch (err) {
        console.error('Erro ao deletar professor:', err);
        res.status(500).json({ error: 'Erro ao deletar professor', details: err });
    }
};
