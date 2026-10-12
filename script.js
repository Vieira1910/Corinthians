/* ==========================================================
   Corinthians — script.js
   ----------------------------------------------------------
   Sumário
    1) Utilidades
    2) Dados editáveis (textos, fotos, momentos...)
    3) Renderização: monta o HTML a partir dos dados
    4) Abertura (escudo + contagem 1900 → 1910)
    5) Revelar elementos e contadores
    6) Menu mobile
    7) Scroll: túnel, manifesto, timeline, letreiro, menu
    8) Túnel: vídeo em tela cheia
    9) Ídolos: painéis e cursor
   10) Arena: comparador externa / interna
   11) Banner principal: vídeo da torcida
   12) Mosaico da Fiel (palavras e imagens, com botão para trocar)
   13) Dados dos mosaicos de imagem (gerados a partir das suas imagens)
   ========================================================== */


/* 1) UTILIDADES ----------------------------------------------
   Atalhos para não repetir código longo. */

// $('.classe') → primeiro elemento que combina com o seletor
const $ = (sel, root = document) => root.querySelector(sel);

// $$('.classe') → todos os elementos, já como array (aceita forEach, map...)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Limita um número entre min e max (padrão 0 a 1)
const clamp = (v, min = 0, max = 1) => Math.min(Math.max(v, min), max);

// Curva de suavização: começa rápido e termina devagar (t vai de 0 a 1)
const easeOut = t => 1 - Math.pow(1 - t, 3);

// true se o usuário pediu para reduzir animações no sistema
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;


/* 2) DADOS EDITÁVEIS -----------------------------------------
   Para mudar textos, anos, fotos ou jogadores, edite só aqui. */
