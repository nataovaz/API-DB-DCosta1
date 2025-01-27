const db = require('../config/db');

/**
 * Criar nova habilidade — assumindo que a tabela Habilidades
 * tenha as colunas: (idHabilidade, nome, descricao, idMateria).
 *
 * Aqui iremos inserir o valor recebido em 'nome' (antes chamado de 'codigo')
 * e 'idMateria'. Se quiser inserir também 'descricao', basta incluir no body.
 */
exports.createHabilidade = async (req, res) => {
    const { nome, idMateria, descricao } = req.body;
    
    // Ajuste a query conforme as colunas existentes de Habilidades.
    // Aqui vou assumir que 'nome' e 'idMateria' são obrigatórios, e 'descricao' é opcional.
    const query = 'INSERT INTO Habilidades (nome, descricao, idMateria) VALUES (?, ?, ?)';
    
    try {
        await db.query(query, [nome, descricao || '', idMateria]);
        res.status(201).send('Habilidade criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar habilidade:', err);
        res.status(500).json({ error: 'Erro ao criar habilidade', details: err });
    }
};

/**
 * Criar nova habilidade se não existir — checando pelo nome (antes "codigo") e idMateria.
 */
exports.createHabilidadeIfNotExists = async (req, res) => {
    const { nome, idMateria, descricao } = req.body;

    const queryCheck = 'SELECT * FROM Habilidades WHERE nome = ? AND idMateria = ?';
    const queryInsert = 'INSERT INTO Habilidades (nome, descricao, idMateria) VALUES (?, ?, ?)';

    try {
        const [existing] = await db.query(queryCheck, [nome.toUpperCase(), idMateria]);
        if (existing.length > 0) {
            return res.status(200).send('Habilidade já existe');
        }

        await db.query(queryInsert, [nome.toUpperCase(), descricao || '', idMateria]);
        res.status(201).send('Habilidade criada com sucesso');
    } catch (err) {
        console.error('Erro ao criar ou verificar habilidade:', err);
        res.status(500).json({ error: 'Erro ao criar ou verificar habilidade', details: err });
    }
};

/**
 * Listar todas as habilidades.
 */
exports.getHabilidades = async (req, res) => {
    const query = 'SELECT * FROM Habilidades';

    try {
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar habilidades:', err);
        res.status(500).json({ error: 'Erro ao buscar habilidades', details: err });
    }
};

/**
 * Atualizar uma habilidade (nome, descricao, idMateria).
 */
exports.updateHabilidade = async (req, res) => {
    const { idHabilidade } = req.params;
    const { nome, descricao, idMateria } = req.body;
    
    const query = `
        UPDATE Habilidades
           SET nome = ?, descricao = ?, idMateria = ?
         WHERE idHabilidade = ?
    `;
    try {
        const [result] = await db.query(query, [nome, descricao, idMateria, idHabilidade]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Habilidade não encontrada para atualizar.' });
        }
        res.status(200).send('Habilidade atualizada com sucesso');
    } catch (err) {
        console.error('Erro ao atualizar habilidade:', err);
        res.status(500).json({ error: 'Erro ao atualizar habilidade', details: err });
    }
};

/**
 * Deletar habilidade.
 */
exports.deleteHabilidade = async (req, res) => {
    const { idHabilidade } = req.params;
    const query = 'DELETE FROM Habilidades WHERE idHabilidade = ?';
    try {
        const [result] = await db.query(query, [idHabilidade]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Habilidade não encontrada para deletar.' });
        }
        res.status(200).send('Habilidade deletada com sucesso');
    } catch (err) {
        console.error('Erro ao deletar habilidade:', err);
        res.status(500).json({ error: 'Erro ao deletar habilidade', details: err });
    }
};

/**
 * Buscar habilidades por aluno (todas as habilidades em que o aluno teve desempenho).
 */
exports.getHabilidadesByAluno = async (req, res) => {
    const { idAluno } = req.params;
    const query = `
        SELECT h.idHabilidade, h.nome, h.descricao, h.idMateria
          FROM Habilidades h
          JOIN DesempenhoHabilidades dh ON h.idHabilidade = dh.idHabilidade
          JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
         WHERE ba.idAluno = ?
    `;
    try {
        const [results] = await db.query(query, [idAluno]);
        res.status(200).json(results);
    } catch (err) {
        console.error('Erro ao buscar habilidades do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar habilidades do aluno', details: err });
    }
};
/**
 * Estatísticas de habilidades mais/menos acertadas por turma, bimestre e tipoAvaliacao.
 */
