const db = require('../config/db');

// Criar nova nota
exports.createNota = async (req, res) => {
    const { idBimestre_Aluno, idAvaliacao, nota } = req.body;
    const query = 'INSERT INTO Notas (idBimestre_Aluno, idAvaliacao, nota) VALUES (?, ?, ?)';
    try {
        await db.query(query, [idBimestre_Aluno, idAvaliacao, nota]);
        res.status(201).send('Nota criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar nota:', err);
        res.status(500).json({ error: 'Erro ao criar nota', details: err });
    }
};

// Buscar média de notas por turma e bimestre
exports.getMediaNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT AVG(n.nota) as mediaNota
            FROM Notas n
            JOIN Bimestre_Alunos ba ON n.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Turmas t ON a.idTurma = t.idTurma
            WHERE t.idTurma = ? AND ba.idBimestre = ?;
        `, [idTurma, idBimestre]);

        const mediaNota = rows.length > 0 ? rows[0].mediaNota : 0;
        
        res.json({ mediaNota });
    } catch (error) {
        console.error('Erro ao buscar média de notas:', error);
        res.status(500).json({
            error: 'Erro ao buscar média de notas',
            details: error
        });
    }
};


// Buscar o total de notas por turma e bimestre
exports.getTotalNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT COUNT(n.idNota) as totalNotas
            FROM Notas n
            JOIN Bimestre_Alunos ba ON n.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Turmas t ON a.idTurma = t.idTurma
            WHERE t.idTurma = ? AND ba.idBimestre = ?;
        `, [idTurma, idBimestre]);

        const totalNotas = rows.length > 0 ? rows[0].totalNotas : 0;

        res.json({ totalNotas });
    } catch (error) {
        console.error('Erro ao buscar total de notas:', error);
        res.status(500).json({
            error: 'Erro ao buscar total de notas',
            details: error
        });
    }
};


// Atualizar nota
exports.updateNota = async (req, res) => {
    const { idNota } = req.params;
    const { idBimestre_Aluno, idAvaliacao, nota } = req.body;
    const query = 'UPDATE Notas SET idBimestre_Aluno = ?, idAvaliacao = ?, nota = ? WHERE idNota = ?';
    try {
        await db.query(query, [idBimestre_Aluno, idAvaliacao, nota, idNota]);
        res.status(200).send('Nota atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar nota:', err);
        res.status(500).json({ error: 'Erro ao atualizar nota', details: err });
    }
};

// Deletar nota
exports.deleteNota = async (req, res) => {
    const { idNota } = req.params;
    const query = 'DELETE FROM Notas WHERE idNota = ?';
    try {
        await db.query(query, [idNota]);
        res.status(200).send('Nota deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar nota:', err);
        res.status(500).json({ error: 'Erro ao deletar nota', details: err });
    }
};

exports.getAlunosComNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT a.nome, n.nota
            FROM Alunos a
            JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
            JOIN Notas n ON ba.idBimestre_Aluno = n.idBimestre_Aluno
            JOIN Avaliacoes av ON n.idAvaliacao = av.idAvaliacao
            JOIN Bimestres b ON av.idBimestre = b.idBimestre
            JOIN Materias m ON b.idMateria = m.idMateria
            JOIN Turmas t ON m.idTurma = t.idTurma
            WHERE t.idTurma = ? AND b.idBimestre = ?
        `, [idTurma, idBimestre]);

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



// Buscar notas por aluno
exports.getNotasByAluno = async (req, res) => {
    const { idAluno } = req.params;
    const query = `
        SELECT n.idNota, n.idAvaliacao, n.nota 
        FROM Notas n
        JOIN Bimestre_Alunos ba ON n.idBimestre_Aluno = ba.idBimestre_Aluno
        WHERE ba.idAluno = ?`;
    try {
        const [results] = await db.query(query, [idAluno]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar notas do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar notas do aluno', details: err });
    }
};


// Buscar dados do gráfico por turma e bimestre
exports.getChartDataByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT h.codigo, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Turmas t ON a.idTurma = t.idTurma
            WHERE t.idTurma = ? AND ba.idBimestre = ?
            GROUP BY h.codigo
            ORDER BY total DESC
        `, [idTurma, idBimestre]);

        const chartData = rows.map(row => ({
            habilidade: row.codigo,
            quantidade: row.total
        }));

        res.json({ chartData });
    } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados do gráfico',
            details: error
        });
    }
};
