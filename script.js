const dadosPadrao = [

{
nome:"Segunda",
materias:[

{
nome:"Português",
tema:"Tipos Textuais",
questoes:50,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
},

{
nome:"História",
tema:"Revoluções",
questoes:50,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
},

{
nome:"Terça",
materias:[

{
nome:"Matemática",
tema:"Sistemas",
questoes:50,
horas:2,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
},

{
nome:"Geografia",
tema:"Tipos de Rochas",
questoes:50,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
},

{
nome:"Quarta",
materias:[

{
nome:"Português",
tema:"Interpretação",
questoes:50,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
},

{
nome:"História",
tema:"História Geral",
questoes:50,
horas:1.5,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
},

{
nome:"Quinta",
materias:[

{
nome:"Matemática",
tema:"Exercícios",
questoes:50,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
},

{
nome:"Geografia",
tema:"Geografia Geral",
questoes:50,
horas:1.5,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
},

{
nome:"Sexta",
materias:[

{
nome:"Redação",
tema:"Repertórios",
questoes:30,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
},

{
nome:"Redação",
tema:"Prática",
questoes:30,
horas:1,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
},

{
nome:"Sábado",
materias:[

{
nome:"Simulado",
tema:"80 questões",
questoes:80,
horas:4,
certas:0,
erradas:0,
hFeitas:0,
mFeitos:0
}

]
}

];

let dias =
JSON.parse(
localStorage.getItem("metaflow_dados")
)
||
dadosPadrao;

let cadernoErros =
JSON.parse(
localStorage.getItem("metaflow_erros")
)
||
[];

let diaAtual = 0;

let naHome = true;

let pomoIntervalo = null;

let pomoTempoDecorrido = 0;

let pomoMateriaAlvoIndex = null;

/* STREAK */

function atualizarStreak(){

let streak = 0;

for(let i=0;i<dias.length;i++){

let dia = dias[i];

let completo = true;

for(let m of dia.materias){

let questoesFeitas =
(m.certas || 0)
+
(m.erradas || 0);

let tempoFeito =
(m.hFeitas || 0)
+
((m.mFeitos || 0)/60);

if(
questoesFeitas < m.questoes
||
tempoFeito < m.horas
){
completo = false;
}

}

if(completo){
streak++;
}

}

document.getElementById(
"streak-text"
).innerText = streak;

}

/* RENDER */

function renderizarTela(){

if(naHome){
renderizarHome();
}else{
renderizarDia();
}

atualizarTracker();

atualizarStreak();

}

/* HOME */

function renderizarHome(){

document.getElementById(
"topoNavegacao"
).style.display = "none";

let labels = [];

let dadosGrafico = [];

let totalQuestoes = 0;

let totalHoras = 0;

let totalAcertos = 0;

let totalRespondidas = 0;

dias.forEach((dia)=>{

let progressoDia = 0;

dia.materias.forEach(m=>{

let q =
(m.certas || 0)
+
(m.erradas || 0);

let h =
(m.hFeitas || 0)
+
((m.mFeitos || 0)/60);

let pQ =
(q / m.questoes) * 50;

let pH =
(h / m.horas) * 50;

progressoDia +=
Math.min(pQ,50)
+
Math.min(pH,50);

totalQuestoes += q;

totalHoras += h;

totalAcertos += (m.certas || 0);

totalRespondidas += q;

});

labels.push(dia.nome);

dadosGrafico.push(
Math.round(
progressoDia / dia.materias.length
)
);

});

let taxaAcerto =
totalRespondidas > 0
?
Math.round(
(totalAcertos / totalRespondidas) * 100
)
:
0;

let streakAtual =
document.getElementById(
"streak-text"
)?.innerText || 0;

document.getElementById(
"conteudoDia"
).innerHTML = `

<div class="card">

<h2
style="
font-size:42px;
margin-bottom:20px;
"
>

Dashboard Semanal

</h2>

<div class="row-tempo">

<div class="col-tempo">

<label>Questões</label>

<input
disabled
value="${totalQuestoes}"
>

</div>

<div class="col-tempo">

<label>Horas</label>

<input
disabled
value="${totalHoras.toFixed(1)}h"
>

</div>

</div>

<div class="row-tempo">

<div class="col-tempo">

<label>Taxa de Acerto</label>

<input
disabled
value="${taxaAcerto}%"
>

</div>

<div class="col-tempo">

<label>Dias consecutivos</label>

<input
disabled
value="🔥 ${streakAtual}"
>

</div>

</div>

<button
class="btn-pomo"
onclick="abrirCadernoErros()"
>

📕 Caderno de erros

</button>

<div class="grafico-container">

<canvas id="grafico"></canvas>

</div>

</div>

`;

const ctx =
document.getElementById("grafico");

if(window.graficoAtual){
window.graficoAtual.destroy();
}

window.graficoAtual =
new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Progresso semanal",

data:dadosGrafico,

borderColor:"#00f0c0",

backgroundColor:
"rgba(0,240,192,.2)",

fill:true,

tension:.3

}]

}

});

}

/* DIA */

function renderizarDia(){

document.getElementById(
"topoNavegacao"
).style.display = "flex";

const dia = dias[diaAtual];

document.getElementById(
"tituloDia"
).innerText = dia.nome;

let html = "";

dia.materias.forEach((m,index)=>{

let totalQuestoes =
(m.certas || 0)
+
(m.erradas || 0);

let tempoTotal =
(m.hFeitas || 0)
+
((m.mFeitos || 0)/60);

let pQ =
(totalQuestoes / m.questoes) * 50;

let pH =
(tempoTotal / m.horas) * 50;

let total =
Math.min(pQ,50)
+
Math.min(pH,50);

html += `

<div class="task">

<h3>${m.nome}</h3>

<p>${m.tema}</p>

<button
class="${
pomoMateriaAlvoIndex === index
?
'btn-pomo rodando'
:
'btn-pomo'
}"
onclick="
alternarCronometroMateria(${index})
"
>

${
pomoMateriaAlvoIndex === index
?
'⏹️ Finalizar'
:
'⏱️ Iniciar'
}

</button>

<button
class="btn-erro"
onclick="adicionarErro(${index})"
>

❌ Anotar erro

</button>

<div class="row-tempo">

<div class="col-tempo">

<label>Certas</label>

<input
type="number"
id="c${index}"
value="${m.certas}"
oninput="salvarDados(${index})"
>

</div>

<div class="col-tempo">

<label>Erradas</label>

<input
type="number"
id="e${index}"
value="${m.erradas}"
oninput="salvarDados(${index})"
>

</div>

</div>

<div class="row-tempo">

<div class="col-tempo">

<label>Horas</label>

<input
type="number"
id="h${index}"
value="${m.hFeitas}"
oninput="salvarDados(${index})"
>

</div>

<div class="col-tempo">

<label>Minutos</label>

<input
type="number"
id="m${index}"
value="${m.mFeitos}"
oninput="salvarDados(${index})"
>

</div>

</div>

<div class="progress">

<div
class="progress-bar"
style="width:${total}%"
>
</div>

</div>

<p class="status">

${Math.round(total)}%

</p>

</div>

`;

});

document.getElementById(
"conteudoDia"
).innerHTML = `

<div class="card">

${html}

</div>

`;

}

/* SALVAR */

function salvarDados(index){

const materia =
dias[diaAtual].materias[index];

materia.certas =
Number(
document.getElementById(`c${index}`).value
);

materia.erradas =
Number(
document.getElementById(`e${index}`).value
);

materia.hFeitas =
Number(
document.getElementById(`h${index}`).value
);

materia.mFeitos =
Number(
document.getElementById(`m${index}`).value
);

localStorage.setItem(
"metaflow_dados",
JSON.stringify(dias)
);

calcularProgresso();

atualizarTracker();

atualizarStreak();

}

/* PROGRESSO */

function calcularProgresso(){

if(naHome) return;

const dia = dias[diaAtual];

dia.materias.forEach((m,index)=>{

let totalQuestoes =
(m.certas || 0)
+
(m.erradas || 0);

let tempoTotal =
(m.hFeitas || 0)
+
((m.mFeitos || 0)/60);

let pQ =
(totalQuestoes / m.questoes) * 50;

let pH =
(tempoTotal / m.horas) * 50;

let total =
Math.min(pQ,50)
+
Math.min(pH,50);

const barra =
document.querySelectorAll(".progress-bar")[index];

const status =
document.querySelectorAll(".status")[index];

if(barra){
barra.style.width = total + "%";
}

if(status){
status.innerText =
Math.round(total) + "%";
}

});

}

/* CRONÔMETRO */

function alternarCronometroMateria(index){

if(
pomoIntervalo &&
pomoMateriaAlvoIndex === index
){

clearInterval(pomoIntervalo);

pomoIntervalo = null;

document.getElementById(
"pomodoro-global"
).style.display = "none";

let minutosEstudados =
Math.max(
1,
Math.floor(
pomoTempoDecorrido / 60
)
);

let materia =
dias[diaAtual].materias[index];

let totalMinutos =
(materia.mFeitos || 0)
+
minutosEstudados;

materia.hFeitas =
(materia.hFeitas || 0)
+
Math.floor(totalMinutos / 60);

materia.mFeitos =
totalMinutos % 60;

localStorage.setItem(
"metaflow_dados",
JSON.stringify(dias)
);

pomoMateriaAlvoIndex = null;

pomoTempoDecorrido = 0;

renderizarTela();

return;

}

if(
pomoIntervalo &&
pomoMateriaAlvoIndex !== index
){
alert("Já existe um cronômetro rodando.");
return;
}

pomoMateriaAlvoIndex = index;

pomoTempoDecorrido = 0;

document.getElementById(
"pomodoro-global"
).style.display = "block";

pomoIntervalo = setInterval(()=>{

pomoTempoDecorrido++;

let minutos =
Math.floor(
pomoTempoDecorrido / 60
);

let segundos =
pomoTempoDecorrido % 60;

document.getElementById(
"pomo-timer"
).innerText =
`${minutos
.toString()
.padStart(2,'0')}
:
${segundos
.toString()
.padStart(2,'0')}`;

},1000);

renderizarTela();

}

/* TRACKER */

function atualizarTracker(){

for(let i=0;i<dias.length;i++){

document
.getElementById(`dot-${i}`)
?.classList.remove("ativo");

}

if(naHome){

document
.getElementById("dot-home")
?.classList.add("ativo");

}else{

document
.getElementById(`dot-${diaAtual}`)
?.classList.add("ativo");

}

for(let i=0;i<dias.length;i++){

let dia = dias[i];

let completo = true;

for(let m of dia.materias){

let q =
(m.certas || 0)
+
(m.erradas || 0);

let h =
(m.hFeitas || 0)
+
((m.mFeitos || 0)/60);

if(
q < m.questoes
||
h < m.horas
){
completo = false;
}

}

if(completo){

document
.getElementById(`dot-${i}`)
?.classList.add("concluido");

}else{

document
.getElementById(`dot-${i}`)
?.classList.remove("concluido");

}

}

}

/* TEMA */

function alternarTema(){

if(
document.body.classList.contains("dark-mode")
){
document.body.className = "light-mode";
}else{
document.body.className = "dark-mode";
}

}

/* NAVEGAÇÃO */

function proximoDia(){

naHome = false;

diaAtual++;

if(diaAtual >= dias.length){
diaAtual = 0;
}

renderizarTela();

}

function voltarDia(){

naHome = false;

diaAtual--;

if(diaAtual < 0){
diaAtual = dias.length - 1;
}

renderizarTela();

}

function irParaHome(){

naHome = true;

renderizarTela();

}

function irParaDia(index){

naHome = false;

diaAtual = index;

renderizarTela();

}

/* CADERNO */

function adicionarErro(index){

let texto =
prompt("Qual erro você cometeu?");

if(!texto) return;

const materia =
dias[diaAtual].materias[index];

cadernoErros.push({

materia:materia.nome,

tema:materia.tema,

erro:texto,

data:new Date().toLocaleDateString()

});

localStorage.setItem(
"metaflow_erros",
JSON.stringify(cadernoErros)
);

alert("Erro salvo!");

}

function abrirCadernoErros(){

naHome = false;

document.getElementById(
"topoNavegacao"
).style.display = "none";

let html = "";

cadernoErros.forEach((erro,index)=>{

html += `

<div class="task">

<h3>${erro.materia}</h3>

<p>${erro.erro}</p>

<small>${erro.data}</small>

<button
class="btn-pomo"
onclick="removerErro(${index})"
>

✔ Revisado

</button>

</div>

`;

});

document.getElementById(
"conteudoDia"
).innerHTML = `

<div class="card">

<h2 style="margin-bottom:20px;">

📕 Caderno de erros

</h2>

${html || "<p>Nenhum erro salvo.</p>"}

</div>

`;

}

function removerErro(index){

cadernoErros.splice(index,1);

localStorage.setItem(
"metaflow_erros",
JSON.stringify(cadernoErros)
);

abrirCadernoErros();

}

/* START */

renderizarTela();