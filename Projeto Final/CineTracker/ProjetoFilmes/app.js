
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtfJyb1jJ_ejVLca_Zzl-9TgxqjuBGmRE",
  authDomain: "cinetracker-firebase-80c1f.firebaseapp.com",
  projectId: "cinetracker-firebase-80c1f",
  storageBucket: "cinetracker-firebase-80c1f.appspot.com",
  messagingSenderId: "243574713174",
  appId: "1:243574713174:web:5ab1d794f49eb3a0ca04f7"
};

const TMDB_API_KEY = 'eed9d419896f323216c3118f3dfb6676';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todosFilmes = []; 


const pages = document.querySelectorAll('.page-section');

function navigateTo(hash) {
    pages.forEach(page => page.style.display = 'none');
    
    const [pageId, queryString] = hash.substring(1).split('?');
    const params = new URLSearchParams(queryString);
    
    switch (pageId) {
        case 'adicionar':
            document.getElementById('page-adicionar').style.display = 'block';
            resetAdicionarPage(); 
            break;
        case 'detalhes':
            document.getElementById('page-detalhes').style.display = 'block';
            renderDetalhesPage(params.get('id'));
            break;
        case 'index':
        case '':
        default:
            document.getElementById('page-index').style.display = 'block';
            renderIndexPage();
            break;
    }
    window.scrollTo(0, 0); 
}


window.addEventListener('hashchange', () => navigateTo(window.location.hash));


window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners(); 
    navigateTo(window.location.hash || '#index');
});



