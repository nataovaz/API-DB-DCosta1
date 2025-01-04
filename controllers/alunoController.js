const db = require('../config/db');

// Criar novo aluno
exports.createAluno = async (req, res) => {
    const { nome, dataNasc } = req.body;
    const query = 'INSERT INTO Alunos (nome, dataNasc) VALUES (?, ?)';
    try {
        await db.query(query, [nome, dataNasc]);
        res.status(201).send('Aluno criado com sucesso');
    } catch (err) {
        console.error('Erro ao criar aluno:', err);
        res.status(500).json({ error: 'Erro ao criar o aluno', details: err });
    }
};

// Listar todos os alunos
exports.getAlunos = async (req, res) => {
    const query = 'SELECT * FROM Alunos';
    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar alunos:', err);
        res.status(500).json({ error: 'Erro ao listar alunos', details: err });
    }
};

// Obter um aluno pelo id
exports.getAlunoById = async (req, res) => {
    const { idAluno } = req.params;
    const query = 'SELECT * FROM Alunos WHERE idAluno = ?';
    try {
        const [results] = await db.query(query, [idAluno]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Erro ao obter aluno:', err);
        res.status(500).json({ error: 'Erro ao obter aluno', details: err });
    }
};

// Atualizar aluno
exports.updateAluno = async (req, res) => {
    const { idAluno } = req.params;
    const { nome, dataNasc } = req.body;
    const query = 'UPDATE Alunos SET nome = ?, dataNasc = ? WHERE idAluno = ?';
    try {
        await db.query(query, [nome, dataNasc, idAluno]);
        res.status(200).send('Aluno atualizado com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar aluno:', err);
        res.status(500).json({ error: 'Erro ao atualizar aluno', details: err });
    }
};

// Listar todos os alunos com notas em uma turma/bimestre
exports.getAlunosComNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT 
                a.nome,
                COALESCE(nba.nota, 'N/A') AS nota
            FROM Alunos a
            JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
            LEFT JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
        `, [idTurma, idBimestre]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum aluno encontrado para a turma/bimestre especificados.' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar alunos com notas:', error);
        res.status(500).json({
            error: 'Erro ao buscar alunos com notas',
            details: error.message,
        });
    }
};

// Deletar aluno
exports.deleteAluno = async (req, res) => {
    const { idAluno } = req.params;
    const query = 'DELETE FROM Alunos WHERE idAluno = ?';
    try {
        await db.query(query, [idAluno]);
        res.status(200).send('Aluno deletado com sucesso');
    } catch (err) {
        console.error('Erro ao deletar aluno:', err);
        res.status(500).json({ error: 'Erro ao deletar aluno', details: err });
    }
};

// Obter nota do aluno pelo id e bimestre
exports.getNotaByAlunoIdAndBimestre = async (req, res) => {
    const { idAluno, idBimestre } = req.params;
    const query = `
        SELECT nba.nota 
        FROM Notas_Bimestre_Aluno nba
        JOIN Bimestre_Alunos ba ON nba.idBimestre_Aluno = ba.idBimestre_Aluno
        WHERE ba.idAluno = ?
          AND ba.idBimestre = ?
    `;
    try {
        const [results] = await db.query(query, [idAluno, idBimestre]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nota não encontrada para o bimestre especificado' });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao obter nota do aluno:', err);
        res.status(500).json({ error: 'Erro ao obter nota do aluno', details: err });
    }
};

// Obter habilidade do aluno pelo id e bimestre
exports.getHabilidadeByAlunoIdAndBimestre = async (req, res) => {
    const { idAluno, idBimestre } = req.params;
    const query = `
        SELECT h.codigo 
        FROM DesempenhoHabilidades dh
        JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
        JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
        WHERE ba.idAluno = ?
          AND ba.idBimestre = ?
    `;
    try {
        const [results] = await db.query(query, [idAluno, idBimestre]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Habilidade não encontrada para o bimestre especificado' });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao obter habilidade do aluno:', err);
        res.status(500).json({ error: 'Erro ao obter habilidade do aluno', details: err });
    }
};

// Listar todos os alunos de um determinado bimestre e professor
exports.getAlunosByBimestreAndProfessor = async (req, res) => {
    const { idBimestre, idProfessor } = req.params;
    const query = `
        SELECT a.idAluno, a.nome, a.dataNasc
        FROM Alunos a
        JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
        JOIN Bimestres b ON ba.idBimestre = b.idBimestre
        JOIN Materias m ON b.idMateria = m.idMateria
        JOIN Turmas t ON m.idTurma = t.idTurma
        WHERE ba.idBimestre = ?
          AND t.idProfessor = ?
    `;
    try {
        const [results] = await db.query(query, [idBimestre, idProfessor]);
        if (results.length === 0) {
            return res.status(404).json({
                error: 'Nenhum aluno encontrado para o bimestre e professor especificados'
            });
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao listar alunos:', err);
        res.status(500).json({ error: 'Erro ao listar alunos', details: err });
    }
};

// Obter alunos da turma
exports.getAlunoByIdTurma = async (req, res) => {
    const { idTurma } = req.params;

    const query = `
        SELECT a.idAluno, a.nome, a.dataNasc, t.nomeSerie
        FROM Alunos a
        JOIN Turmas t ON a.idTurma = t.idTurma
        WHERE t.idTurma = ?;
    `;

    try {
        const [results] = await db.query(query, [idTurma]);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhum aluno encontrado para a turma especificada.' });
        }

        // Retornando os alunos junto com a turma selecionada
        res.status(200).json({ 
            turma: results[0].nomeSerie, 
            alunos: results 
        });
    } catch (err) {
        console.error('Erro ao obter alunos da turma:', err);
        res.status(500).json({ error: 'Erro ao obter alunos da turma.', details: err });
    }
};
