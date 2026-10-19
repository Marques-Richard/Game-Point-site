/* ============================================================
   ALTERNÂNCIA CLARO / ESCURO
   ============================================================ */
const temaBtn = document.getElementById('temaBtn');
const iconeTema = document.querySelector('.tema-icone');

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  try { localStorage.setItem('gp-tema', tema); } catch (e) {}
  if (iconeTema) iconeTema.textContent = tema === 'escuro' ? '☀️' : '🌙';
  if (temaBtn) {
    temaBtn.setAttribute(
      'aria-label',
      tema === 'escuro' ? 'Ativar tema claro' : 'Ativar tema escuro'
    );
  }
}

// Estado inicial do ícone (o atributo data-tema já foi setado no <head>)
const temaInicial = document.documentElement.getAttribute('data-tema') || 'claro';
aplicarTema(temaInicial);

if (temaBtn) {
  temaBtn.addEventListener('click', () => {
    const atual = document.documentElement.getAttribute('data-tema');
    aplicarTema(atual === 'escuro' ? 'claro' : 'escuro');
  });
}

/* ============================================================
   MENU MOBILE
   ============================================================ */
const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');

if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => menu.classList.toggle('aberto'));
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('aberto'))
  );
}

/* ============================================================
   ANO NO RODAPÉ
   ============================================================ */
const anoEl = document.getElementById('ano');
if (anoEl) anoEl.textContent = new Date().getFullYear();

/* ============================================================
   STATUS ABERTO / FECHADO (por loja)
   0 = domingo ... 6 = sábado; null = fechado
   ============================================================ */
const horarios = {
  0: null,
  1: [9, 19],
  2: [9, 19],
  3: [9, 19],
  4: [9, 19],
  5: [9, 19],
  6: [9, 13]
};

function atualizarStatus() {
  const agora = new Date();
  const h = horarios[agora.getDay()];
  const hora = agora.getHours() + agora.getMinutes() / 60;

  document.querySelectorAll('.status-loja').forEach(el => {
    if (h && hora >= h[0] && hora < h[1]) {
      el.textContent = `Aberto agora · fecha às ${h[1]}h`;
      el.style.color = '#1a8f3c';
    } else {
      el.textContent = 'Fechado no momento';
      el.style.color = '#d62828';
    }
  });
}
atualizarStatus();

/* ============================================================
   ANIMAÇÃO DE ENTRADA
   ============================================================ */
const obs = new IntersectionObserver(entradas => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'none';
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card:not(.produto-item)').forEach(c => {
  c.style.opacity = 0;
  c.style.transform = 'translateY(20px)';
  c.style.transition = 'opacity .5s, transform .5s';
  obs.observe(c);
});

/* ============================================================
   BANNER ROTATIVO (SLIDER)
   ============================================================ */
const bannerSlides = document.querySelectorAll('.banner-slide');
const bannerDots = document.querySelectorAll('.banner-dot');
const bannerSetaEsq = document.querySelector('.banner-seta-esq');
const bannerSetaDir = document.querySelector('.banner-seta-dir');
const bannerEl = document.querySelector('.banner');

