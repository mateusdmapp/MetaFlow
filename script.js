// ==========================================
// 1. CONFIGURAÇÕES E DADOS PADRÃO (TOPO)
// ==========================================
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

// ==========================================
// 2. ESTADOS GLOBAIS DO APLICATIVO
// ==========================================
let dias = JSON.parse(localStorage.getItem("metaflow_dados")) || dadosPadrao;
let historicoSemanas = JSON.parse(localStorage.getItem("metaflow_historico_semanas")) || [];
let cadernoErros = JSON.parse(localStorage.getItem("metaflow_caderno_erros")) || [];
let instaciaGrafico = null; 

let diaAtual = 0;
let naHome = true;
let visualizandoCadernoErros = false;

// Estado do Cronômetro
let pomoIntervalo = null;
let pomoTempoDecorrido = 0; 
let pomoMateriaAlvoIndex = null;
let modoCronometroAtivo = "progressivo"; 
let tempoRegressivoTotalSegundos = 0;

// ==========================================
// 3. FUNÇÕES DE NAVEGAÇÃO E TELA
// ==========================================
function renderizarTela() {
  atualizarTrackerSemanal();
  if (visualizandoCadernoErros) {
    renderizarCadernoErrosTela();
  } else if (naHome) { 
    renderizarHome(); 
    inicializarGraficoEvolucao();
  } else { 
    renderizarDia(); 
  }
}

function irParaHome() { 
  visualizandoCadernoErros = false; 
  naHome = true; 
  renderizarTela(); 
}

function irParaDia(index) { 
  visualizandoCadernoErros = false; 
  naHome = false; 
  diaAtual = index; 
  renderizarTela(); 
}

function proximoDia() { 
  visualizandoCadernoErros = false; 
  naHome = false; 
  diaAtual++; 
  if (diaAtual >= dias.length) diaAtual = 0; 
  renderizarTela(); 
}

function voltarDia() { 
  visualizandoCadernoErros = false; 
  naHome = false; 
  diaAtual--; 
  if (diaAtual < 0) diaAtual = dias.length - 1; 
  renderizarTela(); 
}

// ==========================================
// 4. SISTEMAS INTERNOS
// ==========================================
function calcularDiasSeguidos() {
  let diasConcluidosSequencia = 0;
  dias.forEach(dia => {
    let metasDoDiaBatidas = 0;
    dia.materias.forEach(m => {
      let qTotal = (m.certas || 0) + (m.erradas || 0);
      let tTotal = (m.hFeitas || 0) + ((m.mFeitos || 0) / 60);
      if (qTotal >= m.questoes && tTotal >= m.horas) metasDoDiaBatidas++;
    });
    if (dia.materias.length > 0 && metasDoDiaBatidas === dia.materias.length) {
      diasConcluidosSequencia++;
    }
  });
  return diasConcluidosSequencia;
}

function verificarViradaDeSemana() {
  const agora = new Date();
  const numeroSemanaAtual = obterNumeroDaSemana(agora);
  const ultimaSemanaRegistrada = localStorage.getItem("metaflow_ultima_semana");

  if (ultimaSemanaRegistrada && ultimaSemanaRegistrada !== String(numeroSemanaAtual)) {
    salvarSemanaNoHistoricoLog(ultimaSemanaRegistrada);
    localStorage.removeItem("metaflow_dados");
    dias = JSON.parse(JSON.stringify(dadosPadrao));
  }
  localStorage.setItem("metaflow_ultima_semana", numeroSemanaAtual);
}

