const db = require('../config/db');

// Criar nova nota (agora vinculada diretamente ao aluno)
exports.createNota = async (req, res) => {
    const { idAluno, nota } = req.body;
    const query = 'UPDATE Alunos SET nota = ? WHERE idAluno = ?';
    try {
        await db.query(query, [nota, idAluno]);
        res.status(201).send('Nota atribuída ao aluno com sucesso');
    } catch (err) {
        console.error('Erro ao atribuir nota:', err);
        res.status(500).json({ error: 'Erro ao atribuir nota', details: err });
    }
};

// Buscar média de notas por turma e bimestre
exports.getMediaNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT AVG(nota) AS mediaNota
            FROM Alunos
            WHERE idTurma = ? AND nota IS NOT NULL
        `, [idTurma]);

        const mediaNota = rows[0]?.mediaNota || 0;
        res.status(200).json({ mediaNota });
    } catch (error) {
        console.error('Erro ao calcular média de notas:', error);
        res.status(500).json({
            error: 'Erro ao calcular média de notas',
            details: error.message,
        });
    }
};


// Buscar o total de alunos com notas em uma turma e bimestre
exports.getTotalNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT COUNT(a.idAluno) as totalNotas
            FROM Alunos a
            JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
            WHERE a.idTurma = ? AND ba.idBimestre = ? AND a.nota IS NOT NULL;
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

// Atualizar nota de um aluno
exports.updateNota = async (req, res) => {
    const { idAluno } = req.params;
    const { nota } = req.body;
    const query = 'UPDATE Alunos SET nota = ? WHERE idAluno = ?';
    try {
        await db.query(query, [nota, idAluno]);
        res.status(200).send('Nota atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar nota:', err);
        res.status(500).json({ error: 'Erro ao atualizar nota', details: err });
    }
};

// Buscar notas por aluno
exports.getNotasByAluno = async (req, res) => {
    const { idAluno } = req.params;
    const query = `
        SELECT a.idAluno, a.nome, a.nota
        FROM Alunos a
        WHERE a.idAluno = ?`;
    try {
        const [results] = await db.query(query, [idAluno]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar notas do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar notas do aluno', details: err });
    }
};

exports.getChartDataByTurmaAndBimestre = async (req, res) => {
    const { idTurma } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT 
                CASE
                    WHEN nota BETWEEN 0 AND 4.9 THEN '0-4.9'
                    WHEN nota BETWEEN 5 AND 6.9 THEN '5-6.9'
                    WHEN nota BETWEEN 7 AND 10 THEN '7-10'
                    ELSE 'Sem Nota'
                END AS faixaNota,
                COUNT(*) AS quantidade
            FROM Alunos
            WHERE idTurma = ?
            GROUP BY faixaNota
        `, [idTurma]);

        const chartData = rows.map(row => ({
            faixa: row.faixaNota,
            quantidade: row.quantidade,
        }));

        res.status(200).json({ chartData });
    } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        res.status(500).json({
            error: 'Erro ao buscar dados do gráfico',
            details: error.message,
        });
    }
};


// Buscar nota do aluno para uma matéria, bimestre e turma específicos
exports.getNotaByAlunoAndMateria = async (req, res) => {
    const { idAluno, idMateria, idBimestre, idTurma } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT a.nome, ba.nota
            FROM Alunos a
            JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
            JOIN Materias m ON ba.idMateria = m.idMateria
            WHERE a.idAluno = ? AND m.idMateria = ? AND ba.idBimestre = ? AND a.idTurma = ?;
        `, [idAluno, idMateria, idBimestre, idTurma]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma nota encontrada para o aluno, matéria, bimestre e turma especificados' });
        }

        res.json(rows[0]); // Retorna apenas o registro encontrado
    } catch (error) {
        console.error('Erro ao buscar nota do aluno:', error);
        res.status(500).json({
            error: 'Erro ao buscar nota do aluno',
            details: error
        });
    }
};

// Criar ou atualizar nota
exports.createOrUpdateNota = async (req, res) => {
    const { idAluno, idMateria, idBimestre, idTurma } = req.params;
    const { nota } = req.body;

    if (!nota) {
        return res.status(400).json({ error: 'O campo "nota" é obrigatório' });
    }

    try {
        // Verifica se a turma e a matéria correspondem
        const [materiaCheck] = await db.query(`
            SELECT idMateria
            FROM Materias
            WHERE idMateria = ? AND idTurma = ?;
        `, [idMateria, idTurma]);

        if (materiaCheck.length === 0) {
            return res.status(404).json({ error: 'Matéria não encontrada para esta turma' });
        }

        // Verifica se já existe um registro para o aluno, bimestre e turma
        const [existing] = await db.query(`
            SELECT idAluno, idBimestre
            FROM Bimestre_Alunos
            WHERE idAluno = ? AND idBimestre = ?;
        `, [idAluno, idBimestre]);

        if (existing.length > 0) {
            // Atualiza a nota
            await db.query(`
                UPDATE Alunos
                SET nota = ?
                WHERE idAluno = ? AND idTurma = ?;
            `, [nota, idAluno, idTurma]);

            return res.status(200).send('Nota atualizada com sucesso');
        } else {
            // Insere a nota para o aluno no bimestre
            await db.query(`
                INSERT INTO Bimestre_Alunos (idBimestre, idAluno)
                VALUES (?, ?);
            `, [idBimestre, idAluno]);

            // Atualiza a nota na tabela de alunos
            await db.query(`
                UPDATE Alunos
                SET nota = ?
                WHERE idAluno = ? AND idTurma = ?;
            `, [nota, idAluno, idTurma]);

            return res.status(201).send('Nota criada com sucesso');
        }
    } catch (error) {
        console.error('Erro ao criar ou atualizar nota:', error);
        res.status(500).json({
            error: 'Erro ao criar ou atualizar nota',
            details: error.message
        });
    }
};





// Buscar todas as notas de um aluno em uma turma e bimestre específicos
exports.getNotasByAluno = async (req, res) => {
    const { idAluno, idBimestre, idTurma } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT m.nome AS materia, ba.nota
            FROM Materias m
            JOIN Bimestre_Alunos ba ON m.idMateria = ba.idMateria
            JOIN Alunos a ON ba.idAluno = a.idAluno
            WHERE a.idAluno = ? AND ba.idBimestre = ? AND a.idTurma = ?;
        `, [idAluno, idBimestre, idTurma]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma nota encontrada para o aluno e critérios especificados' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar notas do aluno:', error);
        res.status(500).json({
            error: 'Erro ao buscar notas do aluno',
            details: error
        });
    }
};