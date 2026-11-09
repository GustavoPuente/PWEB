// ===================================
// storage.js - Persistência dos dados
// Os dados ficam no Firebase Firestore (banco na nuvem).
// Também guardamos uma cópia no localStorage, para o site
// continuar funcionando se a internet ou o Firebase falhar.
// ===================================

// Configuração do projeto no Firebase (Console > Configurações do projeto > Seus apps)
var firebaseConfig = {
    apiKey: "AIzaSyAACEYO9Bf6ZwJTHKWXdWUsVmz2xlT-46M",
    authDomain: "study-manager-1a9e4.firebaseapp.com",
    projectId: "study-manager-1a9e4",
    storageBucket: "study-manager-1a9e4.firebasestorage.app",
    messagingSenderId: "913025718303",
    appId: "1:913025718303:web:e401dea4fc17a25bc05d2a"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// Todos os cartões ficam no documento "kanban/dados", dentro do campo "itens"
var documentoKanban = db.collection("kanban").doc("dados");

var CHAVE_STORAGE = "studyManagerItens"; // cópia local (backup)

// Retorna uma data no formato "aaaa-mm-dd" somando X dias a partir de hoje
function dataDaqui(dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    var mes = String(d.getMonth() + 1).padStart(2, "0");
    var dia = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mes + "-" + dia;
}

// Dados de exemplo para a primeira vez que abrir o site
function dadosIniciais() {
    return [
        { id: 1, titulo: "Capítulo 4 de Biologia", descricao: "Células e metabolismo", prioridade: "Alta", dataVencimento: dataDaqui(1), responsaveis: "Gustavo", status: "coluna1" },
        { id: 2, titulo: "Lista de exercícios de Física", descricao: "Cinemática", prioridade: "Média", dataVencimento: dataDaqui(6), responsaveis: "Gustavo, Ana", status: "coluna1" },
        { id: 3, titulo: "Resumo de História", descricao: "Brasil Império", prioridade: "Baixa", dataVencimento: dataDaqui(-1), responsaveis: "Ana", status: "coluna2" },
        { id: 4, titulo: "Leitura de português", descricao: "Redação dissertativa", prioridade: "Média", dataVencimento: dataDaqui(-3), responsaveis: "Gustavo", status: "coluna3" }
    ];
}

// Lê a cópia do localStorage (usada se o Firebase falhar)
function carregarBackupLocal() {
    try {
        var texto = localStorage.getItem(CHAVE_STORAGE);
        if (texto) {
            var lista = JSON.parse(texto);
            if (Array.isArray(lista)) return lista;
        }
    } catch (erro) {
        console.error("Erro ao ler o localStorage:", erro);
    }
    return null;
}

// Carrega os itens do Firestore. É "async" porque precisa esperar a resposta da internet.
async function carregarDados() {
    try {
        var doc = await documentoKanban.get();

        if (doc.exists && Array.isArray(doc.data().itens)) {
            return doc.data().itens;
        }

        // primeira vez: o documento ainda não existe, então cria com os exemplos
        var exemplos = dadosIniciais();
        salvarDados(exemplos);
        return exemplos;
    } catch (erro) {
        console.error("Erro ao ler do Firestore:", erro);
        mostrarToast("Sem conexão com o banco. Usando dados do navegador.");
        return carregarBackupLocal() || dadosIniciais();
    }
}

// Salva a lista inteira no Firestore (e a cópia no localStorage)
function salvarDados(itens) {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch (erro) {
        console.error("Erro ao salvar no localStorage:", erro);
    }

    // o Firestore não aceita uma lista solta, então guardamos dentro de { itens: [...] }
    return documentoKanban.set({ itens: itens })
        .then(function () {
            return true;
        })
        .catch(function (erro) {
            console.error("Erro ao salvar no Firestore:", erro);
            mostrarToast("Erro ao salvar na nuvem. Salvo só no navegador.");
            return false;
        });
}