async function renderIndexPage() {
    try {
        const q = query(collection(db, "filmes"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        todosFilmes = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        displayMovies(todosFilmes);
        updateSummaries();
    } catch (error) {
        console.error("Erro ao carregar filmes: ", error);
        document.getElementById('movies-found-text').textContent = "Erro ao carregar filmes.";
    }
}

function displayMovies(filmes) {
    const container = document.getElementById('movie-list-container');
    container.innerHTML = '';
    document.getElementById('movies-found-text').textContent = `${filmes.length} filme(s) encontrado(s)`;
    if (filmes.length === 0) {
        const termoBusca = document.getElementById('search-input').value;
        container.innerHTML = `<p>${termoBusca ? 'Nenhum filme encontrado para sua busca.' : 'Você ainda não adicionou nenhum filme.'}</p>`;
        return;
    }
    const colors = ['#e67e22', '#d35400', '#8e44ad', '#2c3e50', '#c0392b', '#16a085'];
    filmes.forEach((filme, index) => {
        const filmeData = filme.data;
        let headerStyle = filmeData.backdrop_path 
            ? `style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.2)), url('https://image.tmdb.org/t/p/w500${filmeData.backdrop_path}');"`
            : `style="background-color: ${colors[index % colors.length]};"`;

        container.innerHTML += `
            <a href="#detalhes?id=${filme.id}" class="movie-card-link">
                <div class="movie-card">
                    <div class="movie-header" ${headerStyle}>
                        <div class="rating"><i class="fas fa-star"></i> ${filmeData.avaliacao}</div>
                        <div class="age-rating">${filmeData.classificacao}</div>
                    </div>
                    <div class="movie-content">
                        <h3>${filmeData.titulo}</h3>
                        <p class="director">por ${filmeData.diretor}</p>
                        <p class="year">${filmeData.ano} <span class="duration"><i class="far fa-clock"></i> ${filmeData.duracao} min</span></p>
                        <div class="genres"><span>${filmeData.genero}</span></div>
                        <p class="description">${filmeData.sinopse}</p>
                        <div class="card-actions">
                            <button class="icon-btn js-delete-btn" data-id="${filme.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </a>`;
    });
}

function updateSummaries() {
    let totalMinutos = 0, totalNotas = 0;
    todosFilmes.forEach(filme => {
        totalMinutos += parseInt(filme.data.duracao) || 0;
        totalNotas += parseInt(filme.data.avaliacao) || 0;
    });
    document.getElementById('total-filmes').textContent = todosFilmes.length;
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    document.getElementById('horas-assistidas').textContent = `${horas}h ${minutos}m`;
    const notaMedia = todosFilmes.length > 0 ? (totalNotas / todosFilmes.length).toFixed(1) : 0;
    document.getElementById('nota-media').textContent = `${notaMedia}/10`;
}

async function deletarFilme(id) {
    if (!confirm('Tem certeza que deseja excluir este filme?')) return;
    try {
        await deleteDoc(doc(db, "filmes", id));
        alert('Filme deletado com sucesso!');
        renderIndexPage(); 
    } catch (error) {
        console.error("Erro ao deletar filme: ", error);
    }
}



function setupAdicionarPage() {
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.getElementById('search-tmdb-input').value;
        if (!query) return;
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '<p>Buscando...</p>';
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&include_adult=false`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const movies = data.results;
            resultsContainer.innerHTML = '';
            if (movies.length === 0) {
                resultsContainer.innerHTML = '<p>Nenhum filme encontrado.</p>';
                return;
            }
            movies.slice(0, 10).forEach(movie => {
                const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/92x138.png?text=Sem+Imagem';
                const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
                const movieEl = document.createElement('div');
                movieEl.classList.add('search-result-item');
                movieEl.innerHTML = `<img src="${posterUrl}" alt="Pôster"><div><strong>${movie.title}</strong><span>(${releaseYear})</span></div>`;
                movieEl.addEventListener('click', () => selectMovieToFillForm(movie.id));
                resultsContainer.appendChild(movieEl);
            });
        } catch (error) {
            resultsContainer.innerHTML = '<p>Erro ao buscar. Tente novamente.</p>';
        }
    });

    const addMovieForm = document.getElementById('add-movie-form');
    addMovieForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const btnSave = document.querySelector('#details-section .btn-save');
        btnSave.disabled = true;
        btnSave.textContent = 'Salvando...';
        const filmeParaSalvar = {
            titulo: document.getElementById('titulo').value,
            diretor: document.getElementById('diretor').value,
            ano: Number(document.getElementById('ano').value),
            duracao: Number(document.getElementById('duracao').value),
            genero: document.getElementById('genero').value,
            classificacao: document.getElementById('classificacao').value,
            sinopse: document.getElementById('sinopse').value,
            avaliacao: Number(document.getElementById('avaliacao').value),
            backdrop_path: document.getElementById('backdrop-path').value,
            createdAt: serverTimestamp()
        };
        try {
            await addDoc(collection(db, "filmes"), filmeParaSalvar);
            alert('Filme adicionado com sucesso!');
            window.location.hash = '#index'; // Volta para a página principal
        } catch (error) {
            alert('Ocorreu uma falha ao salvar o filme.');
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fas fa-save"></i> Salvar Filme';
        }
    });
}

async function selectMovieToFillForm(id) {
    document.getElementById('search-results').innerHTML = '<p>Carregando detalhes...</p>';
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=credits,release_dates`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        document.getElementById('form-movie-title').textContent = data.title;
        document.getElementById('titulo').value = data.title;
        document.getElementById('ano').value = data.release_date ? data.release_date.split('-')[0] : '';
        document.getElementById('duracao').value = data.runtime || 0;
        document.getElementById('sinopse').value = data.overview || '';
        document.getElementById('genero').value = data.genres.length > 0 ? data.genres.map(g => g.name).join(', ') : '';
        document.getElementById('backdrop-path').value = data.backdrop_path || '';
        const director = data.credits.crew.find(person => person.job === 'Director');
        document.getElementById('diretor').value = director ? director.name : 'Não encontrado';
        const releaseBR = data.release_dates.results.find(r => r.iso_3166_1 === 'BR');
        const classification = releaseBR && releaseBR.release_dates.length > 0 && releaseBR.release_dates[0].certification ? releaseBR.release_dates[0].certification : 'N/A';
        document.getElementById('classificacao').value = classification;
        document.getElementById('search-section').style.display = 'none';
        document.getElementById('details-section').style.display = 'block';
    } catch (error) {
        document.getElementById('search-results').innerHTML = '<p>Erro ao carregar os detalhes.</p>';
    }
}

function resetAdicionarPage(){
    document.getElementById('search-section').style.display = 'block';
    document.getElementById('details-section').style.display = 'none';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-tmdb-input').value = '';
}


async function renderDetalhesPage(filmeId) {
    const container = document.getElementById('detalhe-container');
    container.innerHTML = '<p style="padding: 20px;">Carregando detalhes do filme...</p>';
    if (!filmeId) {
        container.innerHTML = '<h1>Erro: ID do filme não fornecido.</h1>';
        return;
    }
    try {
        const docRef = doc(db, "filmes", filmeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const filme = docSnap.data();
            document.title = `${filme.titulo} - CineTracker`;
            container.innerHTML = `
                <div id="detalhe-header" class="detalhe-header"></div>
                <div class="detalhe-body">
                    <h1>${filme.titulo}</h1>
                    <p class="detalhe-subtitulo">por ${filme.diretor} | ${filme.ano}</p>
                     <div class="stats-grid">
                        <div class="stat-item"><i class="fas fa-clock"></i><span>Duração</span><p>${filme.duracao} min</p></div>
                        <div class="stat-item"><i class="fas fa-tag"></i><span>Gênero</span><p>${filme.genero}</p></div>
                        <div class="stat-item"><i class="fas fa-star"></i><span>Sua Avaliação</span><p>${filme.avaliacao}/10</p></div>
                        <div class="stat-item"><i class="fas fa-user-check"></i><span>Classificação</span><p>${filme.classificacao}</p></div>
                    </div>
                    <div class="sinopse-container"><h2>Sinopse</h2><p>${filme.sinopse || 'Nenhuma sinopse cadastrada.'}</p></div>
                </div>`;
            if (filme.backdrop_path) {
                document.getElementById('detalhe-header').style.backgroundImage = `url('https://image.tmdb.org/t/p/w1280${filme.backdrop_path}')`;
            }
        } else {
            container.innerHTML = '<h1>Filme não encontrado.</h1>';
        }
    } catch (error) {
        console.error("Erro ao buscar documento: ", error);
        container.innerHTML = '<h1>Erro ao carregar detalhes do filme.</h1>';
    }
}


function setupEventListeners() {
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        const termoBusca = e.target.value.toLowerCase().trim();
        const filmesFiltrados = todosFilmes.filter(filme => {
            const data = filme.data;
            return data.titulo.toLowerCase().includes(termoBusca) || data.diretor.toLowerCase().includes(termoBusca) || data.genero.toLowerCase().includes(termoBusca);
        });
        displayMovies(filmesFiltrados);
    });

    
    document.getElementById('movie-list-container').addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.js-delete-btn');
        if (deleteButton) {
            e.stopPropagation();
            e.preventDefault();
            deletarFilme(deleteButton.dataset.id);
        }
    });

    
    document.getElementById('avaliacao').addEventListener('input', (e) => {
        document.getElementById('rating-value').textContent = `${e.target.value}/10`;
    });
    
    
    document.getElementById('cancel-add-btn').addEventListener('click', resetAdicionarPage);
    
    
    setupAdicionarPage();
}