function obterNumeroDaSemana(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function salvarSemanaNoHistoricoLog(semanaId) {
  let totalQ = 0, totalC = 0;
  dias.forEach(d => d.materias.forEach(m => {
    totalQ += (m.certas + m.erradas);
    totalC += m.certas;
  }));
  let taxa = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;
  historicoSemanas.push({ semana: semanaId, rendimento: taxa, data: new Date().toLocaleDateString('pt-BR') });
  localStorage.setItem("metaflow_historico_semanas", JSON.stringify(historicoSemanas));
}

function alternarTema() {
  if (document.body.classList.contains("dark-mode") || !document.body.className) {
    document.body.className = "light-mode";
    localStorage.setItem("metaflow_tema", "light");
  } else {
    document.body.className = "dark-mode";
    localStorage.setItem("metaflow_tema", "dark");
  }
  if (naHome && !visualizandoCadernoErros) inicializarGraficoEvolucao();
}

function obterClasseRendimento(porcentagem) {
  if (porcentagem < 70) return "rendimento-ruim";
  if (porcentagem >= 70 && porcentagem < 80) return "rendimento-medio";
  return "rendimento-excelente";
}

function inicializarGraficoEvolucao() {
  const ctx = document.getElementById('graficoEvolucaoCanvas');
  if (!ctx) return;
  if (instaciaGrafico) { instaciaGrafico.destroy(); }

  let ultimasSemanas = historicoSemanas.slice(-5);
  let labels = ultimasSemanas.map(h => `Sem ${h.semana}`);
  let dadosAcerto = ultimasSemanas.map(h => h.rendimento);

  if (ultimasSemanas.length === 0) {
    labels = ["Sem Dados"];
    dadosAcerto = [0];
  }

  const corTexto = document.body.classList.contains("light-mode") ? "#0F172A" : "#F8FAFC";

  instaciaGrafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '% Acertos',
        data: dadosAcerto,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        borderWidth: 3,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: corTexto } },
        x: { grid: { display: false }, ticks: { color: corTexto } }
      }
    }
  });
}

