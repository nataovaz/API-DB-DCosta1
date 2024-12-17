const db = require('../config/db');

// Criar nova habilidade
exports.createHabilidade = async (req, res) => {
    const { codigo, idMateria } = req.body;
    const query = 'INSERT INTO Habilidades (codigo, idMateria) VALUES (?, ?)';
    try {
        await db.query(query, [codigo, idMateria]);
        res.status(201).send('Habilidade criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar habilidade:', err);
        res.status(500).json({ error: 'Erro ao criar habilidade', details: err });
    }
};

// Criar nova habilidade se não existir
exports.createHabilidadeIfNotExists = async (req, res) => {
    const { codigo, idMateria } = req.body;
    const queryCheck = 'SELECT * FROM Habilidades WHERE codigo = ? AND idMateria = ?';
    const queryInsert = 'INSERT INTO Habilidades (codigo, idMateria) VALUES (?, ?)';

    try {
        const [existing] = await db.query(queryCheck, [codigo.toUpperCase(), idMateria]);
        if (existing.length > 0) {
            return res.status(200).send('Habilidade já existe');
        }

        await db.query(queryInsert, [codigo.toUpperCase(), idMateria]);
        res.status(201).send('Habilidade criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar ou verificar habilidade:', err);
        res.status(500).json({ error: 'Erro ao criar ou verificar habilidade', details: err });
    }
};

// Buscar as top 5 habilidades mais acertadas por turma e bimestre






exports.getHabilidades = async (req, res) => {
    const query = 'SELECT * FROM Habilidades';

    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar habilidades do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar habilidades do aluno', details: err });
    }
};


// Atualizar habilidade
exports.updateHabilidade = async (req, res) => {
    const { idHabilidade } = req.params;
    const { codigo, idMateria } = req.body;
    const query = 'UPDATE Habilidades SET codigo = ?, idMateria = ? WHERE idHabilidade = ?';
    try {
        await db.query(query, [codigo, idMateria, idHabilidade]);
        res.status(200).send('Habilidade atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar habilidade:', err);
        res.status(500).json({ error: 'Erro ao atualizar habilidade', details: err });
    }
};

// Deletar habilidade
exports.deleteHabilidade = async (req, res) => {
    const { idHabilidade } = req.params;
    const query = 'DELETE FROM Habilidades WHERE idHabilidade = ?';
    try {
        await db.query(query, [idHabilidade]);
        res.status(200).send('Habilidade deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar habilidade:', err);
        res.status(500).json({ error: 'Erro ao deletar habilidade', details: err });
    }
};

// Buscar habilidades por aluno
exports.getHabilidadesByAluno = async (req, res) => {
    const { idAluno } = req.params;
    const query = `
        SELECT h.idHabilidade, h.codigo, h.idMateria 
        FROM Habilidades h
        JOIN DesempenhoHabilidades dh ON h.idHabilidade = dh.idHabilidade
        JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
        WHERE ba.idAluno = ?`;
    try {
        const [results] = await db.query(query, [idAluno]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar habilidades do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar habilidades do aluno', details: err });
    }
};


exports.getHabilidadesStatsByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre, idMateria } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT h.nome AS habilidade, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Alunos a ON ba.idAluno = a.idAluno
            WHERE a.idTurma = ? AND ba.idBimestre = ? AND h.idMateria = ?
            GROUP BY h.nome
            ORDER BY total DESC
        `, [idTurma, idBimestre, idMateria]);

        if (!rows.length) {
            return res.status(404).json({ message: 'Nenhuma habilidade encontrada para os critérios fornecidos.' });
        }

        const maisAcertada = rows[0].habilidade || 'N/A';
        const menosAcertada = rows[rows.length - 1].habilidade || 'N/A';

        res.status(200).json({ maisAcertada, menosAcertada });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de habilidades:', error);
        res.status(500).json({ error: 'Erro interno ao buscar estatísticas de habilidades', details: error.message });
    }
};





exports.getHabilidadesStatsByAlunoAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [results] = await db.query(`
            SELECT 
                a.nome AS alunoNome,
                h.nome AS habilidadeCodigo,
                COUNT(dh.idHabilidade) AS totalAcertos
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Alunos a ON ba.idAluno = a.idAluno
            WHERE a.idTurma = ? AND ba.idBimestre = ?
            GROUP BY a.idAluno, h.idHabilidade
            ORDER BY a.idAluno, totalAcertos DESC;
        `, [idTurma, idBimestre]);

        const alunos = {};

        results.forEach(row => {
            if (!alunos[row.alunoNome]) {
                alunos[row.alunoNome] = {
                    nome: row.alunoNome,
                    habilidades: []
                };
            }
            alunos[row.alunoNome].habilidades.push({
                codigo: row.habilidadeCodigo,
                acertos: row.totalAcertos
            });
        });

        const alunosResponse = Object.values(alunos).map(aluno => {
            const maisAcertada = aluno.habilidades[0];
            const menosAcertada = aluno.habilidades[aluno.habilidades.length - 1];
            return {
                nome: aluno.nome,
                maisAcertada: maisAcertada.codigo,
                menosAcertada: menosAcertada.codigo
            };
        });

        res.status(200).json({
            alunos: alunosResponse
        });
    } catch (error) {
        console.error('Erro ao buscar habilidades por aluno e bimestre:', error);
        res.status(500).json({
            error: 'Erro ao buscar habilidades por aluno e bimestre',
            details: error
        });
    }
};

exports.getTop5ErrosByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT h.nome, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            WHERE ba.idBimestre = ? 
              AND ba.idAluno IN (SELECT idAluno FROM Alunos WHERE idTurma = ?)
            GROUP BY h.nome
            ORDER BY total ASC
            LIMIT 5
        `, [idBimestre, idTurma]);

        res.json({ chartData: rows });
    } catch (error) {
        console.error('Erro ao buscar top 5 erros:', error);
        res.status(500).json({ error: 'Erro ao buscar top 5 erros', details: error });
    }
};


exports.getTop5HabilidadesByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT h.nome, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            WHERE ba.idBimestre = ? 
              AND ba.idAluno IN (SELECT idAluno FROM Alunos WHERE idTurma = ?)
            GROUP BY h.nome
            ORDER BY total DESC
            LIMIT 5
        `, [idBimestre, idTurma]);

        if (!rows.length) {
            return res.status(404).json({ message: 'Nenhum dado disponível para o top 5 habilidades.' });
        }

        res.status(200).json({ chartData: rows });
    } catch (error) {
        console.error('Erro ao buscar top 5 habilidades:', error);
        res.status(500).json({ error: 'Erro interno ao buscar top 5 habilidades', details: error.message });
    }
};