const DATA = {

  /* Momentos eternos (seção #jogos).
     - Com placar: informe home, away, gh (gols do Corinthians) e ga (gols do adversário).
     - Sem placar: troque gh/ga por  big: "Palavra grande".
     - note: observação em destaque (pênaltis, autor do gol, frase...). */
  moments: [
    {
      year: "1976",
      title: "A Invasão",
      comp: "Brasileirão · Semifinal",
      place: "Maracanã · Rio de Janeiro",
      home: "Corinthians", away: "Fluminense", gh: 1, ga: 1,
      note: "Fluminense vence nos pênaltis",
      text: "Dezenas de milhares de corintianos tomam o Maracanã. O Timão não passa, mas nasce ali a imagem da Fiel que segue o time para qualquer lugar."
    },
    {
      year: "1977",
      title: "O fim do jejum",
      comp: "Final do Campeonato Paulista",
      place: "Morumbi · São Paulo",
      home: "Corinthians", away: "Ponte Preta", gh: 1, ga: 0,
      note: "Gol de Basílio",
      text: "Depois de 22 anos de espera, o grito engasgado da Fiel finalmente sai. O título paulista devolve ao povo a alegria de ser campeão."
    },
    {
      year: "1982",
      title: "Democracia Corinthiana",
      comp: "Um movimento dentro do clube",
      place: "Parque São Jorge · São Paulo",
      big: "Democracia",
      note: "“Ganhar ou perder, mas sempre com democracia”",
      text: "Jogadores e diretoria passam a decidir juntos, em votação. Sócrates, Casagrande e Wladimir fazem do Corinthians um símbolo de liberdade dentro e fora de campo."
    },
    {
      year: "2000",
      title: "Campeão do mundo",
      comp: "Final do Mundial de Clubes da FIFA",
      place: "Maracanã · Rio de Janeiro",
      home: "Corinthians", away: "Vasco", gh: 0, ga: 0,
      note: "Corinthians vence nos pênaltis por 4 a 3",
      text: "O primeiro Mundial de Clubes organizado pela FIFA termina com a taça no Parque São Jorge."
    },
    {
      year: "2012",
      title: "A América é nossa",
      comp: "Final da Libertadores · Jogo de volta",
      place: "Pacaembu · São Paulo",
      home: "Corinthians", away: "Boca Juniors", gh: 2, ga: 0,
      note: "Dois gols de Emerson Sheik",
      text: "A taça que faltava chega em campanha invicta. O Pacaembu inteiro canta a Libertadores pela primeira vez."
    },
    {
      year: "2012",
      title: "O mundo de novo",
      comp: "Final do Mundial de Clubes da FIFA",
      place: "Yokohama · Japão",
      home: "Corinthians", away: "Chelsea", gh: 1, ga: 0,
      note: "Gol de Guerrero",
      text: "Cássio segura o jogo, Guerrero decide, e a Fiel que atravessou o planeta vê o Timão bicampeão do mundo."
    }
  ],

  /* Mosaicos da Fiel (seção #fiel). O botão "Trocar mosaico" percorre esta lista, na ordem.
     - type "text":  escreve as palavras de "lines" (uma linha por item, em MAIÚSCULAS).
     - type "image": usa uma imagem já convertida em MOSAIC_IMAGES, no fim deste arquivo (campo "key").
     - label: nome que aparece embaixo do mosaico. */
  mosaics: [
    { label: "FIEL", type: "text", lines: ["FIEL"] },
    { label: "Tu és orgulho", type: "text", lines: ["TU ÉS", "ORGULHO"] },
    { label: "SCCP", type: "text", lines: ["SCCP"] },
    { label: "Bi campeão mundial", type: "text", lines: ["BI CAMPEÃO", "MUNDIAL"] },
    { label: "Poderoso Timão", type: "text", lines: ["PODEROSO", "TIMÃO"] },
    { label: "Copa do Brasil", type: "image", key: "mosaico1" },
    { label: "Libertadores", type: "image", key: "mosaico2" },
    { label: "Gaviões da Fiel", type: "image", key: "mosaico3" }
  ],

  /* Recordistas: quem mais vestiu a camisa do Corinthians (seção #elenco).
     Cada linha: [jogos, nome, etiqueta (posição/época), texto]. Mantenha em ordem decrescente de jogos. */
  squad: [
    [
      "806", "Wladimir", "Lateral-esquerdo",
      "O ex-lateral-esquerdo atuou pelo Timão entre as décadas de 1970 e 1980. É o líder absoluto e histórico em partidas pelo clube."
    ],
    [
      "712", "Cássio", "Goleiro · 2012–2024",
      "O lendário goleiro marcou época no clube entre 2012 e 2024, conquistando inúmeros títulos importantes e se tornando o segundo atleta com mais jogos."
    ],
    [
      "608", "Luizinho", "Anos 40, 50 e 60",
      "Conhecido como o \"Pequeno Polegar\", o ídolo das décadas de 1940, 50 e 60 marcou a história do clube com sua enorme habilidade."
    ],
    [
      "602", "Ronaldo Giovanelli", "Goleiro · 1988–1998",
      "O icônico goleiro revelado na base do Alvinegro defendeu a meta corinthiana por uma década, entre 1988 e 1998."
    ]
  ],

  /* Linha do tempo: [ano, título, texto] */
  ev: [
    ["1910", "Fundação", "Cinco operários criam o clube no Bom Retiro, em 1º de setembro."],
    ["1954", "IV Centenário", "Título paulista na festa dos 400 anos de São Paulo."],
    ["1977", "Fim do jejum", "Após 22 anos, a Fiel invade o Morumbi e o Paulista volta ao Parque."],
    ["1982", "Democracia", "Sócrates e companhia: liberdade dentro e fora de campo."],
    ["1990", "1º Brasileiro", "O primeiro título nacional da história."],
    ["2000", "Campeão do mundo", "Primeiro Mundial de Clubes da FIFA, no Maracanã."],
    ["2012", "A América", "Libertadores invicta e novo Mundial, em Yokohama."],
    ["2014", "A Arena", "Itaquera ganha a casa da Fiel."]
  ],

  /* Ídolos: [nome, descrição, camisa, nomes possíveis do arquivo (sem extensão), posição da foto, jogos, gols].
     Jogos e gols são texto, então aceitam faixas ("297–298") e aproximações ("~69"). */
  ids: [
    ["Sócrates", "Doutor, capitão e voz da Democracia Corinthiana.", "8", ["doutor socrates", "doutor_socrates", "socrates"], "50% 32%", "297–298", "172–173"],
    ["Rivellino", "Patada atômica, driblador de classe mundial.", "10", ["Rivelino", "rivelino"], "50% 18%", "474–475", "144"],
    ["Marcelinho Carioca", "O Pé de Anjo, rei das bolas paradas.", "7", ["Marcelinho carioca", "Marcelinho_carioca", "marcelinho"], "50% 22%", "433", "206"],
    ["Ronaldo", "O Fenômeno trouxe estrela global ao Parque.", "9", ["Ronaldo fenomeno", "Ronaldo_fenomeno", "ronaldo"], "55% 38%", "~69", "35"],
    ["Cássio", "O Gigante da Libertadores e do Mundial 2012.", "12", ["Cassio", "cassio"], "55% 52%", "712", "0"]
  ]
};

/* Onde procurar as fotos dos ídolos (nesta ordem) e quais extensões testar.
   A primeira pasta é a oficial do projeto. Se a sua for outra, acrescente aqui. */
const PHOTO_DIRS = ["imagens do time/", "assets/imagens do time/", "assets/", "imagens/", ""];
const PHOTO_EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"];


/* 3) RENDERIZAÇÃO --------------------------------------------
   Cria o HTML das seções que dependem dos dados acima. */

/* 3a) Momentos eternos: abas à esquerda + cartão com placar à direita */
const momentTabs = $('#lgt');   // coluna de abas
const momentCard = $('#lgc');   // cartão do momento selecionado

// Uma aba (botão) por momento: ano grande + título pequeno
momentTabs.innerHTML = DATA.moments.map((m, i) => `
  <button class="lg-tab" role="tab" id="lgt${i}" aria-controls="lgc"
          aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
    <span class="y">${m.year}</span>
    <span class="t">${m.title}</span>
  </button>`).join('');