if (bannerSlides.length) {
  let bannerAtual = 0;
  let bannerTimer = null;
  const BANNER_INTERVALO = 5000;

  const mostrarSlide = (indice) => {
    bannerAtual = (indice + bannerSlides.length) % bannerSlides.length;
    bannerSlides.forEach((slide, i) => {
      slide.classList.toggle('ativo', i === bannerAtual);
    });
    bannerDots.forEach((dot, i) => {
      dot.classList.toggle('ativo', i === bannerAtual);
    });
  };

  const proximoSlide = () => mostrarSlide(bannerAtual + 1);
  const slideAnterior = () => mostrarSlide(bannerAtual - 1);

  const iniciarBanner = () => {
    pararBanner();
    bannerTimer = setInterval(proximoSlide, BANNER_INTERVALO);
  };
  const pararBanner = () => {
    clearInterval(bannerTimer);
    bannerTimer = null;
  };
  const reiniciarBanner = () => {
    pararBanner();
    iniciarBanner();
  };

  if (bannerSetaEsq) bannerSetaEsq.addEventListener('click', () => {
    slideAnterior();
    reiniciarBanner();
  });
  if (bannerSetaDir) bannerSetaDir.addEventListener('click', () => {
    proximoSlide();
    reiniciarBanner();
  });

  bannerDots.forEach(dot => {
    dot.addEventListener('click', () => {
      mostrarSlide(parseInt(dot.dataset.slide, 10));
      reiniciarBanner();
    });
  });

  if (bannerEl) {
    bannerEl.addEventListener('mouseenter', pararBanner);
    bannerEl.addEventListener('mouseleave', iniciarBanner);
    bannerEl.addEventListener('touchstart', pararBanner, { passive: true });
    bannerEl.addEventListener('touchend', () => setTimeout(iniciarBanner, 3000));
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pararBanner();
    else iniciarBanner();
  });

  /* Swipe mobile */
  let touchInicioX = 0;
  let touchFimX = 0;
  if (bannerEl) {
    bannerEl.addEventListener('touchstart', (e) => {
      touchInicioX = e.changedTouches[0].screenX;
    }, { passive: true });

    bannerEl.addEventListener('touchend', (e) => {
      touchFimX = e.changedTouches[0].screenX;
      const diff = touchInicioX - touchFimX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) proximoSlide();
        else slideAnterior();
        reiniciarBanner();
      }
    }, { passive: true });
  }

  mostrarSlide(0);
  iniciarBanner();
}

/* ============================================================
   UTIL — Atualiza estado das setas de um carrossel
   ============================================================ */
function atualizarSetasDoCarrossel(carrossel) {
  if (!carrossel) return;
  const wrap = carrossel.closest('.carrossel-wrap');
  if (!wrap) return;
  const setaEsq = wrap.querySelector('.seta-esq');
  const setaDir = wrap.querySelector('.seta-dir');
  if (!setaEsq || !setaDir) return;

  const scrollMax = carrossel.scrollWidth - carrossel.clientWidth;
  setaEsq.disabled = carrossel.scrollLeft <= 5;
  setaDir.disabled = carrossel.scrollLeft >= scrollMax - 5;
}

/* ============================================================
   FILTROS DE PRODUTOS (MARCAS E PLATAFORMAS)
   ============================================================ */
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement;
    parent.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');

    const filtro = btn.dataset.marca || btn.dataset.plataforma;
    const isMarca = btn.dataset.marca !== undefined;

    const secao = btn.closest('.secao-produtos');
    if (!secao) return;
    const produtos = secao.querySelectorAll('.produto-item');
    const carrossel = secao.querySelector('.grid-produtos');

    produtos.forEach(produto => {
      if (filtro === 'todos') {
        produto.style.display = 'flex';
      } else {
        const atributo = isMarca ? produto.dataset.marca : produto.dataset.plataforma;
        produto.style.display = (atributo === filtro) ? 'flex' : 'none';
      }
    });

    if (carrossel) {
      carrossel.scrollTo({ left: 0, behavior: 'smooth' });
    }
    atualizarSetasDoCarrossel(carrossel);
  });
});

/* ============================================================
   BUSCA DE PRODUTOS (respeita filtros ativos)
   ============================================================ */
const inputBusca = document.getElementById('busca');

if (inputBusca) {
  inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    const todosProdutos = document.querySelectorAll('.produto-item');

    todosProdutos.forEach(produto => {
      const nome = (produto.dataset.nome || '').toLowerCase();
      const combinaBusca = termo === '' || nome.includes(termo);

      // Verifica se há filtro ativo na seção do produto
      const secao = produto.closest('.secao-produtos');
      const filtroAtivo = secao
        ? secao.querySelector('.filtro-btn.ativo')
        : null;

      let combinaFiltro = true;
      if (filtroAtivo && termo !== '') {
        if (filtroAtivo.dataset.marca && filtroAtivo.dataset.marca !== 'todos') {
          combinaFiltro = produto.dataset.marca === filtroAtivo.dataset.marca;
        } else if (filtroAtivo.dataset.plataforma && filtroAtivo.dataset.plataforma !== 'todos') {
          combinaFiltro = produto.dataset.plataforma === filtroAtivo.dataset.plataforma;
        }
      }

      produto.style.display = (combinaBusca && combinaFiltro) ? 'flex' : 'none';
    });

    document.querySelectorAll('.grid-produtos').forEach(c => {
      c.scrollTo({ left: 0, behavior: 'smooth' });
      atualizarSetasDoCarrossel(c);
    });
  });
}