// ==========================================
// 5. RENDERIZAR HOME (DASHBOARD)
// ==========================================
function renderizarHome() {
  const topoNav = document.getElementById("topoNavegacao");
  if (topoNav) topoNav.style.display = "none";
  
  let totalQuestoesMeta = 0, totalQuestoesFeitas = 0, totalCertasGeral = 0;
  let totalHorasMeta = 0, totalHorasFeitas = 0, totalPorcentagemGeral = 0;
  let rendimentosPorMateria = {};

  dias.forEach(dia => {
    let porcentagemDia = 0, materiasConcluidas = 0;
    dia.materias.forEach(materia => {
      totalQuestoesMeta += materia.questoes;
      let qFeitasMateria = (materia.certas || 0) + (materia.erradas || 0);
      totalQuestoesFeitas += qFeitasMateria;
      totalCertasGeral += (materia.certas || 0);
      totalHorasMeta += materia.horas;
      let tempoMateria = (materia.hFeitas || 0) + ((materia.mFeitos || 0) / 60);
      totalHorasFeitas += tempoMateria;

      let pQ = (materia.questoes > 0) ? (qFeitasMateria / materia.questoes) * 50 : 50; 
      let pH = (materia.horas > 0) ? (tempoMateria / materia.horas) * 50 : 50;
      porcentagemDia += (Math.min(pQ, 50) + Math.min(pH, 50));
      
      if (qFeitasMateria >= materia.questoes && tempoMateria >= materia.horas) { materiasConcluidas++; }

      if (!rendimentosPorMateria[materia.nome]) rendimentosPorMateria[materia.nome] = { certas: 0, total: 0 };
      rendimentosPorMateria[materia.nome].certas += (materia.certas || 0);
      rendimentosPorMateria[materia.nome].total += qFeitasMateria;
    });
    
    let mediaDia = dia.materias.length > 0 ? (porcentagemDia / dia.materias.length) : 100;
    if (dia.materias.length > 0 && materiasConcluidas === dia.materias.length) mediaDia = 100;
    totalPorcentagemGeral += mediaDia;
  });

  let progressoSemanal = Math.round(totalPorcentagemGeral / dias.length);
  let taxaAcertoGeral = totalQuestoesFeitas > 0 ? Math.round((totalCertasGeral / totalQuestoesFeitas) * 100) : 0;
  let classeGeral = obterClasseRendimento(taxaAcertoGeral);
  let diasSeguidos = calcularDiasSeguidos();

  let htmlAtencao = "", htmlDominadas = "";
  for (let mat in rendimentosPorMateria) {
    let mDados = rendimentosPorMateria[mat];
    if (mDados.total > 0) {
      let taxaMat = Math.round((mDados.certas / mDados.total) * 100);
      if (taxaMat < 70) htmlAtencao += `<li>⚠️ <strong>${mat}</strong> <span>${taxaMat}% acertos</span></li>`;
      else if (taxaMat >= 80) htmlDominadas += `<li>⭐ <strong>${mat}</strong> <span>${taxaMat}% acertos</span></li>`;
    }
  }

  const conteudo = document.getElementById("conteudoDia");
  if (conteudo) {
    conteudo.innerHTML = `
      <div class="home-welcome">
        <div>
          <h1>MetaFlow</h1>
          <p>Seu painel de performance de estudos</p>
        </div>
        <div class="home-streak-badge">
          <span class="streak-fire-emoji">🔥</span>
          <div class="streak-text-wrapper">
            <span class="streak-num">${diasSeguidos}</span>
            <span class="streak-lbl">${diasSeguidos === 1 ? 'dia' : 'dias'}</span>
          </div>
        </div>
      </div>

      <div class="card premium-card">
        <div class="premium-card-header">
          <h3>📈 Progresso Semanal</h3>
          <span class="premium-percentage-badge">${progressoSemanal}%</span>
        </div>
        <p class="premium-card-subtitle">Média de cumprimento de metas diárias</p>
        <div class="progress-container-home">
          <div class="progress-bar-home" style="width: ${progressoSemanal}%"></div>
        </div>
      </div>

      <div class="home-stats-grid">
        <div class="stat-mini-card">
          <span class="stat-icon-lbl">📝</span>
          <h4>Questões Resolvidas</h4>
          <p>${totalQuestoesFeitas} <small>/ ${totalQuestoesMeta}</small></p>
        </div>
        <div class="stat-mini-card">
          <span class="stat-icon-lbl">⚡</span>
          <h4>Tempo de Foco</h4>
          <p>${totalHorasFeitas.toFixed(1)}h <small>/ ${totalHorasMeta}h</small></p>
        </div>
      </div>

      <div class="card">
        <div class="chart-card-header">
          <div>
            <h3>🎯 Precisão Geral</h3>
            <p class="premium-card-subtitle">Evolução do rendimento bruto</p>
          </div>
          <span class="accuracy-badge-large ${classeGeral}">${taxaAcertoGeral}%</span>
        </div>
        
        <div class="grafico-container">
          <canvas id="graficoEvolucaoCanvas"></canvas>
        </div>
      </div>

      <button class="btn-caderno-erros-aba" onclick="abrirAbaCadernoErros()">
        📕 Acessar Caderno de Erros <span>${cadernoErros.length}</span>
      </button>

      <div class="alerta-container-premium">
        <div class="alerta-box-premium ruim">
          <h5>⚠️ Atenção Crítica (&lt;70%)</h5>
          <ul>${htmlAtencao || '<li class="vazio">Nenhuma matéria nessa zona. Bom trabalho!</li>'}</ul>
        </div>
        <div class="alerta-box-premium excelente">
          <h5>⭐ Disciplinas Dominadas (&gt;=80%)</h5>
          <ul>${htmlDominadas || '<li class="vazio">Gabarite mais questões para ranquear aqui.</li>'}</ul>
        </div>
      </div>
    `;
  }
}