exports.getHabilidadesStatsByTurmaBimestreAndTipoAvaliacao = async (req, res) => {
    const { idTurma, idBimestre, tipoAvaliacao } = req.params;

    try {
        const [rows] = await db.query(
            `
            SELECT h.nome AS habilidade, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
              AND nba.tipoAvaliacao = ?
            GROUP BY h.nome
            ORDER BY total DESC
            `,
            [idTurma, idBimestre, tipoAvaliacao]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhuma estatística de habilidades encontrada.' });
        }

        res.status(200).json({
            maisAcertada: rows[0]?.habilidade || 'N/A',
            menosAcertada: rows[rows.length - 1]?.habilidade || 'N/A',
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas de habilidades:', error);
        res.status(500).json({
            error: 'Erro interno ao buscar estatísticas de habilidades',
            details: error.message,
        });
    }
};

  
  


/**
 * Estatísticas de habilidades por aluno e bimestre, considerando a turma.
 */
exports.getHabilidadesStatsByAlunoAndBimestre = async (req, res) => {
    const { idTurma, idBimestre, tipoAvaliacao } = req.params;

    try {
        const [results] = await db.query(`
            SELECT 
                a.nome AS alunoNome,
                h.nome AS habilidadeNome,
                COUNT(dh.idHabilidade) AS totalAcertos
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Alunos a ON ba.idAluno = a.idAluno
            JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
            WHERE a.idTurma = ?
              AND ba.idBimestre = ?
              AND nba.tipoAvaliacao = ?
            GROUP BY a.idAluno, h.idHabilidade
            ORDER BY a.idAluno, totalAcertos DESC
        `, [idTurma, idBimestre, tipoAvaliacao]);

        if (!results.length) {
            return res.status(404).json({
                message: 'Nenhum dado de habilidades para os critérios fornecidos.',
            });
        }

        // Agrupar por aluno
        const alunos = {};
        results.forEach((row) => {
            if (!alunos[row.alunoNome]) {
                alunos[row.alunoNome] = {
                    nome: row.alunoNome,
                    habilidades: [],
                };
            }
            alunos[row.alunoNome].habilidades.push({
                nome: row.habilidadeNome,
                acertos: row.totalAcertos,
            });
        });

        // Formatar resposta
        const alunosResponse = Object.values(alunos).map((aluno) => {
            const maisAcertada = aluno.habilidades[0];
            const menosAcertada = aluno.habilidades[aluno.habilidades.length - 1];
            return {
                nome: aluno.nome,
                maisAcertada: maisAcertada ? maisAcertada.nome : 'N/A',
                menosAcertada: menosAcertada ? menosAcertada.nome : 'N/A',
            };
        });

        res.status(200).json({ alunos: alunosResponse });
    } catch (error) {
        console.error('Erro ao buscar habilidades por aluno e bimestre:', error);
        res.status(500).json({
            error: 'Erro ao buscar habilidades por aluno e bimestre',
            details: error.message,
        });
    }
};


/**
 * Top 5 erros (habilidades menos dominadas) por turma e bimestre.
 * Aqui o "ORDER BY total ASC" significa as que têm menos acertos (então seriam "mais erradas").
 */
exports.getTop5ErrosByTurmaAndBimestre = async (req, res) => {
    const { idTurma, idBimestre } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT h.nome, COUNT(dh.idHabilidade) AS total
              FROM DesempenhoHabilidades dh
              JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
              JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
             WHERE ba.idBimestre = ?
               AND ba.idAluno IN (
                   SELECT idAluno FROM Alunos WHERE idTurma = ?
               )
          GROUP BY h.nome
          ORDER BY total ASC
          LIMIT 5
        `, [idBimestre, idTurma]);

        res.status(200).json({ chartData: rows });
    } catch (error) {
        console.error('Erro ao buscar top 5 erros:', error);
        res.status(500).json({ error: 'Erro ao buscar top 5 erros', details: error });
    }
};

exports.getTop5HabilidadesByTurmaBimestreAndTipoAvaliacao = async (req, res) => {
    const { idTurma, idBimestre, tipoAvaliacao } = req.params;

    try {
        const [rows] = await db.query(
            `
            SELECT h.nome, COUNT(dh.idHabilidade) AS total
            FROM DesempenhoHabilidades dh
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Notas_Bimestre_Aluno nba ON ba.idBimestre_Aluno = nba.idBimestre_Aluno
            WHERE ba.idBimestre = ?
              AND nba.tipoAvaliacao = ?
              AND ba.idAluno IN (
                  SELECT idAluno FROM Alunos WHERE idTurma = ?
              )
            GROUP BY h.nome
            ORDER BY total DESC
            LIMIT 5
            `,
            [idBimestre, tipoAvaliacao, idTurma]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhum dado disponível para o top 5 habilidades.' });
        }

        res.status(200).json({ chartData: rows });
    } catch (error) {
        console.error('Erro ao buscar top 5 habilidades:', error);
        res.status(500).json({
            error: 'Erro interno ao buscar top 5 habilidades',
            details: error.message,
        });
    }
};