// Mostra o momento de índice i. "focus" move o foco do teclado para a aba.
function showMoment(i, focus) {
  const m = DATA.moments[i];

  // Marca só a aba atual como selecionada
  $$('.lg-tab', momentTabs).forEach((tab, k) => {
    tab.setAttribute('aria-selected', k === i);
    tab.tabIndex = k === i ? 0 : -1;
    if (k === i && focus) tab.focus();
  });
  momentCard.setAttribute('aria-labelledby', `lgt${i}`);

  // Placar (quando há gols) ou palavra grande (quando é um movimento, sem jogo)
  const score = m.big
    ? `<div class="lg-big">${m.big}</div>`
    : `<div class="lg-score">
         <h3>${m.home}</h3>
         <div class="nums">
           <b class="${m.gh > m.ga ? 'w' : ''}">${m.gh}</b><i>×</i><b class="${m.ga > m.gh ? 'w' : ''}">${m.ga}</b>
         </div>
         <h3 class="r">${m.away}</h3>
       </div>`;

  // Monta o cartão inteiro
  momentCard.innerHTML = `
    <div class="lg-meta"><span class="chip">${m.comp}</span><span>${m.place}</span></div>
    ${score}
    ${m.note ? `<p class="lg-note">${m.note}</p>` : ''}
    <h3 class="lg-head">${m.title}</h3>
    <p class="lg-text">${m.text}</p>`;

  // Reinicia a animação de entrada (remove a classe, força o layout e coloca de novo)
  momentCard.classList.remove('swap');
  void momentCard.offsetWidth;
  momentCard.classList.add('swap');
}

// Clique em uma aba
momentTabs.addEventListener('click', e => {
  const tab = e.target.closest('.lg-tab');
  if (tab) showMoment(+tab.dataset.i);
});

// Setas do teclado percorrem as abas (acessibilidade)
momentTabs.addEventListener('keydown', e => {
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const current = $$('.lg-tab', momentTabs).findIndex(t => t.getAttribute('aria-selected') === 'true');
  showMoment((current + step + DATA.moments.length) % DATA.moments.length, true);
});

showMoment(0);   // começa no primeiro momento

/* 3b) Recordistas de jogos pelo Corinthians: uma linha por jogador.
   O número grande é a quantidade de jogos; a posição na lista vira "1º, 2º...". */
$('#sq').innerHTML = DATA.squad.map((p, i) => `
  <div class="pl" tabindex="0">
    <span class="n">${p[0]}<small>jogos</small></span>
    <div>
      <small class="rk">${i + 1}º mais jogos</small>
      <h3>${p[1]}</h3>
      <p>${p[3]}</p>
    </div>
    <span class="ps">${p[2]}</span>
  </div>`).join('');

/* 3c) Linha do tempo: um cartão por acontecimento, inserido depois do texto inicial */
$('#tr').insertAdjacentHTML('beforeend', DATA.ev.map(e => `
  <div class="ev">
    <div class="yr">${e[0]}</div>
    <h3>${e[1]}</h3>
    <p>${e[2]}</p>
  </div>`).join(''));

/* 3d) Ídolos: monta os painéis e depois carrega as fotos */

// Gera todos os caminhos possíveis da foto (pasta × nome × extensão)
function photoCandidates(names) {
  const list = [];
  names.forEach(name => {
    PHOTO_DIRS.forEach(dir => {
      PHOTO_EXTS.forEach(ext => list.push(encodeURI(`${dir}${name}.${ext}`)));
    });
  });
  return list;
}

// Tenta um caminho por vez. Se nenhum existir, mostra o número da camisa
// e escreve no console (F12) quais caminhos foram testados.
function loadPhoto(img, candidates, card, name) {
  let n = 0;
  const tryNext = () => {
    if (n >= candidates.length) {
      img.remove();
      card.classList.add('sem-foto');
      console.warn(`Foto de "${name}" não encontrada. Caminhos testados:`, candidates);
      return;
    }
    img.src = candidates[n++];
  };
  img.addEventListener('error', tryNext);   // se der erro, tenta o próximo
  tryNext();
}

// Cria os painéis (a <img> começa sem src; o JavaScript define em seguida).
// Camisa = d[2], Jogos = d[5], Gols = d[6] (valores vêm de DATA.ids).
$('#id').innerHTML = DATA.ids.map(d => `
  <div class="id" tabindex="0" role="button" aria-label="${d[0]}" data-num="${d[2]}">
    <img alt="${d[0]}" style="object-position:${d[4]}">
    <div>
      <h3>${d[0]}</h3>
      <div class="d">
        ${d[1]}
        <div class="st">
          <div><b>${d[2]}</b><small>Camisa</small></div>
          <div><b>${d[5]}</b><small>Jogos</small></div>
          <div><b>${d[6]}</b><small>Gols</small></div>
        </div>
      </div>
    </div>
  </div>`).join('');

// Carrega a foto de cada painel
$$('#id .id').forEach((card, i) => {
  loadPhoto($('img', card), photoCandidates(DATA.ids[i][3]), card, DATA.ids[i][0]);
});

