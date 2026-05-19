const dadosPadrao = [
  {
    nome: "Segunda",
    materias: [
      { nome: "Português", tema: "Tipos Textuais", questoes: 50, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 },
      { nome: "História", tema: "Revoluções", questoes: 50, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  },
  {
    nome: "Terça",
    materias: [
      { nome: "Matemática", tema: "Sistemas", questoes: 50, horas: 2, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 },
      { nome: "Geografia", tema: "Tipos de Rochas", questoes: 50, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  },
  {
    nome: "Quarta",
    materias: [
      { nome: "Português", tema: "Interpretação", questoes: 50, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 },
      { nome: "História", tema: "História Geral", questoes: 50, horas: 1.5, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  },
  {
    nome: "Quinta",
    materias: [
      { nome: "Matemática", tema: "Exercícios", questoes: 50, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 },
      { nome: "Geografia", tema: "Geografia Geral", questoes: 50, horas: 1.5, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  },
  {
    nome: "Sexta",
    materias: [
      { nome: "Redação", tema: "Repertórios", questoes: 30, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 },
      { nome: "Redação", tema: "Prática", questoes: 30, horas: 1, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  },
  {
    nome: "Sábado",
    materias: [
      { nome: "Simulado", tema: "80 questões", questoes: 80, horas: 4, certas: 0, erradas: 0, hFeitas: 0, mFeitos: 0 }
    ]
  }
];

let dias = JSON.parse(localStorage.getItem("metaflow_dados")) || dadosPadrao;
let diaAtual = 0;
let naHome = true;

function renderizarTela() {
  atualizarTrackerSemanal();

  if (naHome) {
    renderizarHome();
  } else {
    renderizarDia();
  }
}

function renderizarHome() {
  document.getElementById("topoNavegacao").style.display = "none";
  
  let totalQuestoesMeta = 0;
  let totalQuestoesFeitas = 0;
  let totalCertasGeral = 0;
  let totalHorasMeta = 0;
  let totalHorasFeitas = 0;
  let totalPorcentagemGeral = 0;

  dias.forEach(dia => {
    let porcentagemDia = 0;
    let materiasConcluidas = 0;

    dia.materias.forEach(materia => {
      totalQuestoesMeta += materia.questoes;
      let qFeitasMateria = (materia.certas || 0) + (materia.erradas || 0);
      totalQuestoesFeitas += qFeitasMateria;
      totalCertasGeral += (materia.certas || 0);
      
      totalHorasMeta += materia.horas;
      let tempoMateria = (materia.hFeitas || 0) + ((materia.mFeitos || 0) / 60);
      totalHorasFeitas += tempoMateria;

      let pQ = (qFeitasMateria / materia.questoes) * 50;
      let pH = (tempoMateria / materia.horas) * 50;
      if (pQ > 50) pQ = 50;
      if (pH > 50) pH = 50;
      
      porcentagemDia += (pQ + pH);
      if (qFeitasMateria >= materia.questoes && tempoMateria >= materia.horas) {
        materiasConcluidas++;
      }
    });

    let mediaDia = porcentagemDia / dia.materias.length;
    if(materiasConcluidas === dia.materias.length) mediaDia = 100;
    totalPorcentagemGeral += mediaDia;
  });

  let progressoSemanal = Math.round(totalPorcentagemGeral / dias.length);
  
  // Taxa de acerto global da semana inteira
  let taxaAcertoGeral = totalQuestoesFeitas > 0 ? Math.round((totalCertasGeral / totalQuestoesFeitas) * 100) : 0;

  document.getElementById("conteudoDia").innerHTML = `
    <div class="card">
      <h3 style="color: #10B981; font-size: 28px; margin-bottom: 20px;">📊 Dashboard Semanal</h3>
      
      <div class="home-stats">
        <div class="stat-box">
          <h4>Questões Feitas</h4>
          <p>${totalQuestoesFeitas} / ${totalQuestoesMeta}</p>
        </div>
        <div class="stat-box">
          <h4>Horas Estudadas</h4>
          <p>${totalHorasFeitas.toFixed(1)}h / ${totalHorasMeta}h</p>
        </div>
      </div>

      <div class="stat-box" style="margin-bottom: 25px; width: 100%;">
        <h4>Taxa de Acerto Geral (Semana)</h4>
        <p style="color: #10B981;">${taxaAcertoGeral}% de Acertos</p>
      </div>

      <label style="margin-top:0;">Progresso Geral da Semana</label>
      <div class="progress" style="margin-top: 10px;">
        <div class="progress-bar" id="barraGeral" style="width: ${progressoSemanal}%"></div>
      </div>
      <div class="status">${progressoSemanal}% de todas as metas concluídas</div>
      
      <button class="btn-reset" onclick="resetarSemana()">🔄 Resetar Semana</button>
    </div>
  `;
}

function renderizarDia() {
  document.getElementById("topoNavegacao").style.display = "flex";
  const dia = dias[diaAtual];
  document.getElementById("tituloDia").innerHTML = dia.nome;

  let html = "";

  dia.materias.forEach((materia, index) => {
    const cValue = materia.certas || "";
    const eValue = materia.erradas || "";
    const hValue = materia.hFeitas || "";
    const mValue = materia.mFeitos || "";

    // Calcula acertos individuais daquela matéria
    let totalFeitas = (materia.certas || 0) + (materia.erradas || 0);
    let rendimentoMateria = totalFeitas > 0 ? Math.round((materia.certas / totalFeitas) * 100) : 0;

    html += `
      <div class="task">
        <h3>${materia.nome}</h3>
        <p>${materia.tema}</p>
        <div class="rendimento-tag" id="rendimento-${index}">🎯 Acertos: ${rendimentoMateria}%</div>
        <p style="font-size:16px; color:#9CA3AF; margin-bottom: 10px;">Meta: ${materia.questoes} questões + ${materia.horas}h</p>

        <!-- NOVO: Linha dividida para certas e erradas -->
        <div class="row-tempo">
          <div class="col-tempo">
            <label>Certas</label>
            <input type="number" id="c${index}" value="${cValue}" oninput="salvarDados(${index})">
          </div>
          <div class="col-tempo">
            <label>Erradas</label>
            <input type="number" id="e${index}" value="${eValue}" oninput="salvarDados(${index})">
          </div>
        </div>

        <div class="row-tempo">
          <div class="col-tempo">
            <label>Horas</label>
            <input type="number" id="h${index}" value="${hValue}" oninput="salvarDados(${index})">
          </div>
          <div class="col-tempo">
            <label>Minutos</label>
            <input type="number" id="m${index}" value="${mValue}" oninput="salvarDados(${index})">
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById("conteudoDia").innerHTML = `
    <div class="card" id="cardAtual">
      ${html}
      <div class="progress">
        <div class="progress-bar" id="barra"></div>
      </div>
      <div class="status" id="status">0% concluído</div>
      <button class="btn-reset" onclick="resetarSemana()">🔄 Resetar Semana</button>
    </div>
  `;

  calcularTotal();
}

function salvarDados(index) {
  const dia = dias[diaAtual];
  
  dia.materias[index].certas = Number(document.getElementById(`c${index}`).value);
  dia.materias[index].erradas = Number(document.getElementById(`e${index}`).value);
  dia.materias[index].hFeitas = Number(document.getElementById(`h${index}`).value);
  dia.materias[index].mFeitos = Number(document.getElementById(`m${index}`).value);

  localStorage.setItem("metaflow_dados", JSON.stringify(dias));

  // Atualiza dinamicamente a tag de % de acertos na tela antes do cálculo total
  let totalFeitas = dia.materias[index].certas + dia.materias[index].erradas;
  let rendimento = totalFeitas > 0 ? Math.round((dia.materias[index].certas / totalFeitas) * 100) : 0;
  document.getElementById(`rendimento-${index}`).innerHTML = `🎯 Acertos: ${rendimento}%`;

  calcularTotal();
}

function calcularTotal() {
  if (naHome) return;

  const dia = dias[diaAtual];
  let totalPorcentagem = 0;
  let totalMaterias = dia.materias.length;
  let metasConcluidas = 0;

  dia.materias.forEach((materia, index) => {
    let certas = Number(document.getElementById(`c${index}`).value);
    let erradas = Number(document.getElementById(`e${index}`).value);
    let horas = Number(document.getElementById(`h${index}`).value);
    let minutos = Number(document.getElementById(`m${index}`).value);

    let questoesTotal = certas + erradas;
    let tempoTotal = horas + (minutos / 60);

    let porcentagemQuestoes = (questoesTotal / materia.questoes) * 50;
    let porcentagemHoras = (tempoTotal / materia.horas) * 50;

    if (porcentagemQuestoes > 50) porcentagemQuestoes = 50;
    if (porcentagemHoras > 50) porcentagemHoras = 50;

    let porcentagemMateria = porcentagemQuestoes + porcentagemHoras;

    if (questoesTotal < materia.questoes || tempoTotal < materia.horas) {
      if (porcentagemMateria >= 100) porcentagemMateria = 99;
    }

    if (questoesTotal >= materia.questoes && tempoTotal >= materia.horas) {
      metasConcluidas++;
    }

    totalPorcentagem += porcentagemMateria;
  });

  let media = totalPorcentagem / totalMaterias;

  const statusEl = document.getElementById("status");
  const cardEl = document.getElementById("cardAtual");
  const barraEl = document.getElementById("barra");

  if (statusEl && cardEl && barraEl) {
    if (metasConcluidas === totalMaterias) {
      media = 100;
      statusEl.innerHTML = "✅ Meta diária concluída";
      cardEl.classList.add("complete");
    } else {
      statusEl.innerHTML = Math.round(media) + "% concluído";
      cardEl.classList.remove("complete");
    }
    
    barraEl.style.width = media + "%";
  }
}

function irParaHome() {
  naHome = true;
  renderizarTela();
}

function irParaDia(index) {
  naHome = false;
  diaAtual = index;
  renderizarTela();
}

function atualizarTrackerSemanal() {
  document.getElementById("dot-home").classList.remove("ativo");
  for (let i = 0; i < dias.length; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) dot.classList.remove("ativo");
  }

  if (naHome) {
    document.getElementById("dot-home").classList.add("ativo");
  } else {
    const dotAtivo = document.getElementById(`dot-${diaAtual}`);
    if (dotAtivo) dotAtivo.classList.add("ativo");
  }

  dias.forEach((dia, diaIdx) => {
    let metasConcluidas = 0;
    
    dia.materias.forEach((materia) => {
      let qTotal = (materia.certas || 0) + (materia.erradas || 0);
      let tempoTotal = (materia.hFeitas || 0) + ((materia.mFeitos || 0) / 60);
      if (qTotal >= materia.questoes && tempoTotal >= materia.horas) {
        metasConcluidas++;
      }
    });

    const dot = document.getElementById(`dot-${diaIdx}`);
    if (dot) {
      if (metasConcluidas === dia.materias.length) {
        dot.classList.add("concluido");
      } else {
        dot.classList.remove("concluido");
      }
    }
  });
}

function resetarSemana() {
  if (confirm("Deseja realmente zerar todo o progresso da semana?")) {
    localStorage.removeItem("metaflow_dados");
    dias = JSON.parse(JSON.stringify(dadosPadrao)); 
    renderizarTela();
  }
}

function proximoDia() {
  naHome = false;
  diaAtual++;
  if (diaAtual >= dias.length) diaAtual = 0;
  renderizarTela();
}

function voltarDia() {
  naHome = false;
  diaAtual--;
  if (diaAtual < 0) diaAtual = dias.length - 1;
  renderizarTela();
}

renderizarTela();