// ==========================================
// 6. RENDERIZAR NOVO CRONOGRAMA DO DIA
// ==========================================
function renderizarDia() {
  const topoNav = document.getElementById("topoNavegacao");
  if (topoNav) topoNav.style.display = "flex";
  
  const dia = dias[diaAtual];
  document.getElementById("tituloDia").innerHTML = dia.nome;

  let htmlMaterias = "";
  dia.materias.forEach((materia, index) => {
    let totalFeitas = (materia.certas || 0) + (materia.erradas || 0);
    let rendimentoMateria = totalFeitas > 0 ? Math.round((materia.certas / totalFeitas) * 100) : 0;

    let textoBotaoPomo = (pomoIntervalo && pomoMateriaAlvoIndex === index) ? "⏹️ Parar e Salvar Tempo" : "⏱️ Iniciar Foco Ativo";
    let classeBotaoPomo = (pomoIntervalo && pomoMateriaAlvoIndex === index) ? "btn-pomo rodando" : "btn-pomo";

    htmlMaterias += `
      <div class="task-card" id="task-card-${index}">
        <div class="task-header">
          <h3>${materia.nome}</h3>
          <p>🎯 Meta do dia: <strong>${materia.questoes}q</strong> / <strong>${materia.horas}h</strong></p>
        </div>
        
        <div class="rendimento-tag ${obterClasseRendimento(rendimentoMateria)}">
          📊 Precisão Atual: ${rendimentoMateria}%
        </div>
        
        <div class="pomo-control-zone">
          <div class="config-cronometro">
            <select id="modoPomo-${index}" class="select-pomo-mode" onchange="modoCronometroAtivo = this.value">
              <option value="progressivo" ${modoCronometroAtivo === 'progressivo'?'selected':''}>Livre (Progressivo)</option>
              <option value="regressivo" ${modoCronometroAtivo === 'regressivo'?'selected':''}>Foco (Regressivo)</option>
            </select>
            <input type="number" id="tempoMinutos-${index}" class="input-pomo-minutos" placeholder="Min" value="25">
          </div>
          <button class="${classeBotaoPomo}" onclick="alternarCronometroMateria(${index})">${textoBotaoPomo}</button>
          <button class="btn-erro-trigger" onclick="adicionarErroDireto('${materia.nome}', '${materia.tema}')">📕 Adicionar Erro no Caderno</button>
        </div>

        <div class="row-tempo">
          <div class="col-tempo"><label>Acertos</label><input type="number" id="c${index}" placeholder="0" value="${materia.certas || ''}" oninput="salvarDados(${index})"></div>
          <div class="col-tempo"><label>Erros</label><input type="number" id="e${index}" placeholder="0" value="${materia.erradas || ''}" oninput="salvarDados(${index})"></div>
        </div>
        <div class="row-tempo">
          <div class="col-tempo"><label>Horas</label><input type="number" id="h${index}" placeholder="0" value="${materia.hFeitas || ''}" oninput="salvarDados(${index})"></div>
          <div class="col-tempo"><label>Minutos</label><input type="number" id="m${index}" placeholder="0" value="${materia.mFeitos || ''}" oninput="salvarDados(${index})"></div>
        </div>
      </div>
    `;
  });

  document.getElementById("conteudoDia").innerHTML = `
    <div class="cronograma-container">
      ${htmlMaterias}
      
      <div class="dia-footer-card">
        <div class="progress"><div class="progress-bar" id="barra"></div></div>
        <div class="status" id="status">0% concluído</div>
      </div>
    </div>
  `;
  calcularTotal();
}