/* 3e) Manifesto: cada palavra vira um <span> para acender com o scroll */
$('#mf').innerHTML = $('#mf').textContent
  .split(' ')
  .map(word => `<span>${word}</span>`)
  .join(' ');

/* 3f) Letreiro da seção Títulos (repetido 4x para nunca "acabar") */
const marqueeText = 'Libertadores 2012<span>✦</span>Mundial 2000<span>✦</span>Mundial 2012<span>✦</span>Brasileirão<span>✦</span>Copa do Brasil<span>✦</span>';
$('#mqi').innerHTML = marqueeText.repeat(4);


/* 4) ABERTURA ------------------------------------------------
   Conta de 1900 até 1910 e depois levanta a cortina. */
{
  let year = 1900;
  const counter = $('#pc');

  const timer = setInterval(() => {
    year += reduceMotion ? 10 : 1;      // quem reduz animações vê mais rápido
    counter.textContent = year;

    if (year >= 1910) {
      clearInterval(timer);
      setTimeout(() => {
        $('#pre').classList.add('go');          // cortina sobe
        document.body.classList.add('ld');      // libera animações do site
        $('.hero').classList.add('ld');         // título do hero sobe
      }, 350);
    }
  }, 90);
}


/* 5) REVELAR ELEMENTOS E CONTADORES --------------------------- */

// Elementos com classe .rv aparecem (ganham .in) quando entram na tela
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);   // só anima uma vez
    }
  });
}, { threshold: .12 });

$$('.rv').forEach(el => revealObserver.observe(el));

