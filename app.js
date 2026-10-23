
const API_KEY = 'b28916e00c0215950498ee7ea6714b48';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid = document.getElementById('series-grid');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('error-message');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-search');
const retryBtn = document.getElementById('retry-btn');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('serie-modal');
const modalBody = document.getElementById('modal-body');
const modalClose = document.getElementById('modal-close');
const modalOverlay = document.getElementById('modal-overlay');

const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};

const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();

const mostrarSeries = (series) => {
    seriesGrid.innerHTML = '';
    series.forEach(serie => {
        const año = serie.first_air_date ? serie.first_air_date.substring(0, 4) : 'Sin año';
        const imagen = serie.poster_path ? `${IMAGE_URL}${serie.poster_path}` : '';
        seriesGrid.innerHTML += `
            <div class="serie-card" data-id="${serie.id}">
                <div class="serie-card__poster">
                    <img class="serie-card__image" src="${imagen}" alt="${serie.name}">
                </div>
                <div class="serie-card__content">
                    <h3 class="serie-card__title">${serie.name}</h3>
                    <p class="serie-card__year">${año}</p>
                    <p class="serie-card__rating">⭐ ${serie.vote_average.toFixed(1)}</p>
                </div>
            </div>
        `;
    });
    resultsCount.textContent = `Total: ${series.length}`;
};

const cargarSeriesPopulares = async () => {
    mostrarLoading();
    try {
        const respuesta = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`);
        if (!respuesta.ok) {
            throw new Error('Error al cargar series');
        }
        const datos = await respuesta.json();
        mostrarSeries(datos.results);
        resultsTitle.textContent = 'Series Populares';
        ocultarLoading();
    } catch (error) {
        mostrarError('No se pudieron cargar las series.');
    }
};

const buscarSeries = async () => {
    const texto = searchInput.value.trim();
    if (texto === '') {
        cargarSeriesPopulares();
        return;
    }
    mostrarLoading();
    try {
        const respuesta = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(texto)}&language=es-ES`);
        if (!respuesta.ok) {
            throw new Error('Error al buscar series');
        }
        const datos = await respuesta.json();
        mostrarSeries(datos.results);
        resultsTitle.textContent = `Resultados para: ${texto}`;
        ocultarLoading();
    } catch (error) {
        mostrarError('No se pudieron buscar las series.');
    }
};

searchInput.addEventListener('input', () => {
    buscarSeries();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    cargarSeriesPopulares();
});

retryBtn.addEventListener('click', () => {
    if (searchInput.value.trim() === '') {
        cargarSeriesPopulares();
    } else {
        buscarSeries();
    }
});

const abrirModal = async (id) => {
    modal.classList.add('modal--show');
    modalBody.innerHTML = '<p>Cargando detalles...</p>';
    try {
        const respuesta = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=es-ES`);
        if (!respuesta.ok) {
            throw new Error('Error al cargar detalles');
        }
        const serie = await respuesta.json();
        const generos = serie.genres.map(genero => genero.name).join(', ');
        modalBody.innerHTML = `
            <h2 class="modal__title">${serie.name}</h2>
            <div class="modal__info">
                <span>Temporadas: ${serie.number_of_seasons}</span>
                <span>Episodios: ${serie.number_of_episodes}</span>
                <span>Géneros: ${generos || 'Sin géneros'}</span>
                <span>Estado: ${serie.status}</span>
            </div>
            <p class="modal__overview">${serie.overview || 'Sin sinopsis disponible.'}</p>
        `;
    } catch (error) {
        modalBody.innerHTML = '<p>No se pudieron cargar los detalles.</p>';
    }
};

seriesGrid.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.serie-card');
    if (tarjeta) {
        abrirModal(tarjeta.dataset.id);
    }
});

const cerrarModal = () => {
    modal.classList.remove('modal--show');
};

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);

cargarSeriesPopulares();
