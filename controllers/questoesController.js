const db = require('../config/db');

exports.createNotaQuestao = async (req, res) => {
    try {
        const { idAluno, idBimestre } = req.params;
        const { notasQuestoes, tipoAvaliacao } = req.body;

        console.log("📌 Iniciando processamento para aluno:", idAluno, "bimestre:", idBimestre);
        console.log("📌 Recebido payload:", JSON.stringify(notasQuestoes, null, 2));

        if (!Array.isArray(notasQuestoes) || notasQuestoes.length === 0) {
            return res.status(400).json({ error: 'É necessário fornecer um array de notas por questão.' });
        }

        if (tipoAvaliacao !== 0 && tipoAvaliacao !== 1) {
            return res.status(400).json({ error: 'O tipoAvaliacao deve ser 0 (Avaliação) ou 1 (Doutorzão).' });
        }

        let notaFinal = 0;
        let habilidadesInvalidas = [];
        let habilidadesMap = new Map();
        let bimestreAlunoMap = new Map();

        // 🔹 **Verifica se as habilidades existem**
        for (const questao of notasQuestoes) {
            const { habilidade } = questao;

            if (habilidade && habilidade.trim() !== "") {
                if (!habilidadesMap.has(habilidade)) {
                    console.log(`📌 Verificando existência da habilidade: ${habilidade}`);
                    const [habilidadeData] = await db.query(`
                        SELECT idHabilidade FROM Habilidades WHERE nome = ? LIMIT 1
                    `, [habilidade]);

                    if (habilidadeData.length === 0) {
                        habilidadesInvalidas.push(habilidade);
                    } else {
                        habilidadesMap.set(habilidade, habilidadeData[0].idHabilidade);
                    }
                }
            }
        }

        if (habilidadesInvalidas.length > 0) {
            return res.status(400).json({
                error: 'Habilidades não cadastradas no sistema:',
                habilidadesNaoEncontradas: habilidadesInvalidas
            });
        }

        // 🔹 **Busca ou cria `idBimestre_Aluno` para cada habilidade**
        for (const [habilidade, idHabilidade] of habilidadesMap.entries()) {
            console.log(`📌 Buscando idBimestre_Aluno para habilidade ${habilidade}...`);
            let idBimestre_Aluno = null;

            const [baExisting] = await db.query(`
                SELECT idBimestre_Aluno FROM Bimestre_Alunos 
                WHERE idAluno = ? AND idBimestre = ?
                LIMIT 1
            `, [idAluno, idBimestre]);

            if (baExisting.length > 0) {
                idBimestre_Aluno = baExisting[0].idBimestre_Aluno;
                console.log(`✅ idBimestre_Aluno encontrado: ${idBimestre_Aluno}`);
            } else {
                console.log(`🚨 Nenhum idBimestre_Aluno encontrado. Criando novo...`);
                const [newBaResult] = await db.query(`
                    INSERT INTO Bimestre_Alunos (idAluno, idBimestre) 
                    VALUES (?, ?)
                `, [idAluno, idBimestre]);

                idBimestre_Aluno = newBaResult.insertId;
                console.log(`✅ Novo idBimestre_Aluno criado: ${idBimestre_Aluno}`);
            }

            bimestreAlunoMap.set(habilidade, idBimestre_Aluno);
        }

        console.log("📌 Mapeamento final de idBimestre_Aluno:", bimestreAlunoMap);

        for (const questao of notasQuestoes) {
            const { numeroQuestao, pesoQuestao, status, habilidade } = questao;
            const idHabilidade = habilidadesMap.get(habilidade);
            const idBimestre_Aluno = bimestreAlunoMap.get(habilidade);

            if (!idBimestre_Aluno) {
                console.error(`❌ ERRO: idBimestre_Aluno não encontrado para ${habilidade}`);
                continue;
            }

            console.log(`📌 Processando Questão ${numeroQuestao} - Habilidade: ${habilidade}, idBimestre_Aluno: ${idBimestre_Aluno}`);

            const notaQuestao = (status === "Correto") ? pesoQuestao : 0;
            notaFinal += notaQuestao;

            await db.query(`
                INSERT INTO Notas_Questoes (idBimestre_Aluno, numeroQuestao, notaQuestao, pesoQuestao)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE notaQuestao = VALUES(notaQuestao), pesoQuestao = VALUES(pesoQuestao)
            `, [idBimestre_Aluno, numeroQuestao, notaQuestao, pesoQuestao]);
        }

        console.log(`📌 Nota final calculada: ${notaFinal}`);

        await db.query(`
            INSERT INTO Notas_Bimestre_Aluno (idBimestre_Aluno, tipoAvaliacao, nota)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE nota = VALUES(nota)
        `, [idBimestre_Aluno, tipoAvaliacao, notaFinal]);

        res.status(201).json({
            message: 'Notas e habilidades inseridas com sucesso.',
            notaFinal: notaFinal,
            tipoAvaliacao: tipoAvaliacao
        });

    } catch (err) {
        console.error('❌ ERRO FATAL AO INSERIR NOTAS:', err);
        res.status(500).json({
            error: 'Erro ao inserir notas e habilidades',
            details: err.message
        });
    }
};


/**
 * Buscar notas das questões de um aluno por bimestre, retornando a nota final e habilidades associadas.
 */
exports.getNotasQuestoesByAluno = async (req, res) => {
    const { idAluno, idBimestre } = req.params;

    try {
        // 🔹 Busca as notas das questões associadas ao bimestre e aluno
        const [notasQuestoes] = await db.query(`
            SELECT nq.numeroQuestao, nq.notaQuestao, nq.pesoQuestao, ba.idBimestre_Aluno
            FROM Notas_Questoes nq
            JOIN Bimestre_Alunos ba ON nq.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
        `, [idAluno, idBimestre]);

        // 🔹 Busca a nota final e o tipo de avaliação
        const [notaFinalData] = await db.query(`
            SELECT nb.tipoAvaliacao, nb.nota
            FROM Notas_Bimestre_Aluno nb
            JOIN Bimestre_Alunos ba ON nb.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
        `, [idAluno, idBimestre]);

        // 🔹 Busca as habilidades associadas às questões
        const [habilidades] = await db.query(`
            SELECT DISTINCT dh.idHabilidade, h.nome, dh.codigo, dh.idBimestre_Aluno
            FROM DesempenhoHabilidades dh
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
        `, [idAluno, idBimestre]);

        if (notasQuestoes.length === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota encontrada para esse aluno e bimestre.'
            });
        }

        res.status(200).json({
            notasQuestoes,
            notaFinal: notaFinalData.length > 0 ? notaFinalData[0].nota : null,
            tipoAvaliacao: notaFinalData.length > 0 ? notaFinalData[0].tipoAvaliacao : null,
            habilidades
        });

    } catch (err) {
        console.error('❌ Erro ao buscar notas das questões e habilidades:', err);
        res.status(500).json({
            error: 'Erro ao buscar notas das questões e habilidades',
            details: err.message
        });
    }
};