// Números com data-n contam de 0 até o valor quando ficam visíveis
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const goal = +el.dataset.n;     // valor final (atributo data-n)
    let start = null;

    counterObserver.unobserve(el);

    // Atualiza a cada quadro por 1,3 segundo
    const step = time => {
      start = start || time;
      const p = Math.min((time - start) / 1300, 1);
      el.textContent = Math.round(goal * easeOut(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: .6 });

$$('[data-n]').forEach(el => counterObserver.observe(el));


/* 6) MENU MOBILE --------------------------------------------- */
const burger = $('#bg');

// Abre/fecha o menu (classe .mo no body) e atualiza os textos de acessibilidade
burger.onclick = () => {
  const open = document.body.classList.toggle('mo');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};

// Clicar em um link fecha o menu
$$('nav a').forEach(link => {
  link.onclick = () => document.body.classList.remove('mo');
});


/* 7) SCROLL --------------------------------------------------
   Uma única função (onScroll) cuida de todos os efeitos ligados à rolagem. */

// Menu: links e as seções que eles apontam
const navLinks = $$('nav a');
const navSections = navLinks.map(a => $(a.getAttribute('href')));

// Túnel
const tunnel = $('#tunel');          // seção alta (340vh)
const tunnelFrame = $('#fr');        // recorte que contém o vídeo
const tunnelVideo = $('#tv');        // vídeo do campo
const tunnelSlit = $('#sl');         // fresta de luz
const tunnelCaption = $('#tcap');    // dica "role para abrir"
const tunnelControls = $('#fcp');    // botões de som e tela cheia
const wordLeft = $('#twl');          // "Do túnel"
const wordRight = $('#twr');         // "ao campo"

// Manifesto
const manifesto = $('#mf');
const manifestoWords = $$('#mf span');

// Linha do tempo
const history = $('#historia');
const track = $('#tr');
const trackBar = $('#tbi');
const events = $$('.ev');

// Letreiro dos títulos
const marquee = $('#mqi');

let scrollTick = false;   // evita rodar mais de uma vez por quadro

function onScroll() {
  const y = scrollY;
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  let rect, p;   // rect = posição da seção, p = progresso de 0 a 1

  // Cabeçalho muda de aparência e barra de progresso cresce
  $('#hd').classList.toggle('sc', y > 40);
  $('#prog').style.width = (y / maxScroll * 100) + '%';

  // TÚNEL: nos primeiros 35% do scroll a fresta abre até a tela cheia
  rect = tunnel.getBoundingClientRect();
  p = clamp(-rect.top / (rect.height - innerHeight));
  const open = easeOut(clamp(p / .35));              // 0 = fechado, 1 = aberto
  const cut = (1 - open) * 49.6;                     // % recortado em cima e embaixo
  tunnelFrame.style.clipPath = `inset(${cut}% 0 ${cut}% 0)`;
  tunnelFrame.style.transform = `scale(${1.1 - .1 * open})`;   // leve zoom-out
  tunnelSlit.style.opacity = clamp(1 - open * 2.2);            // fresta some
  tunnelCaption.style.opacity = clamp(1 - open * 3);           // dica some
  tunnelControls.style.opacity = open;                         // botões aparecem
  tunnelControls.style.pointerEvents = open > .5 ? 'auto' : 'none';

  // Palavras entram pelas laterais e somem perto do fim para limpar a imagem
  const words = open * (1 - clamp((p - .55) / .25));
  wordLeft.style.opacity = wordRight.style.opacity = words;
  wordLeft.style.setProperty('--tx', `${(1 - open) * -40}vw`);
  wordRight.style.setProperty('--tx', `${(1 - open) * 40}vw`);

  // MANIFESTO: as palavras acendem em sequência conforme o scroll
  rect = manifesto.getBoundingClientRect();
  p = clamp((innerHeight * .85 - rect.top) / (innerHeight * .6 + rect.height));
  manifestoWords.forEach((word, i) => {
    word.classList.toggle('on', i / manifestoWords.length < p * 1.1);
  });

  // LINHA DO TEMPO: o scroll vertical vira movimento horizontal
  rect = history.getBoundingClientRect();
  p = clamp(-rect.top / (rect.height - innerHeight));
  track.style.transform = `translate3d(${-p * (track.scrollWidth - innerWidth)}px, 0, 0)`;
  trackBar.style.width = (p * 100) + '%';
  // O cartão que está no centro da tela fica "ativo" (classe .a)
  events.forEach(ev => {
    const b = ev.getBoundingClientRect();
    ev.classList.toggle('a', b.left < innerWidth * .6 && b.right > innerWidth * .2);
  });

  // LETREIRO: anda para a esquerda conforme o scroll (volta ao início de forma contínua)
  marquee.style.transform = `translate3d(${-(y * .35) % (marquee.scrollWidth / 4)}px, 0, 0)`;

  // MENU: destaca o link da seção que está na tela
  let current = -1;
  navSections.forEach((section, i) => {
    if (section.getBoundingClientRect().top < innerHeight * .45) current = i;
  });
  navLinks.forEach((link, i) => link.classList.toggle('on', i === current));

  scrollTick = false;
}

// Agenda onScroll uma vez por quadro (melhor desempenho)
addEventListener('scroll', () => {
  if (!scrollTick) {
    scrollTick = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });
addEventListener('resize', onScroll);
onScroll();   // estado inicial


/* 8) TÚNEL: VÍDEO EM TELA CHEIA ------------------------------ */
{
  const soundBtn = $('#snd');    // botão de som
  const fullBtn = $('#fsb');     // botão de tela cheia

  // Toca só enquanto a seção está visível (poupa bateria e dados).
  // Quem pediu menos animação vê apenas o primeiro quadro.
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !reduceMotion) tunnelVideo.play().catch(() => {});
    else tunnelVideo.pause();
  }).observe(tunnel);

  // Liga/desliga o som (o vídeo começa mudo porque os navegadores exigem isso)
  soundBtn.onclick = () => {
    tunnelVideo.muted = !tunnelVideo.muted;
    soundBtn.setAttribute('aria-pressed', !tunnelVideo.muted);
    soundBtn.textContent = tunnelVideo.muted ? 'Ativar som' : 'Silenciar';
  };

  // Tela cheia real do navegador (inclui o prefixo webkit para Safari/iPhone)
  fullBtn.onclick = () => {
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      return;
    }
    const enter = tunnelVideo.requestFullscreen
      || tunnelVideo.webkitRequestFullscreen
      || tunnelVideo.webkitEnterFullscreen;
    if (enter) enter.call(tunnelVideo);
  };

  // Atualiza o texto do botão quando entra/sai da tela cheia
  document.addEventListener('fullscreenchange', () => {
    fullBtn.textContent = document.fullscreenElement ? 'Sair da tela cheia' : 'Tela cheia';
  });
}


/* 9) ÍDOLOS: PAINÉIS E CURSOR "VER" -------------------------- */
const cursor = $('#cu');
const cursorState = { x: 0, y: 0, scale: 0 };   // posição e tamanho do cursor

// Aplica a posição/tamanho no elemento
function placeCursor() {
  cursor.style.transform = `translate(${cursorState.x}px, ${cursorState.y}px) scale(${cursorState.scale})`;
}

$$('.id').forEach(card => {
  // Mouse entra/sai do painel: mostra/esconde o cursor circular
  card.onmouseenter = () => { cursorState.scale = 1; placeCursor(); };
  card.onmouseleave = () => { cursorState.scale = 0; placeCursor(); };

  // Clique/toque abre o painel (e fecha os outros). Útil no celular.
  card.onclick = () => {
    const wasOpen = card.classList.contains('o');
    $$('.id').forEach(c => c.classList.remove('o'));
    if (!wasOpen) card.classList.add('o');
  };

  // Enter no teclado também abre
  card.onkeydown = e => {
    if (e.key === 'Enter') card.click();
  };
});

// O cursor circular acompanha o mouse
addEventListener('mousemove', e => {
  cursorState.x = e.clientX;
  cursorState.y = e.clientY;
  placeCursor();
}, { passive: true });


/* 10) ARENA: COMPARADOR EXTERNA / INTERNA -------------------- */
// O valor do controle (0–100) define até onde a foto de dentro aparece
$('#rg').oninput = e => {
  $('#b2').style.clipPath = `inset(0 0 0 ${e.target.value}%)`;
  $('#hl').style.left = e.target.value + '%';
};


