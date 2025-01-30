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


exports.updateNotaTipoAvaliacao = async (req, res) => {
    const { idAluno, idBimestre, tipoAvaliacao } = req.params;
    const { nota } = req.body;

    if (nota === undefined || isNaN(parseFloat(nota))) {
        return res.status(400).json({
            error: 'O campo "nota" é obrigatório e deve ser um número válido'
        });
    }

    if (![0, 1].includes(Number(tipoAvaliacao))) {
        return res.status(400).json({
            error: 'O campo "tipoAvaliacao" deve ser 0 ou 1'
        });
    }

    try {
        // 1) Localiza Bimestre_Alunos
        const [baRows] = await db.query(
            `SELECT idBimestre_Aluno 
               FROM Bimestre_Alunos
              WHERE idAluno = ?
                AND idBimestre = ?`, 
            [idAluno, idBimestre]
        );

        if (baRows.length === 0) {
            return res.status(404).json({
                error: 'Não existe registro de Bimestre_Alunos para esse aluno e bimestre'
            });
        }

        const idBimestre_Aluno = baRows[0].idBimestre_Aluno;

        // 2) Atualiza Notas_Bimestre_Aluno para o tipo específico
        const [updateResult] = await db.query(
            `UPDATE Notas_Bimestre_Aluno
                SET nota = ?
              WHERE idBimestre_Aluno = ?
                AND tipoAvaliacao = ?`, 
            [nota, idBimestre_Aluno, tipoAvaliacao]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota existente para atualizar neste bimestre e tipo de avaliação'
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

exports.getNotasDoutorzaoByTurmaBimestreMateria = async (req, res) => {
    const { idTurma, idBimestre, idMateria } = req.params;

    console.log("Parâmetros recebidos:", { idTurma, idBimestre, idMateria });

    try {
        const query = `
            SELECT a.nome AS nomeAluno, n.nota 
            FROM Notas_Bimestre_Aluno n
            JOIN Bimestre_Alunos ba ON n.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Bimestres b ON ba.idBimestre = b.idBimestre
            JOIN Materias m ON b.idMateria = m.idMateria
            WHERE ba.idBimestre = ?
            AND m.idMateria = ?
            AND a.idTurma = ?
            AND n.tipoAvaliacao = 1
        `;

        console.log("Query executada:", query);
        console.log("Parâmetros da query:", [idBimestre, idMateria, idTurma]);

        const [notas] = await db.query(query, [idBimestre, idMateria, idTurma]);

        console.log("Resultado da consulta antes de verificar:", notas);

        // Confirma se os dados existem
        if (!notas || notas.length === 0) {
            return res.status(404).json({ error: 'Nenhuma nota encontrada para o aluno, matéria, bimestre e turma especificados' });
        }

        // Converte os nomes corretamente
        const resultadoCorrigido = notas.map(row => ({
            nomeAluno: row.nomeAluno || row.nome, // Garante que 'nomeAluno' seja o campo correto
            nota: row.nota
        }));

        console.log("Resultado final enviado:", resultadoCorrigido);

        res.status(200).json(resultadoCorrigido);
    } catch (err) {
        console.error('Erro ao buscar notas do Doutorzão:', err);
        res.status(500).json({ error: 'Erro ao buscar notas do Doutorzão' });
    }
};



// /**
//  * Buscar média de notas por turma e bimestre.
//  */
// exports.getMediaNotasByTurmaAndBimestre = async (req, res) => {
//     const { idTurma, idBimestre } = req.params;
  
//     console.log('Recebido no endpoint:', { idTurma, idBimestre });
  
//     try {
//       const [rows] = await db.query(`
//         SELECT AVG(nba.nota) AS mediaNota
//         FROM Notas_Bimestre_Aluno nba
//         JOIN Bimestre_Alunos ba ON nba.idBimestre_Aluno = ba.idBimestre_Aluno
//         JOIN Alunos a ON ba.idAluno = a.idAluno
//         WHERE a.idTurma = ? AND ba.idBimestre = ? AND nba.nota IS NOT NULL
//       `, [idTurma, idBimestre]);
  
//       console.log('Resultado da consulta SQL:', rows);
  
//       if (!rows || rows.length === 0 || rows[0].mediaNota === null) {
//         return res.status(404).json({ error: 'Nenhuma média encontrada para a turma e bimestre especificados.' });
//       }
  
//       res.status(200).json({ mediaNota: parseFloat(rows[0].mediaNota).toFixed(2) });
//     } catch (error) {
//       console.error('Erro ao buscar média:', error);
//       res.status(500).json({ error: 'Erro interno', details: error.message });
//     }
//   };


/**
 * Buscar média de notas do tipo avaliação (tipoAvaliacao = 0)
 * para uma turma e bimestre.
 */
exports.getMediaAvaliacaoByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT AVG(nba.nota) AS mediaNota
            FROM Notas_Bimestre_Aluno nba
            JOIN Bimestre_Alunos ba ON nba.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Alunos a ON ba.idAluno = a.idAluno
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
              AND nba.tipoAvaliacao = 0
              AND nba.nota IS NOT NULL
        `, [idTurma, idBimestre]);

        if (!rows || rows.length === 0 || rows[0].mediaNota === null) {
            return res.status(404).json({ error: 'Nenhuma média encontrada para a turma e bimestre especificados.' });
        }

        res.status(200).json({ mediaNota: parseFloat(rows[0].mediaNota).toFixed(2) });
    } catch (error) {
        console.error('Erro ao buscar média de avaliação:', error);
        res.status(500).json({
            error: 'Erro ao buscar média de avaliação',
            details: error.message,
        });
    }
};

/**
 * Buscar média de notas do tipo doutorzão (tipoAvaliacao = 1)
 * para uma turma e bimestre.
 */
exports.getMediaDoutorzaoByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT AVG(nba.nota) AS mediaNota
            FROM Notas_Bimestre_Aluno nba
            JOIN Bimestre_Alunos ba ON nba.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Alunos a ON ba.idAluno = a.idAluno
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
              AND nba.tipoAvaliacao = 1
              AND nba.nota IS NOT NULL
        `, [idTurma, idBimestre]);

        if (!rows || rows.length === 0 || rows[0].mediaNota === null) {
            return res.status(404).json({ error: 'Nenhuma média encontrada para a turma e bimestre especificados.' });
        }

        res.status(200).json({ mediaNota: parseFloat(rows[0].mediaNota).toFixed(2) });
    } catch (error) {
        console.error('Erro ao buscar média de doutorzão:', error);
        res.status(500).json({
            error: 'Erro ao buscar média de doutorzão',
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
 * Criar ou atualizar nota de um aluno para (idBimestre, idMateria, idTurma) considerando o tipo de avaliação.
 */
exports.createOrUpdateNota = async (req, res) => {
    const { idAluno, idMateria, idBimestre, idTurma, tipoAvaliacao } = req.params;
    const { nota } = req.body;

    if (nota === undefined || isNaN(parseFloat(nota))) {
        return res.status(400).json({
            error: 'O campo "nota" é obrigatório e deve ser um número válido'
        });
    }

    if (![0, 1].includes(Number(tipoAvaliacao))) {
        return res.status(400).json({
            error: 'O campo "tipoAvaliacao" deve ser 0 ou 1'
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

        // Verifica se já existe uma nota para este tipo de avaliação
        const [existingNota] = await db.query(`
            SELECT idNotas
              FROM Nota_Bimestre_Aluno
             WHERE idBimestre_Aluno = ?
               AND tipoAvaliacao = ?
        `, [idBimestre_Aluno, tipoAvaliacao]);

        if (existingNota.length > 0) {
            // Atualiza a nota existente
            await db.query(`
                UPDATE Notas_Bimestre_Aluno
                   SET nota = ?
                 WHERE idBimestre_Aluno = ?
                   AND tipoAvaliacao = ?
            `, [nota, idBimestre_Aluno, tipoAvaliacao]);

            return res.status(200).json({ message: 'Nota atualizada com sucesso' });
        } else {
            // Insere uma nova nota
            await db.query(`
                INSERT INTO Notas_Bimestre_Aluno (idBimestre_Aluno, tipoAvaliacao, nota)
                VALUES (?, ?, ?)
            `, [idBimestre_Aluno, tipoAvaliacao, nota]);

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
    console.log('Parâmetros recebidos:', { idTurma, idBimestre, idMateria });

    try {
        const [rows] = await db.query(`
            SELECT 
                a.idAluno,
                a.nome AS nomeAluno,
                COALESCE(nba.nota, 'Sem nota') AS nota
            FROM Alunos a
            LEFT JOIN Bimestre_Alunos ba 
                ON a.idAluno = ba.idAluno 
                AND ba.idBimestre = ?
            LEFT JOIN Notas_Bimestre_Aluno nba 
                ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
                AND nba.tipoAvaliacao = 0 -- Apenas notas de avaliação
            WHERE a.idTurma = ?
            ORDER BY a.nome;
        `, [idBimestre, idTurma]);

        console.log('Resultado da consulta:', rows);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhuma nota encontrada para os critérios fornecidos.' });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({ error: 'Erro ao buscar notas', details: error.message });
    }
};






/**
 * Buscar notas de cada aluno para avaliação (tipoAvaliacao = 0)
 * por turma, bimestre e matéria.
 */
exports.getNotasAvaliacaoByTurmaBimestreMateria = async (req, res) => {
    const { idTurma, idBimestre, idMateria } = req.params;

    try {
        console.log('Parâmetros recebidos pela API:', { idTurma, idBimestre, idMateria });

        const query = `
            SELECT 
                a.nome AS nomeAluno,
                nba.nota,
                b.descricao AS nomeBimestre,
                m.nomeMateria AS nomeMateria,
                nba.tipoAvaliacao
            FROM Alunos a
            INNER JOIN Bimestre_Alunos ba 
                ON a.idAluno = ba.idAluno
            INNER JOIN Notas_Bimestre_Aluno nba 
                ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
            INNER JOIN Bimestres b 
                ON ba.idBimestre = b.idBimestre
            INNER JOIN Materias m 
                ON b.idMateria = m.idMateria AND m.idTurma = a.idTurma
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
              AND m.idMateria = ?
              AND nba.tipoAvaliacao = 0;
        `;

        const [rows] = await db.query(query, [idTurma, idBimestre, idMateria]);

        console.log('Resultados retornados pela consulta:', rows);

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota encontrada para o tipo avaliação (tipoAvaliacao = 0).'
            });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar notas de avaliação:', error);
        res.status(500).json({
            error: 'Erro ao buscar notas de avaliação',
            details: error.message,
        });
    }
};










