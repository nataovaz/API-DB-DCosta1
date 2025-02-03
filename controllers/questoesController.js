const db = require('../config/db');

exports.createNotaQuestao = async (req, res) => {
    try {
        const { idAluno, idBimestre } = req.params;
        const { notasQuestoes, tipoAvaliacao } = req.body;

        console.log(`📌 Processando notas para o aluno: ${idAluno} | Bimestre: ${idBimestre} | Tipo Avaliação: ${tipoAvaliacao}`);

        if (!Array.isArray(notasQuestoes) || notasQuestoes.length === 0) {
            return res.status(400).json({ error: 'É necessário fornecer um array de notas por questão.' });
        }

        // 🔹 **Busca os `idBimestre_Aluno` válidos**
        const [bimestreAlunos] = await db.query(`
            SELECT DISTINCT idBimestre_Aluno FROM Bimestre_Alunos
            WHERE idAluno = ? AND idBimestre = ?
        `, [idAluno, idBimestre]);

        if (bimestreAlunos.length === 0) {
            return res.status(400).json({ error: `Nenhum Bimestre_Aluno encontrado para aluno ${idAluno} e bimestre ${idBimestre}` });
        }

        let bimestreAlunoMap = new Map();
        bimestreAlunos.forEach(({ idBimestre_Aluno }) => {
            bimestreAlunoMap.set(idBimestre_Aluno, idBimestre_Aluno);
        });

        console.log("📌 Mapeamento de `idBimestre_Aluno`:", JSON.stringify([...bimestreAlunoMap.values()], null, 2));

        // 🔹 **Inserir ou Atualizar Notas das Questões**
        for (const questao of notasQuestoes) {
            const { numeroQuestao, pesoQuestao, notaQuestao, idBimestre_Aluno } = questao;

            if (!bimestreAlunoMap.has(idBimestre_Aluno)) continue;

            const notaCalculada = notaQuestao * pesoQuestao;

            console.log(`🔄 Atualizando questão ${numeroQuestao} com nota ${notaCalculada}`);

            await db.query(`
                INSERT INTO Notas_Questoes (idBimestre_Aluno, numeroQuestao, notaQuestao, pesoQuestao)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    notaQuestao = VALUES(notaQuestao),
                    pesoQuestao = VALUES(pesoQuestao)
            `, [idBimestre_Aluno, numeroQuestao, notaCalculada, pesoQuestao]);
        }

        console.log("📌 Atualizando a nota final...");

        // 🔹 **Calcular a Nota Final corretamente**
        let notaFinal = 0;
        let totalQuestoes = 0;

        for (const idBimestre_Aluno of bimestreAlunoMap.values()) {
            const [notas] = await db.query(`
                SELECT SUM(nq.notaQuestao) AS notaTotal, COUNT(nq.numeroQuestao) AS totalQuestoes
                FROM Notas_Questoes nq
                WHERE nq.idBimestre_Aluno = ?
            `, [idBimestre_Aluno]);

            notaFinal += notas[0].notaTotal || 0;
            totalQuestoes += notas[0].totalQuestoes;
        }

        // 🔹 **Ajuste para equivalência de 10 questões**
        if (totalQuestoes === 12) {
            notaFinal = (notaFinal / 12) * 10;
            console.log(`📌 Nota final ajustada para 10 questões: ${notaFinal}`);
        }

        console.log(`📌 Nota final calculada: ${notaFinal}`);

        // 🔹 **Atualizar ou inserir a nota final no banco**
        const [existingNotaFinal] = await db.query(`
            SELECT idNotas FROM Notas_Bimestre_Aluno
            WHERE idBimestre_Aluno = ? AND tipoAvaliacao = ?
        `, [bimestreAlunos[0].idBimestre_Aluno, tipoAvaliacao]);

        if (existingNotaFinal.length > 0) {
            await db.query(`
                UPDATE Notas_Bimestre_Aluno
                SET nota = ?
                WHERE idNotas = ?
            `, [notaFinal, existingNotaFinal[0].idNotas]);
        } else {
            await db.query(`
                INSERT INTO Notas_Bimestre_Aluno (idBimestre_Aluno, tipoAvaliacao, nota)
                VALUES (?, ?, ?)
            `, [bimestreAlunos[0].idBimestre_Aluno, tipoAvaliacao, notaFinal]);
        }

        res.status(201).json({
            message: 'Notas e habilidades inseridas ou atualizadas com sucesso.',
            idBimestreAlunoFinal: bimestreAlunos[0].idBimestre_Aluno,
            notaFinal: notaFinal,
            tipoAvaliacao: tipoAvaliacao
        });

    } catch (err) {
        console.error('❌ ERRO:', err);
        res.status(500).json({ error: 'Erro ao inserir notas e habilidades', details: err.message });
    }
};