/* 11) BANNER PRINCIPAL: VÍDEO DA TORCIDA --------------------- */
{
  const banner = $('#bn');
  const video = $('#bv');
  let locked = false;   // true = vídeo "travado" ligado por clique

  // Mostra o vídeo e toca
  const play = () => {
    banner.classList.add('pl');
    video.play().catch(() => {});   // ignora bloqueio de autoplay
  };

  // Esconde o vídeo e pausa
  const stop = () => {
    banner.classList.remove('pl');
    video.pause();
  };

  // Mouse em cima: toca (mudo). Mouse sai: volta ao banner (se não estiver travado).
  banner.addEventListener('mouseenter', play);
  banner.addEventListener('mouseleave', () => { if (!locked) stop(); });

  // Clique/toque: trava o vídeo ligado (com som) ou desliga
  banner.addEventListener('click', () => {
    locked = !locked;
    banner.setAttribute('aria-pressed', locked);
    video.muted = !locked;
    locked ? play() : stop();
  });

  // Enter ou espaço também funcionam (teclado)
  banner.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      banner.click();
    }
  });

  // Pausa quando o banner sai da tela; retoma se voltar e estiver ligado
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) video.pause();
    else if (banner.classList.contains('pl')) video.play().catch(() => {});
  }).observe(banner);
}


/* 12) MOSAICO DA FIEL ---------------------------------------
   Uma grade de quadradinhos (cartões) em canvas forma palavras ou imagens,
   como os mosaicos que a torcida faz nas arquibancadas.
   - O mouse/dedo afasta os cartões e eles voltam sozinhos.
   - O botão "Trocar mosaico" (e os quadradinhos embaixo dele) mudam o desenho.
   A lista de mosaicos está em DATA.mosaics (no início deste arquivo).
   É uma função (initMosaic) chamada no fim do arquivo, depois que os dados
   dos mosaicos de imagem (seção 13) já foram definidos. */
