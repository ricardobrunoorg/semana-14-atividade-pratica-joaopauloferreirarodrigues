const API_TREINOS = "/treinos";

function getBadgeNivel(nivel) {
  const cores = {
    "Iniciante": "success",
    "Intermediário": "warning",
    "Avançado": "danger"
  };
  return `<span class="badge bg-${cores[nivel] || 'secondary'}">${nivel}</span>`;
}

async function buscarTreinos() {
  const resposta = await fetch(API_TREINOS);
  if (!resposta.ok) {
    throw new Error("Falha ao buscar os treinos");
  }
  return await resposta.json();
}

async function buscarTreino(id) {
  const resposta = await fetch(`${API_TREINOS}/${id}`);
  if (!resposta.ok) {
    throw new Error("Treino não encontrado");
  }
  return await resposta.json();
}

function montarCarrossel(treinos) {
  const indicators = document.getElementById('carouselIndicators');
  const inner = document.getElementById('carouselInner');
  if (!indicators || !inner) return;

  const destaques = treinos.filter(t => t.destaque);

  destaques.forEach((treino, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-bs-target', '#carouselDestaques');
    btn.setAttribute('data-bs-slide-to', index);
    btn.setAttribute('aria-label', `Slide ${index + 1}`);
    if (index === 0) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    }
    indicators.appendChild(btn);

    const div = document.createElement('div');
    div.className = `carousel-item${index === 0 ? ' active' : ''}`;
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <img src="${treino.imagem}" class="d-block w-100 carousel-img carousel-foto-${treino.id}" alt="${treino.nome}">
      <div class="carousel-caption d-block">
        <div class="carousel-badge">${getBadgeNivel(treino.nivel)}</div>
        <h3>${treino.nome}</h3>
        <p class="d-none d-md-block">${treino.descricaoCurta}</p>
      </div>
    `;

    div.addEventListener('click', function () {
      window.location.href = `detalhes.html?id=${treino.id}`;
    });

    inner.appendChild(div);
  });
}

function montarCards(treinos) {
  const container = document.getElementById('containerCards');
  if (!container) return;

  treinos.forEach(treino => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';
    col.innerHTML = `
      <div class="treino-card h-100">
        <a href="detalhes.html?id=${treino.id}">
          <img src="${treino.imagem}" class="treino-foto-${treino.id}" alt="${treino.nome}">
        </a>
        <div class="treino-card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="mb-0"><a href="detalhes.html?id=${treino.id}" class="link-card">${treino.nome}</a></h5>
            ${getBadgeNivel(treino.nivel)}
          </div>
          <p>${treino.descricaoCurta}</p>
          <div class="treino-meta">
            <span>🏷 ${treino.categoria}</span>
            <span>⏱ ${treino.duracao}</span>
            <span>👁 ${treino.visualizacoes} views</span>
            <span>🔥 ${treino.calorias}</span>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

async function carregarHome() {
  const container = document.getElementById('containerCards');
  if (!container) return;

  try {
    const treinos = await buscarTreinos();
    montarCarrossel(treinos);
    montarCards(treinos);
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Não foi possível carregar os treinos. Verifique se o JSON Server
          está rodando (<code>npm start</code>) e acesse o site por
          <code>http://localhost:3000</code>.
        </div>
      </div>`;
  }
}

function renderDetalhe(treino) {
  document.title = `${treino.nome} — Getting Freak`;

  const tagsHtml = (treino.tags || [])
    .map(tag => `<span class="tag">#${tag}</span>`)
    .join("");

  const secaoInfo = document.getElementById('secaoInfo');
  if (secaoInfo) {
    secaoInfo.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-6">
          <img src="${treino.imagem}" class="img-fluid rounded shadow" alt="${treino.nome}">
        </div>
        <div class="col-12 col-md-6">
          <div class="detalhe-header">
            <div class="d-flex gap-2 align-items-center mb-2">
              ${getBadgeNivel(treino.nivel)}
              <span class="badge bg-dark">${treino.categoria}</span>
            </div>
            <h1 class="mt-2">${treino.nome}</h1>
            <p class="lead">${treino.descricaoCurta}</p>
          </div>
          <hr>
          <p>${treino.descricaoCompleta}</p>
          <div class="detalhe-stats">
            <div class="stat-item">
              <span class="stat-icon">⏱</span>
              <div><small>Duração</small><strong>${treino.duracao}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔥</span>
              <div><small>Calorias</small><strong>${treino.calorias}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💪</span>
              <div><small>Séries</small><strong>${treino.series}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👁</span>
              <div><small>Visualizações</small><strong>${treino.visualizacoes}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📅</span>
              <div><small>Publicado em</small><strong>${new Date(treino.data).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>
          <div class="sobre-tags mt-3">${tagsHtml}</div>
          <a href="index.html" class="btn btn-outline-secondary mt-3">← Voltar</a>
        </div>
      </div>
    `;
  }

  const secaoExercicios = document.getElementById('secaoExercicios');
  if (secaoExercicios) {
    let html = '<div class="row g-3">';
    (treino.exercicios || []).forEach(ex => {
      html += `
        <div class="col-12 col-sm-6 col-md-4">
          <div class="exercicio-card">
            <img src="${ex.imagem}" alt="${ex.nome}">
            <div class="exercicio-body">
              <h5>${ex.nome}</h5>
              <p>${ex.descricao}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    secaoExercicios.innerHTML = html;
  }
}

async function carregarDetalhe() {
  const container = document.getElementById('detalheContainer');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-warning text-center my-5">
        <h4>Nenhum treino selecionado</h4>
        <p class="mb-3">Volte para a Home e escolha um treino.</p>
        <a href="index.html" class="btn btn-gf">Voltar ao início</a>
      </div>`;
    return;
  }

  try {
    const treino = await buscarTreino(id);
    renderDetalhe(treino);
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <div class="alert alert-danger text-center my-5">
        <h4>Treino não encontrado!</h4>
        <p class="mb-3">Não existe treino com o id <strong>${id}</strong>.</p>
        <a href="index.html" class="btn btn-gf">Voltar ao início</a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarHome();
  carregarDetalhe();
});
