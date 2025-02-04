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
      SELECT idBimestre_Aluno FROM Bimestre_Alunos
      WHERE idAluno = ? AND idBimestre = ?
    `, [idAluno, idBimestre]);

    if (bimestreAlunos.length === 0) {
      return res.status(400).json({ error: `Nenhum Bimestre_Aluno encontrado para aluno ${idAluno} e bimestre ${idBimestre}` });
    }

    let bimestreAlunoIds = bimestreAlunos.map(b => b.idBimestre_Aluno);
    console.log(`📌 Lista de idBimestre_Aluno disponíveis: ${bimestreAlunoIds.join(', ')}`);

    let habilidadeIndex = 0;
    let habilidadesMap = new Map(); // `idBimestre_Aluno` -> `habilidade`

    for (const questao of notasQuestoes) {
      const { numeroQuestao, pesoQuestao, notaQuestao, habilidade } = questao;

      const notaCalculada = notaQuestao * pesoQuestao;
      const idBimestre_Aluno = bimestreAlunoIds[habilidadeIndex % bimestreAlunoIds.length]; // Alterna entre os disponíveis

      if (!habilidadesMap.has(idBimestre_Aluno)) {
        habilidadesMap.set(idBimestre_Aluno, habilidade);
      }

      console.log(`🔄 Atualizando questão ${numeroQuestao} para idBimestre_Aluno ${idBimestre_Aluno}`);

      // 🔹 **Atualiza ou insere nota na tabela `Notas_Questoes`**
      const [updateResult] = await db.query(`
        UPDATE Notas_Questoes
        SET notaQuestao = ?, pesoQuestao = ?, tipoAvaliacao = ?
        WHERE idBimestre_Aluno = ? AND numeroQuestao = ?
      `, [notaCalculada, pesoQuestao, tipoAvaliacao, idBimestre_Aluno, numeroQuestao]);

      if (updateResult.affectedRows === 0) {
        await db.query(`
          INSERT INTO Notas_Questoes (idBimestre_Aluno, numeroQuestao, notaQuestao, pesoQuestao, tipoAvaliacao)
          VALUES (?, ?, ?, ?, ?)
        `, [idBimestre_Aluno, numeroQuestao, notaCalculada, pesoQuestao, tipoAvaliacao]);
      }
      
      habilidadeIndex++; // Alterna para o próximo `idBimestre_Aluno`
    }

    // 🔹 **Corrigindo as habilidades no banco**
    console.log(`📌 Distribuindo habilidades corretamente para cada idBimestre_Aluno...`);

    for (const [idBimestre_Aluno, codigoHabilidade] of habilidadesMap.entries()) {
      console.log(`✔ Associando ${codigoHabilidade} ao idBimestre_Aluno ${idBimestre_Aluno}`);

      const [habilidadeData] = await db.query(`
        SELECT idHabilidade FROM Habilidades WHERE nome = ?
      `, [codigoHabilidade]);

      if (habilidadeData.length > 0) {
        const idHabilidade = habilidadeData[0].idHabilidade;

        // 🔹 **Verifica se o `idBimestre_Aluno` já tem uma habilidade associada**
        const [existing] = await db.query(`
          SELECT idDesempenho FROM DesempenhoHabilidades 
          WHERE idBimestre_Aluno = ?
        `, [idBimestre_Aluno]);

        if (existing.length > 0) {
          // 🔹 **Atualiza o registro existente**
          await db.query(`
            UPDATE DesempenhoHabilidades 
            SET idHabilidade = ?, codigo = ?
            WHERE idDesempenho = ?
          `, [idHabilidade, codigoHabilidade, existing[0].idDesempenho]);
        } else {
          // 🔹 **Insere um novo registro**
          await db.query(`
            INSERT INTO DesempenhoHabilidades (idBimestre_Aluno, idHabilidade, codigo)
            VALUES (?, ?, ?)
          `, [idBimestre_Aluno, idHabilidade, codigoHabilidade]);
        }
      } else {
        console.warn(`⚠ Habilidade com nome "${codigoHabilidade}" não encontrada.`);
      }
    }

    console.log("📌 Atualizando a nota final...");
    let notaFinal = 0;
    let totalQuestoes = 0;
    for (const idBimestreAluno of bimestreAlunoIds) {
      const [notas] = await db.query(`
        SELECT SUM(nq.notaQuestao) AS notaTotal, COUNT(nq.numeroQuestao) AS totalQuestoes
        FROM Notas_Questoes nq
        WHERE nq.idBimestre_Aluno = ?
      `, [idBimestreAluno]);

      notaFinal += notas[0].notaTotal || 0;
      totalQuestoes += notas[0].totalQuestoes;
    }

    if (totalQuestoes === 12) {
      notaFinal = (notaFinal / 12) * 10;
    } else if (totalQuestoes === 24) {
      notaFinal = (notaFinal / 24) * 10;
    }

    console.log(`📌 Nota final ajustada: ${notaFinal}`);

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
      desempenhoHabilidades: habilidadesMap.size,
      idBimestreAlunoFinal: bimestreAlunos[0].idBimestre_Aluno,
      notaFinal: notaFinal,
      tipoAvaliacao: tipoAvaliacao
    });

  } catch (err) {
    console.error('❌ ERRO:', err);
    res.status(500).json({ error: 'Erro ao inserir notas e habilidades', details: err.message });
  }
};




exports.getNotasQuestoesByAluno = async (req, res) => {
  const { idAluno, idBimestre } = req.params;
  try {
    console.log(`📌 Buscando notas para Aluno: ${idAluno}, Bimestre: ${idBimestre}`);
    const [notasQuestoes] = await db.query(
      `
      SELECT nq.numeroQuestao, nq.notaQuestao, nq.pesoQuestao, nq.tipoAvaliacao, ba.idBimestre_Aluno
      FROM Notas_Questoes nq
      JOIN Bimestre_Alunos ba ON nq.idBimestre_Aluno = ba.idBimestre_Aluno
      WHERE ba.idAluno = ? AND ba.idBimestre = ?
      ORDER BY nq.numeroQuestao
      `,
      [idAluno, idBimestre]
    );

    if (notasQuestoes.length === 0) {
      return res.status(404).json({
        error: 'Nenhuma nota encontrada para esse aluno e bimestre.'
      });
    }
    console.log(`✅ Notas encontradas: ${notasQuestoes.length}`);

    // Remove duplicatas (caso existam) e calcula a nota total
    const questoesMap = new Map();
    let totalNotaBruta = 0;
    let totalQuestoes = 0;
    for (const questao of notasQuestoes) {
      if (!questoesMap.has(questao.numeroQuestao)) {
        questoesMap.set(questao.numeroQuestao, questao);
        totalNotaBruta += questao.notaQuestao;
        totalQuestoes++;
      } else {
        console.warn(`⚠ Questão duplicada encontrada: ${questao.numeroQuestao}, removendo.`);
      }
    }
    const questoesCorrigidas = Array.from(questoesMap.values());
    if (totalQuestoes !== 10 && totalQuestoes !== 12 && totalQuestoes !== 24) {
      console.warn(`⚠ Número inesperado de questões: ${totalQuestoes}`);
    }

    let notaFinalCorrigida = totalNotaBruta;
    if (totalQuestoes === 12) {
      notaFinalCorrigida = (totalNotaBruta / 12) * 10;
      console.log(`📌 Nota final ajustada para 10 questões (12 questões): ${notaFinalCorrigida}`);
    } else if (totalQuestoes === 24) {
      notaFinalCorrigida = (totalNotaBruta / 24) * 10;
      console.log(`📌 Nota final ajustada para 10 questões (24 questões): ${notaFinalCorrigida}`);
    }

    const [tipoAvaliacaoData] = await db.query(
      `
      SELECT MAX(nb.tipoAvaliacao) AS tipoAvaliacao
      FROM Notas_Bimestre_Aluno nb
      JOIN Bimestre_Alunos ba ON nb.idBimestre_Aluno = ba.idBimestre_Aluno
      WHERE ba.idAluno = ? AND ba.idBimestre = ?
      `,
      [idAluno, idBimestre]
    );

    const [habilidades] = await db.query(
      `
      SELECT DISTINCT dh.idHabilidade, h.nome, dh.codigo, dh.idBimestre_Aluno
      FROM DesempenhoHabilidades dh
      JOIN Habilidades h ON dh.idHabilidade = h.idHabilidade
      JOIN Bimestre_Alunos ba ON dh.idBimestre_Aluno = ba.idBimestre_Aluno
      WHERE ba.idAluno = ? AND ba.idBimestre = ?
      `,
      [idAluno, idBimestre]
    );

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