function initMosaic() {
  const canvas = $('#mc');
  const ctx = canvas.getContext('2d');
  const nameEl = $('#mname');   // nome do mosaico atual
  const dotsEl = $('#mdots');   // quadradinhos para escolher o mosaico

  // Só entram na lista os mosaicos de imagem cujos dados existem em MOSAIC_IMAGES (seção 13)
  const mosaics = DATA.mosaics.filter(m =>
    m.type === 'text' || (typeof MOSAIC_IMAGES !== 'undefined' && MOSAIC_IMAGES[m.key]));

  const FONT = 'Anton, Impact, sans-serif';
  const LETTER_GAP = 2;    // espaço mínimo entre as letras, em cartões (igual para todas)
  const SPACE = 0.3;       // largura do espaço entre palavras (fração do tamanho da fonte)
  const LINE_SPACE = 0.28; // espaço entre linhas (fração da altura da letra)

  // Tons de cinza prontos: evita criar milhares de textos a cada quadro (mais rápido)
  const GRAYS = Array.from({ length: 256 }, (_, g) => `rgb(${g}, ${g}, ${g})`);

  let current = 0;          // índice do mosaico atual
  let W, H;                 // largura e altura do canvas (px)
  let cell, cols, rows;     // tamanho do cartão (px) e quantidade de colunas/linhas
  let target, level;        // target = brilho desejado (0 a 1) de cada cartão; level = brilho atual
  let pulse;                // leve pulso de brilho de cada coluna (calculado uma vez por quadro)
  let isImage = false;      // true quando o mosaico atual é uma imagem
  let ready = false;        // true depois que a fonte Anton carregou
  let visible = false;      // só anima quando está na tela
  let time = 0;             // relógio da animação
  let mouse = { x: -999, y: -999 };   // posição do ponteiro (px, dentro do canvas)

  /* ---- Mosaico de TEXTO ----
     Cada letra é desenhada separadamente, com o MESMO espaço entre elas
     (LETTER_GAP cartões), para as letras nunca ficarem grudadas. */
  function textTarget(lines) {
    // Canvas minúsculo: 1 pixel = 1 cartão
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const o = off.getContext('2d');
    o.fillStyle = '#fff';
    o.textBaseline = 'alphabetic';

    // Mede cada letra com a fonte em 100px. "ink" = parte realmente desenhada
    // (sem as sobras laterais da fonte); valores em fração do tamanho da fonte.
    o.font = `100px ${FONT}`;
    const capH = o.measureText('H').actualBoundingBoxAscent / 100;   // altura das maiúsculas
    const glyphs = lines.map(line => [...line].map(ch => {
      if (ch === ' ') return { space: true };
      const t = o.measureText(ch);
      return {
        ch,
        left: t.actualBoundingBoxLeft / 100,
        ink: (t.actualBoundingBoxLeft + t.actualBoundingBoxRight) / 100
      };
    }));

    // Largura de cada linha (em frações da fonte) e total de espaços entre letras (em cartões)
    const units = glyphs.map(g => g.reduce((sum, x) => sum + (x.space ? SPACE : x.ink), 0));
    const gaps = glyphs.map(g => (g.length - 1) * LETTER_GAP);
    const n = lines.length;

    // Tamanho da fonte (em cartões): o menor entre o que cabe na largura e na altura
    const byWidth = Math.min(...units.map((u, i) => (cols * .9 - gaps[i]) / u));
    const byHeight = (rows * .8) / (capH * (n + (n - 1) * LINE_SPACE));
    const fs = Math.min(byWidth, byHeight);
    o.font = `${fs}px ${FONT}`;

    // Posição vertical: bloco de linhas centralizado
    const lineH = capH * fs;
    const totalH = n * lineH + (n - 1) * lineH * LINE_SPACE;
    let baseline = (rows - totalH) / 2 + lineH;

    // Desenha letra por letra, cada linha centralizada
    glyphs.forEach((g, i) => {
      let x = (cols - (units[i] * fs + gaps[i])) / 2;
      g.forEach(item => {
        if (item.space) {
          x += SPACE * fs + LETTER_GAP;
        } else {
          o.fillText(item.ch, x + item.left * fs, baseline);
          x += item.ink * fs + LETTER_GAP;
        }
      });
      baseline += lineH * (1 + LINE_SPACE);
    });

    // Onde o pixel tem tinta (alpha alto) o cartão fica aceso (1); fora, apagado (0)
    const px = o.getImageData(0, 0, cols, rows).data;
    const t = new Float32Array(cols * rows);
    for (let k = 0; k < t.length; k++) t[k] = px[k * 4 + 3] > 110 ? 1 : 0;
    return t;
  }

  /* ---- Mosaico de IMAGEM ----
     Os dados vêm de MOSAIC_IMAGES, seção 13 (grade de brilhos 0–f). Aqui a grade é
     redimensionada (interpolação bilinear) para caber no canvas atual. */
  function sampleImage(img, x, y, smooth) {
    if (x < -.5 || y < -.5 || x > img.cols - .5 || y > img.rows - .5) return 0;

    // Sem suavização (imagem ampliada ou do mesmo tamanho): pega o cartão mais próximo, que fica mais nítido
    if (!smooth) {
      const nx = Math.min(img.cols - 1, Math.max(0, Math.round(x)));
      const ny = Math.min(img.rows - 1, Math.max(0, Math.round(y)));
      return img.pixels[ny * img.cols + nx];
    }

    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const px = (cx, cy) => (cx < 0 || cy < 0 || cx >= img.cols || cy >= img.rows)
      ? 0 : img.pixels[cy * img.cols + cx];
    const top = px(x0, y0) * (1 - fx) + px(x0 + 1, y0) * fx;
    const bottom = px(x0, y0 + 1) * (1 - fx) + px(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  }

  function imageTarget(img) {
    // Converte os caracteres "0"–"f" (hexadecimal) em números de 0 a 1 (só na primeira vez)
    if (!img.pixels) img.pixels = Float32Array.from(img.data, ch => parseInt(ch, 16) / 15);

    // Escala para a imagem caber inteira e centralizada
    const scale = Math.min(cols * .98 / img.cols, rows * .98 / img.rows);
    const offX = (cols - img.cols * scale) / 2;
    const offY = (rows - img.rows * scale) / 2;

    // Só suaviza (interpolação) quando a imagem precisa ser reduzida; assim não perde nitidez
    const smooth = scale < 1;

    const t = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        t[j * cols + i] = sampleImage(img, (i + .5 - offX) / scale - .5, (j + .5 - offY) / scale - .5, smooth);
      }
    }
    return t;
  }

  /* ---- Monta a grade do mosaico atual ---- */
  function layout() {
    const m = mosaics[current];
    const img = m.type === 'image' ? MOSAIC_IMAGES[m.key] : null;

    // Mosaicos de imagem usam um canvas mais alto (classe "tall"), para a figura aparecer maior
    canvas.classList.toggle('tall', !!img);
    isImage = !!img;

    const dpr = Math.min(devicePixelRatio, 2);   // nitidez em telas retina
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Mosaicos de imagem usam cartões pequenos (mais detalhe): cerca de 1 cartão por linha da imagem
    cell = img
      ? clamp(Math.floor(Math.min(H, W * img.rows / img.cols) / (img.rows * .95)), 4, 10)
      : (W < 600 ? 8 : 11);
    cols = Math.floor(W / cell);
    rows = Math.floor(H / cell);

    target = img ? imageTarget(img) : textTarget(m.lines);
    level = new Float32Array(cols * rows);
    pulse = new Float32Array(cols);
  }

  /* ---- Troca o mosaico ---- */
  function setMosaic(i) {
    current = (i + mosaics.length) % mosaics.length;   // volta ao primeiro depois do último
    layout();
    time = 0;                                          // recomeça a onda de entrada

    const label = mosaics[current].label;
    nameEl.textContent = label;
    canvas.setAttribute('aria-label', `Mosaico da torcida: ${label}. Passe o cursor para desmanchar.`);
    $$('.dot', dotsEl).forEach((dot, k) => dot.setAttribute('aria-current', k === current));
  }

  /* ---- Desenha um quadro da animação ---- */
  function draw() {
    requestAnimationFrame(draw);
    if (!visible || !ready) return;

    time += .5;
    ctx.clearRect(0, 0, W, H);

    const mx = mouse.x / cell, my = mouse.y / cell;   // ponteiro em unidades de cartão
    const radius = 72 / cell;                          // alcance do ponteiro: ~72px
    const size = cell - Math.max(1, cell * .16);       // tamanho do cartão (deixa um vão)

    // Pulso de brilho: um seno por coluna (em vez de um por cartão) deixa tudo mais leve
    for (let i = 0; i < cols; i++) pulse[i] = .05 * Math.sin(time * .05 + i);

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const delay = (i + j * .6) * cell * .075;           // onda: acende da esquerda p/ direita
        const on = time > delay ? target[k] : 0;
        const dx = i - mx, dy = j - my;
        const near = dx > -radius && dx < radius && dy > -radius && dy < radius;   // só calcula perto do ponteiro
        const dist = near ? Math.hypot(dx, dy) : radius;
        const push = dist < radius ? 1 - dist / radius : 0; // força de afastamento

        // Brilho desejado: segue o desenho, com leve pulso; o ponteiro apaga
        let goal = on * .95 + (1 - on) * .1 + pulse[i];
        goal *= 1 - push;
        level[k] += (goal - level[k]) * .14;                // aproxima suavemente

        // Aceso = maior. Nas imagens o tamanho varia pouco (quem desenha a figura é o brilho)
        const scale = isImage ? .72 + level[k] * .28 : .35 + level[k] * .65;
        const gray = Math.min(255, (24 + level[k] * 231) | 0);
        const s = size * scale;
        const offX = push * dx * 3;                         // empurrão para longe do ponteiro
        const offY = push * dy * 3;

        ctx.fillStyle = GRAYS[gray];
        ctx.fillRect(i * cell + (cell - s) / 2 + offX, j * cell + (cell - s) / 2 + offY, s, s);
      }
    }
  }

  /* ---- Controles ---- */

  // Quadradinhos: um por mosaico, para escolher direto
  dotsEl.innerHTML = mosaics.map((m, i) => `
    <button class="dot" type="button" data-i="${i}" aria-label="Mosaico: ${m.label}" title="${m.label}"></button>`).join('');
  dotsEl.addEventListener('click', e => {
    const dot = e.target.closest('.dot');
    if (dot) setMosaic(+dot.dataset.i);
  });

  // Botão "Trocar mosaico": próximo da lista
  $('#mnext').onclick = () => setMosaic(current + 1);

  // Botão "Reerguer mosaico": apaga tudo e recomeça a onda do mosaico atual
  $('#rb').onclick = () => {
    time = 0;
    if (level) level.fill(0);
  };

  /* ---- Início ---- */

  // Só começa depois que a fonte Anton carregar (senão as letras sairiam com outra fonte)
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    ready = true;
    setMosaic(0);
    draw();
  });
  addEventListener('resize', () => { if (ready) layout(); });

  // Reinicia a onda toda vez que o mosaico entra na tela
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) time = 0;
  }).observe(canvas);

  // Acompanha o mouse/dedo (em pixels dentro do canvas)
  canvas.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('pointerleave', () => { mouse = { x: -999, y: -999 }; });
}


