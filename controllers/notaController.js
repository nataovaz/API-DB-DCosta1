const db = require('../config/db');

/**
 * Criar nova nota, exigindo `:idAluno` e `:idBimestre` na rota.
 * Insere ou atualiza em Notas_Bimestre_Aluno, criando registro
 * em Bimestre_Alunos se não existir.
 */
exports.createNota = async (req, res) => {
    try {
        const { idAluno, idBimestre } = req.params;
        const { nota } = req.body;

        // Verifica se 'nota' é válido
        if (nota === undefined || isNaN(parseFloat(nota))) {
            return res.status(400).json({
                error: 'O campo "nota" é obrigatório e deve ser um número válido'
            });
        }

        // 1) Verifica Bimestre_Alunos
        const [baExisting] = await db.query(`
            SELECT idBimestre_Aluno
              FROM Bimestre_Alunos
             WHERE idAluno = ?
               AND idBimestre = ?
        `, [idAluno, idBimestre]);

        let idBimestre_Aluno;
        if (baExisting.length > 0) {
            idBimestre_Aluno = baExisting[0].idBimestre_Aluno;
        } else {
            // Se não existe, cria
            const [baResult] = await db.query(`
                INSERT INTO Bimestre_Alunos (idAluno, idBimestre)
                VALUES (?, ?)
            `, [idAluno, idBimestre]);
            idBimestre_Aluno = baResult.insertId;
        }

        // 2) Verifica se já existe nota
        const [existingNota] = await db.query(`
            SELECT idNotas
              FROM Notas_Bimestre_Aluno
             WHERE idBimestre_Aluno = ?
        `, [idBimestre_Aluno]);

        if (existingNota.length > 0) {
            // Já existe => atualiza
            await db.query(`
                UPDATE Notas_Bimestre_Aluno
                   SET nota = ?
                 WHERE idBimestre_Aluno = ?
            `, [nota, idBimestre_Aluno]);

            return res.status(200).json({ message: 'Nota atualizada com sucesso' });
        } else {
            // Caso não exista => cria
            await db.query(`
                INSERT INTO Notas_Bimestre_Aluno (idBimestre_Aluno, tipoAvaliacao, nota)
                VALUES (?, 0, ?)
            `, [idBimestre_Aluno, nota]);

            return res.status(201).json({ message: 'Nota criada com sucesso' });
        }
    } catch (err) {
        console.error('Erro ao atribuir nota:', err);
        res.status(500).json({ 
            error: 'Erro ao atribuir nota', 
            details: err 
        });
    }
};

/**
 * Atualizar nota de um aluno (rota: /notas/:idAluno/:idBimestre).
 */
exports.updateNota = async (req, res) => {
    const { idAluno, idBimestre } = req.params;
    const { nota } = req.body;

    if (nota === undefined || isNaN(parseFloat(nota))) {
        return res.status(400).json({
            error: 'O campo "nota" é obrigatório e deve ser um número válido'
        });
    }

    try {
        // 1) Localiza Bimestre_Alunos
        const [baRows] = await db.query(`
            SELECT idBimestre_Aluno 
              FROM Bimestre_Alunos
             WHERE idAluno = ?
               AND idBimestre = ?
        `, [idAluno, idBimestre]);

        if (baRows.length === 0) {
            return res.status(404).json({
                error: 'Não existe registro de Bimestre_Alunos para esse aluno e bimestre'
            });
        }

        const idBimestre_Aluno = baRows[0].idBimestre_Aluno;

        // 2) Atualiza Notas_Bimestre_Aluno
        const [updateResult] = await db.query(`
            UPDATE Notas_Bimestre_Aluno
               SET nota = ?
             WHERE idBimestre_Aluno = ?
        `, [nota, idBimestre_Aluno]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota existente para atualizar neste bimestre'
            });
        }

        res.status(200).json({ message: 'Nota atualizada com sucesso' });
    } catch (err) {
        console.error('Erro ao atualizar nota:', err);
        res.status(500).json({ 
            error: 'Erro ao atualizar nota', 
            details: err 
        });
    }
};

/**
 * Buscar média de notas por turma e bimestre.
 */
