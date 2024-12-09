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


exports.getAlunosComNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT a.nome, IFNULL(n.nota, 'N/A') AS nota
            FROM Alunos a
            LEFT JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno AND ba.idBimestre = ?
            LEFT JOIN Notas n ON ba.idBimestre_Aluno = n.idBimestre_Aluno
            LEFT JOIN Avaliacoes av ON n.idAvaliacao = av.idAvaliacao
            WHERE a.idTurma = ?
        `, [idBimestre, idTurma]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum aluno encontrado para a turma e bimestre especificados' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar alunos com notas:', error);
        res.status(500).json({
            error: 'Erro ao buscar alunos com notas',
            details: error
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
        SELECT n.nota 
        FROM Notas n
        JOIN Bimestre_Alunos ba ON n.idBimestre_Aluno = ba.idBimestre_Aluno
        WHERE ba.idAluno = ? AND ba.idBimestre = ?`;
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
        WHERE ba.idAluno = ? AND ba.idBimestre = ?`;
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
         WHERE ba.idBimestre = ? AND t.idProfessor = ?`;
     try {
         const [results] = await db.query(query, [idBimestre, idProfessor]);
         if (results.length === 0) {
             return res.status(404).json({ error: 'Nenhum aluno encontrado para o bimestre e professor especificados' });
         }
         res.status(200).json(results);
     } catch (err) {
         console.error('Erro ao listar alunos:', err);
         res.status(500).json({ error: 'Erro ao listar alunos', details: err });
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
         WHERE ba.idBimestre = ? AND t.idProfessor = ?`;
     try {
         const [results] = await db.query(query, [idBimestre, idProfessor]);
         if (results.length === 0) {
             return res.status(404).json({ error: 'Nenhum aluno encontrado para o bimestre e professor especificados' });
         }
         res.status(200).json(results);
     } catch (err) {
         console.error('Erro ao listar alunos:', err);
         res.status(500).json({ error: 'Erro ao listar alunos', details: err });
     }
 };
 

 exports.getAlunoByIdTurma = async (req, res) => {
    const { idTurma } = req.params;
    const query = `
        SELECT *
        FROM Alunos a
        WHERE a.idTurma = ?`;
    try {
        const [results] = await db.query(query, [idTurma]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Aluno desta turma não encontrado' });
        }
        // Encapsular o array em um objeto
        res.status(200).json({ alunos: results });
    } catch (err) {
        console.error('Erro ao obter aluno da turma:', err);
        res.status(500).json({ error: 'Erro ao obter aluno da turma:', details: err });
    }
};