/* ============================================================
   CARROSSÉIS ROTATIVOS — setas + autoplay + pausa inteligente
   ============================================================ */
document.querySelectorAll('.carrossel-wrap').forEach(wrap => {
  const carrossel = wrap.querySelector('.grid-produtos');
  const setaEsq = wrap.querySelector('.seta-esq');
  const setaDir = wrap.querySelector('.seta-dir');
  if (!carrossel || !setaEsq || !setaDir) return;

  const passo = () => {
    const card = carrossel.querySelector('.produto-item:not([style*="display: none"])');
    if (!card) return 260;
    const gap = parseFloat(getComputedStyle(carrossel).gap) || 20;
    return card.offsetWidth + gap;
  };

  setaEsq.addEventListener('click', () => {
    carrossel.scrollBy({ left: -passo(), behavior: 'smooth' });
    reiniciarAutoplay();
  });
  setaDir.addEventListener('click', () => {
    carrossel.scrollBy({ left: passo(), behavior: 'smooth' });
    reiniciarAutoplay();
  });

  carrossel.addEventListener('scroll', () => atualizarSetasDoCarrossel(carrossel));
  window.addEventListener('resize', () => atualizarSetasDoCarrossel(carrossel));
  atualizarSetasDoCarrossel(carrossel);

  const INTERVALO = 4000;
  let timer = null;

  const avancar = () => {
    const scrollMax = carrossel.scrollWidth - carrossel.clientWidth;
    const p = passo();

    if (carrossel.scrollLeft >= scrollMax - 5) {
      carrossel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carrossel.scrollBy({ left: p, behavior: 'smooth' });
    }
  };

  const iniciarAutoplay = () => {
    if (timer) return;
    timer = setInterval(avancar, INTERVALO);
  };
  const pararAutoplay = () => {
    clearInterval(timer);
    timer = null;
  };
  const reiniciarAutoplay = () => {
    pararAutoplay();
    iniciarAutoplay();
  };

  const obsCarrossel = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
      if (e.isIntersecting) iniciarAutoplay();
      else pararAutoplay();
    });
  }, { threshold: 0.3 });
  obsCarrossel.observe(wrap);

  carrossel.addEventListener('mouseenter', pararAutoplay);
  carrossel.addEventListener('mouseleave', iniciarAutoplay);
  carrossel.addEventListener('touchstart', pararAutoplay, { passive: true });
  carrossel.addEventListener('touchend', () => {
    setTimeout(iniciarAutoplay, 3000);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pararAutoplay();
    else iniciarAutoplay();
  });
});

/* ============================================================
   HEADER INTELIGENTE — suave, sem flicker
   ============================================================ */
const header = document.querySelector('.topo');

if (header) {
  let ultimoScroll = window.scrollY;
  let ticking = false;

  const LIMITE_TOPO = 120;     // 🔑 Só age depois de rolar 120px
  const LIMITE_DIF  = 15;      // 🔑 Ignora variações pequenas (menos "nervoso")
  const ZONA_ESTAVEL = 300;    // 🔑 Perto do topo, nunca esconde

  const aoRolar = () => {
    const atual = window.scrollY;

    // Zona estável: perto do topo o header sempre aparece
    if (atual <= ZONA_ESTAVEL) {
      header.classList.remove('escondido');
      if (atual <= LIMITE_TOPO) header.classList.remove('reduzido');
      ultimoScroll = atual;
      ticking = false;
      return;
    }

    const diff = atual - ultimoScroll;

    // Rolando para BAIXO (com histerese) → esconde
    if (diff > LIMITE_DIF) {
      header.classList.add('escondido');
    }
    // Rolando para CIMA (com histerese) → mostra
    else if (diff < -LIMITE_DIF) {
      header.classList.remove('escondido');
      header.classList.add('reduzido');
    }

    ultimoScroll = atual;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(aoRolar);
      ticking = true;
    }
  }, { passive: true });

  // Se já carregar rolada, aplica sombra
  if (window.scrollY > LIMITE_TOPO) {
    header.classList.add('reduzido');
  }
}