exports.getMediaNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT AVG(nba.nota) AS mediaNota
              FROM Bimestre_Alunos ba
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Bimestres b ON ba.idBimestre = b.idBimestre
              JOIN Materias m ON b.idMateria = m.idMateria
              JOIN Alunos a ON ba.idAluno = a.idAluno
             WHERE m.idTurma = ?
               AND b.idBimestre = ?
               AND nba.nota IS NOT NULL
        `, [idTurma, idBimestre]);

        if (!rows || rows.length === 0 || rows[0].mediaNota === null) {
            return res.status(404).json({ 
                error: 'Nenhuma média encontrada para os critérios fornecidos.' 
            });
        }

        const mediaNota = parseFloat(rows[0].mediaNota) || 0;

        res.status(200).json({
            mediaNota: mediaNota.toFixed(2),
        });
    } catch (error) {
        console.error('Erro ao calcular média da turma:', error);
        res.status(500).json({
            error: 'Erro interno ao calcular a média da turma',
            details: error.message,
        });
    }
};
/**
 * Buscar o total de alunos com notas em uma turma e bimestre.
 */
exports.getTotalNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT COUNT(DISTINCT ba.idAluno) AS totalNotas
              FROM Bimestre_Alunos ba
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Alunos a ON ba.idAluno = a.idAluno
             WHERE a.idTurma = ?
               AND ba.idBimestre = ?
               AND nba.nota IS NOT NULL
        `, [idTurma, idBimestre]);

        const totalNotas = rows[0]?.totalNotas || 0;
        res.json({ totalNotas });
    } catch (error) {
        console.error('Erro ao buscar total de notas:', error);
        res.status(500).json({
            error: 'Erro ao buscar total de notas',
            details: error
        });
    }
};

/**
 * Buscar notas por aluno (sem filtrar bimestre).
 */
exports.getNotasByAluno = async (req, res) => {
    const { idAluno } = req.params;
    try {
        const [results] = await db.query(`
            SELECT 
                ba.idBimestre_Aluno,
                nba.idNotas,
                nba.nota,
                b.idBimestre,
                b.descricao AS nomeBimestre
              FROM Bimestre_Alunos ba
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Bimestres b ON ba.idBimestre = b.idBimestre
             WHERE ba.idAluno = ?
        `, [idAluno]);

        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar notas do aluno:', err);
        res.status(500).json({ 
            error: 'Erro ao buscar notas do aluno', 
            details: err 
        });
    }
};

/**
 * Dados para gráfico (exemplo de faixas de notas) por turma e bimestre.
 */
exports.getChartDataByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT
                CASE
                    WHEN nba.nota IS NULL THEN 'Sem Nota'
                    WHEN nba.nota BETWEEN 0 AND 4.9 THEN '0-4.9'
                    WHEN nba.nota BETWEEN 5 AND 6.9 THEN '5-6.9'
                    WHEN nba.nota BETWEEN 7 AND 10 THEN '7-10'
                    ELSE 'Fora de Faixa'
                END AS faixaNota,
                COUNT(*) AS quantidade
              FROM Alunos a
              JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
              LEFT JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
             WHERE a.idTurma = ?
               AND ba.idBimestre = ?
          GROUP BY faixaNota
        `, [idTurma, idBimestre]);

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

/**
 * Buscar nota do aluno para uma matéria, bimestre e turma específicos.
 */
exports.getNotaByAlunoAndMateria = async (req, res) => {
    const { idAluno, idMateria, idBimestre, idTurma } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT 
                a.nome AS nomeAluno, 
                nba.nota
              FROM Alunos a
              JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Bimestres b ON ba.idBimestre = b.idBimestre
             WHERE a.idAluno = ?
               AND b.idMateria = ?
               AND ba.idBimestre = ?
               AND a.idTurma = ?;
        `, [idAluno, idMateria, idBimestre, idTurma]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                error: 'Nenhuma nota encontrada para o aluno, matéria, bimestre e turma especificados' 
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar nota do aluno:', error);
        res.status(500).json({
            error: 'Erro ao buscar nota do aluno',
            details: error
        });
    }
};