/**
 * Buscar notas das questões de um aluno por bimestre, retornando a nota final e habilidades associadas.
 */
exports.getNotasQuestoesByAluno = async (req, res) => {
    const { idAluno, idBimestre } = req.params;

    try {
        console.log(`📌 Buscando notas para Aluno: ${idAluno}, Bimestre: ${idBimestre}`);

        // 🔹 **Busca as notas das questões associadas ao bimestre e aluno**
        const [notasQuestoes] = await db.query(`
            SELECT nq.numeroQuestao, nq.notaQuestao, nq.pesoQuestao, ba.idBimestre_Aluno
            FROM Notas_Questoes nq
            JOIN Bimestre_Alunos ba ON nq.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
            ORDER BY nq.numeroQuestao
        `, [idAluno, idBimestre]);

        if (notasQuestoes.length === 0) {
            return res.status(404).json({
                error: 'Nenhuma nota encontrada para esse aluno e bimestre.'
            });
        }

        console.log(`✅ Notas encontradas: ${notasQuestoes.length}`);

        // 🔹 **Correção para remover questões duplicadas**
        const questoesMap = new Map();
        let totalNotaBruta = 0;
        let totalQuestoes = 0;

        for (const questao of notasQuestoes) {
            if (!questoesMap.has(questao.numeroQuestao)) {
                questoesMap.set(questao.numeroQuestao, questao);
                totalNotaBruta += questao.notaQuestao * questao.pesoQuestao;
                totalQuestoes++;
            } else {
                console.warn(`⚠ Questão duplicada encontrada: ${questao.numeroQuestao}, removendo.`);
            }
        }

        const questoesCorrigidas = Array.from(questoesMap.values());

        // 🔹 **Verifica se há 10 ou 12 questões**
        if (totalQuestoes !== 10 && totalQuestoes !== 12) {
            console.warn(`⚠ Número inesperado de questões: ${totalQuestoes}`);
        }

        // 🔹 **Ajustar a nota final para um total de 10**
        let notaFinalCorrigida = totalNotaBruta;
        if (totalQuestoes === 12) {
            notaFinalCorrigida = (totalNotaBruta / 12) * 10;
            console.log(`📌 Nota final ajustada para 10 questões: ${notaFinalCorrigida}`);
        }

        // 🔹 **Busca o tipo de avaliação**
        const [tipoAvaliacaoData] = await db.query(`
            SELECT MAX(nb.tipoAvaliacao) AS tipoAvaliacao
            FROM Notas_Bimestre_Aluno nb
            JOIN Bimestre_Alunos ba ON nb.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
        `, [idAluno, idBimestre]);

        // 🔹 **Busca as habilidades associadas às questões**
        const [habilidades] = await db.query(`
            SELECT DISTINCT dh.idHabilidade, h.nome, dh.codigo, dh.idBimestre_Aluno
            FROM DesempenhoHabilidades dh
            JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
            JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
            WHERE ba.idAluno = ? AND ba.idBimestre = ?
        `, [idAluno, idBimestre]);

        console.log(`✅ Nota Final calculada e corrigida: ${notaFinalCorrigida}`);

        res.status(200).json({
            notasQuestoes: questoesCorrigidas,
            notaFinal: parseFloat(notaFinalCorrigida.toFixed(2)),
            tipoAvaliacao: tipoAvaliacaoData.length > 0 ? tipoAvaliacaoData[0].tipoAvaliacao : null,
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
