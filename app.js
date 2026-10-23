
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
            <div class="serie-card">
                <img class="serie-card__image" src="${imagen}" alt="${serie.name}">
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
        ocultarLoading();
    } catch (error) {
        mostrarError('No se pudieron cargar las series.');
    }
};

cargarSeriesPopulares();