/**
 * Criar ou atualizar nota de um aluno para (idBimestre, idMateria, idTurma).
 */
exports.createOrUpdateNota = async (req, res) => {
    const { idAluno, idMateria, idBimestre, idTurma } = req.params;
    const { nota } = req.body;

    if (nota === undefined || isNaN(parseFloat(nota))) {
        return res.status(400).json({
            error: 'O campo "nota" é obrigatório e deve ser um número válido'
        });
    }

    try {
        // Verifica se a matéria pertence a esta turma
        const [materiaCheck] = await db.query(`
            SELECT idMateria
              FROM Materias
             WHERE idMateria = ?
               AND idTurma = ?
        `, [idMateria, idTurma]);

        if (materiaCheck.length === 0) {
            return res.status(404).json({ error: 'Matéria não encontrada para esta turma' });
        }

        // Verifica se existe Bimestre_Alunos
        const [existingBA] = await db.query(`
            SELECT idBimestre_Aluno
              FROM Bimestre_Alunos
             WHERE idAluno = ?
               AND idBimestre = ?
        `, [idAluno, idBimestre]);

        let idBimestre_Aluno;
        if (existingBA.length > 0) {
            idBimestre_Aluno = existingBA[0].idBimestre_Aluno;
        } else {
            const [resultBA] = await db.query(`
                INSERT INTO Bimestre_Alunos (idAluno, idBimestre)
                VALUES (?, ?)
            `, [idAluno, idBimestre]);
            idBimestre_Aluno = resultBA.insertId;
        }

        // Verifica se já existe nota
        const [existingNota] = await db.query(`
            SELECT idNotas
              FROM Notas_Bimestre_Aluno
             WHERE idBimestre_Aluno = ?
        `, [idBimestre_Aluno]);

        if (existingNota.length > 0) {
            // Atualiza
            await db.query(`
                UPDATE Notas_Bimestre_Aluno
                   SET nota = ?
                 WHERE idBimestre_Aluno = ?
            `, [nota, idBimestre_Aluno]);

            return res.status(201).json({ message: 'Nota criada com sucesso' });
        } else {
            // Insere
            await db.query(`
                INSERT INTO Notas_Bimestre_Aluno (idBimestre_Aluno, tipoAvaliacao, nota)
                VALUES (?, 0, ?)
            `, [idBimestre_Aluno, nota]);

            return res.status(201).json({ message: 'Nota criada com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao criar ou atualizar nota:', error);
        res.status(500).json({
            error: 'Erro ao criar ou atualizar nota',
            details: error.message
        });
    }
};

/**
 * Buscar todas as notas de um aluno em uma turma e bimestre específicos.
 */
exports.getNotasByAluno = async (req, res) => {
    const { idAluno, idBimestre, idTurma } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT 
                m.nomeMateria AS materia,
                nba.nota
              FROM Materias m
              JOIN Bimestres b ON m.idMateria = b.idMateria
              JOIN Bimestre_Alunos ba ON b.idBimestre = ba.idBimestre
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Alunos a ON ba.idAluno = a.idAluno
             WHERE a.idAluno = ?
               AND ba.idBimestre = ?
               AND a.idTurma = ?
        `, [idAluno, idBimestre, idTurma]);

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota encontrada para o aluno e critérios especificados'
            });
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

/**
 * Buscar todas as notas de uma turma/bimestre/matéria.
 */
exports.getNotasByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre, idMateria } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT 
                a.nome AS nomeAluno,
                nba.nota
              FROM Alunos a
              JOIN Bimestre_Alunos ba ON a.idAluno = ba.idAluno
              JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
              JOIN Bimestres b ON ba.idBimestre = b.idBimestre
             WHERE ba.idBimestre = ?
               AND a.idTurma = ?
               AND b.idMateria = ?;
        `, [idBimestre, idTurma, idMateria]);

        if (rows.length === 0) {
            return res.status(404).json({ 
                error: 'Nenhuma nota encontrada para os critérios fornecidos' 
            });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar notas por turma e bimestre:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar notas por turma e bimestre', 
            details: error.message 
        });
    }
};