function alternarCronometroMateria(index) {
  if (pomoIntervalo) {
    if (pomoMateriaAlvoIndex === index) {
      clearInterval(pomoIntervalo);
      pomoIntervalo = null;
      document.getElementById("pomodoro-global").style.display = "none";
      
      let minutosEstudados = 0;
      if (modoCronometroAtivo === "regressivo") {
        let tempoGastoSegundos = tempoRegressivoTotalSegundos - pomoTempoDecorrido;
        minutosEstudados = Math.round(tempoGastoSegundos / 60);
      } else {
        minutosEstudados = Math.round(pomoTempoDecorrido / 60);
        if (pomoTempoDecorrido > 5 && minutosEstudados === 0) minutosEstudados = 1;
      }

      if (minutosEstudados > 0) {
        let mAtuais = Number(dias[diaAtual].materias[index].mFeitos) || 0;
        let hAtuais = Number(dias[diaAtual].materias[index].hFeitas) || 0;
        let totalMinutos = mAtuais + minutosEstudados;
        
        if (totalMinutos >= 60) {
          dias[diaAtual].materias[index].hFeitas = hAtuais + Math.floor(totalMinutos / 60);
          dias[diaAtual].materias[index].mFeitos = totalMinutos % 60;
        } else {
          dias[diaAtual].materias[index].mFeitos = totalMinutos;
        }
        alert(`Foco encerrado! Mais ${minutosEstudados} minutos computados.`);
        localStorage.setItem("metaflow_dados", JSON.stringify(dias));
      }
      pomoMateriaAlvoIndex = null;
      renderizarDia();
    } else { alert("Existe uma missão de foco ativa em andamento!"); }
  } else {
    modoCronometroAtivo = document.getElementById(`modoPomo-${index}`).value;
    pomoMateriaAlvoIndex = index;
    
    if (modoCronometroAtivo === "regressivo") {
      let minsInput = Number(document.getElementById(`tempoMinutos-${index}`).value) || 25;
      pomoTempoDecorrido = minsInput * 60;
      tempoRegressivoTotalSegundos = minsInput * 60;
    } else {
      pomoTempoDecorrido = 0;
    }

    document.getElementById("pomodoro-global").style.display = "flex";
    document.getElementById("pomo-label").innerText = modoCronometroAtivo === "regressivo" ? "Bloqueio Regressivo" : "Cronômetro Livre";
    
    pomoIntervalo = setInterval(() => {
      if (modoCronometroAtivo === "regressivo") {
        pomoTempoDecorrido--;
        if (pomoTempoDecorrido <= 0) {
          clearInterval(pomoIntervalo);
          pomoIntervalo = null;
          document.getElementById("pomodoro-global").style.display = "none";
          navigator.vibrate?.([500, 300, 500]); 
          alert("Alvo Destruído! Tempo esgotado.");
          alternarCronometroMateria(index); 
          return;
        }
      } else { pomoTempoDecorrido++; }
      atualizarDisplayCronometro();
    }, 1000);
    renderizarDia();
  }
}

function atualizarDisplayCronometro() {
  let m = Math.floor(pomoTempoDecorrido / 60);
  let s = pomoTempoDecorrido % 60;
  document.getElementById("pomo-timer").innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function abrirAbaCadernoErros() {
  visualizandoCadernoErros = true;
  renderizarTela();
}

function adicionarErroDireto(materia, tema) {
  let descricao = prompt(`O que você errou em ${materia}? Escreva o bizu maceteado de revisão:`);
  if (!descricao) return;
  cadernoErros.push({ id: Date.now(), materia, tema, descricao, data: new Date().toLocaleDateString('pt-BR') });
  localStorage.setItem("metaflow_caderno_erros", JSON.stringify(cadernoErros));
  alert("Registrado no seu Caderno de Erros!");
  renderizarTela();
}

function deletarErro(id) {
  cadernoErros = cadernoErros.filter(e => e.id !== id);
  localStorage.setItem("metaflow_caderno_erros", JSON.stringify(cadernoErros));
  renderizarTela();
}

function renderizarCadernoErrosTela() {
  document.getElementById("topoNavegacao").style.display = "none";
  let htmlErros = "";
  
  cadernoErros.slice().reverse().forEach(e => {
    htmlErros += `
      <div class="erro-card-item">
        <h5>${e.materia}</h5>
        <p>"${e.descricao}"</p>
        <button class="btn-deletar-erro" onclick="deletarErro(${e.id})">❌ Eliminar Erro / Revisado</button>
      </div>
    `;
  });

  document.getElementById("conteudoDia").innerHTML = `
    <div class="card">
      <h3 style="color:var(--cor-alerta); margin-bottom:15px;">📕 Caderno de Erros</h3>
      <p style="font-size:13px; color:var(--texto-secundario); margin-bottom:20px;">Revise seus bizus salvo