/* 13) DADOS DOS MOSAICOS DE IMAGEM ---------------------------
   Mosaicos feitos a partir de imagens (Copa do Brasil, Libertadores e Gaviões da Fiel).

   >>> ATENÇÃO: este bloco está VAZIO nesta versão. <<<
   Os três mosaicos de imagem (mosaico1, mosaico2, mosaico3) são tabelas enormes de
   caracteres que só existem no seu script.js original. Enquanto este bloco estiver
   vazio, o site funciona normalmente com os 5 mosaicos de texto (FIEL, TU ÉS ORGULHO,
   SCCP, BI CAMPEÃO MUNDIAL, PODEROSO TIMÃO) e os 3 de imagem simplesmente não aparecem.

   COMO RESTAURAR OS 3 MOSAICOS DE IMAGEM:
   no seu script.js original, copie todo o bloco que começa em "const MOSAIC_IMAGES = {"
   e termina em "};" (logo antes de "initMosaic();") e cole no lugar do bloco abaixo.

   Como funciona (para referência): cada caractere de "data" é o brilho de um cartão,
   de 0 (apagado) até f (aceso), lido linha por linha; cols = colunas, rows = linhas. */
const MOSAIC_IMAGES = {
  // mosaico1: { cols: 121, rows: 150, data: "..." },
  // mosaico2: { cols: 84,  rows: 150, data: "..." },
  // mosaico3: { cols: 150, rows: 150, data: "..." }
};

// Inicia o mosaico. Precisa ficar por último, depois dos dados acima.
initMosaic();