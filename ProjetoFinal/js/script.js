var colunas = {
    coluna1: "Conteúdo para estudar",
    coluna2: "Em Progresso",
    coluna3: "Concluído"
};

var itens = [];
var idEditando = null;
var filtroTabela = "";

var iconeEditar = '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>';
var iconeExcluir = '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/></svg>';

var listas = document.querySelectorAll(".lista-cards");
var contadores = document.querySelectorAll(".contador");
var corpoTabela = document.getElementById("corpoTabela");
var campoBusca = document.getElementById("busca");
var filtroPrioridade = document.getElementById("filtroPrioridade");

var modal = document.getElementById("modal");
var form = document.getElementById("formCartao");
var tituloModal = document.getElementById("tituloModal");
var campoStatus = document.getElementById("campoStatus");

function textoParaData(texto) {
    var partes = texto.split("-");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function formatarData(texto) {
    if (!texto) return "";
    var partes = texto.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function hojeSemHora() {
    var h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
}

function situacaoPrazo(item) {
    if (item.status === "coluna3") return "concluido";

    var dias = Math.round((textoParaData(item.dataVencimento) - hojeSemHora()) / 86400000);
    if (dias < 0) return "atrasado";
    if (dias <= 2) return "proximo";
    return "normal";
}

function textoAlerta(item, situacao) {
    var dias = Math.round((textoParaData(item.dataVencimento) - hojeSemHora()) / 86400000);
    if (situacao === "concluido") return "✓ Concluído";
    if (situacao === "atrasado") return "⊖ Atrasado há " + Math.abs(dias) + " dia(s)";
    if (situacao === "proximo") {
        if (dias === 0) return "△ Vence hoje!";
        return "△ Vence em " + dias + " dia(s)";
    }
    return "";
}

function escaparHTML(texto) {
    var div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function mostrarToast(mensagem) {
    var toast = document.getElementById("toast");
    toast.textContent = mensagem;
    toast.classList.add("mostrar");
    setTimeout(function () {
        toast.classList.remove("mostrar");
    }, 2500);
}

function buscarItem(id) {
    return itens.find(function (item) {
        return item.id === id;
    });
}

function novoId() {
    var maior = 0;
    itens.forEach(function (item) {
        if (item.id > maior) maior = item.id;
    });
    return maior + 1;
}

function itensFiltrados() {
    var busca = campoBusca.value.trim().toLowerCase();
    var prioridade = filtroPrioridade.value;

    return itens.filter(function (item) {
        var textoItem = (item.titulo + " " + item.responsaveis + " " + formatarData(item.dataVencimento)).toLowerCase();
        var passouBusca = busca === "" || textoItem.includes(busca);
        var passouPrioridade = prioridade === "" || item.prioridade === prioridade;
        return passouBusca && passouPrioridade;
    });
}

function botoesAcao(id) {
    return "<div class='botoes'>" +
        "<button class='btn-icone' data-acao='editar' data-id='" + id + "' title='Editar' aria-label='Editar'>" + iconeEditar + "</button>" +
        "<button class='btn-icone excluir' data-acao='excluir' data-id='" + id + "' title='Excluir' aria-label='Excluir'>" + iconeExcluir + "</button>" +
        "</div>";
}

function criarCard(item) {
    var situacao = situacaoPrazo(item);
    var card = document.createElement("article");
    card.className = "card " + situacao;
    card.draggable = true;
    card.tabIndex = 0;
    card.dataset.id = item.id;
    card.setAttribute("aria-label", item.titulo + ", prioridade " + item.prioridade);

    var alerta = textoAlerta(item, situacao);

    card.innerHTML =
        "<h4>" + escaparHTML(item.titulo) + "</h4>" +
        (item.descricao ? "<p class='descricao'>" + escaparHTML(item.descricao) + "</p>" : "") +
        (alerta ? "<p class='alerta " + situacao + "'>" + alerta + "</p>" : "") +
        "<div class='infos'>" +
            "<span class='etiqueta " + item.prioridade + "'>" + item.prioridade + "</span>" +
            "<span class='etiqueta'>▦ " + formatarData(item.dataVencimento) + "</span>" +
            "<span class='etiqueta'>♟ " + escaparHTML(item.responsaveis) + "</span>" +
        "</div>" +
        botoesAcao(item.id);

    card.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", item.id);
        card.classList.add("arrastando");
    });
    card.addEventListener("dragend", function () {
        card.classList.remove("arrastando");
    });

    return card;
}

function renderizar() {
    var filtrados = itensFiltrados();

    listas.forEach(function (lista, indice) {
        var status = lista.dataset.status;
        var itensColuna = filtrados.filter(function (item) {
            return item.status === status;
        });

        lista.innerHTML = "";
        if (itensColuna.length === 0) {
            lista.innerHTML = "<p class='vazio'>Arraste um cartão para cá</p>";
        }
        itensColuna.forEach(function (item) {
            lista.appendChild(criarCard(item));
        });

        contadores[indice].textContent = itensColuna.length;
    });

    renderizarTabela(filtrados);
}

function renderizarTabela(lista) {
    corpoTabela.innerHTML = "";

    if (filtroTabela !== "") {
        lista = lista.filter(function (item) {
            return item.status === filtroTabela;
        });
    }

    if (lista.length === 0) {
        corpoTabela.innerHTML = "<tr><td colspan='6'>Nenhum cartão encontrado.</td></tr>";
        return;
    }

    lista.forEach(function (item) {
        var tr = document.createElement("tr");
        tr.innerHTML =
            "<td><span class='etiqueta " + item.prioridade + "'>" + item.prioridade + "</span></td>" +
            "<td>" + escaparHTML(item.titulo) + "</td>" +
            "<td>" + escaparHTML(item.descricao || "-") + "</td>" +
            "<td><span class='etiqueta Baixa'>" + colunas[item.status] + "</span></td>" +
            "<td>" + formatarData(item.dataVencimento) + "</td>" +
            "<td>" + botoesAcao(item.id) + "</td>";
        corpoTabela.appendChild(tr);
    });
}

function trocarVisao(visao) {
    document.getElementById("visaoKanban").hidden = visao !== "kanban";
    document.getElementById("visaoTabela").hidden = visao !== "tabela";

    document.querySelectorAll(".aba").forEach(function (aba) {
        aba.classList.toggle("ativa", aba.dataset.visao === visao);
    });
}

listas.forEach(function (lista) {
    lista.addEventListener("dragover", function (e) {
        e.preventDefault();
        lista.classList.add("destaque");
    });

    lista.addEventListener("dragleave", function () {
        lista.classList.remove("destaque");
    });

    lista.addEventListener("drop", function (e) {
        e.preventDefault();
        lista.classList.remove("destaque");

        var id = Number(e.dataTransfer.getData("text/plain"));
        moverItem(id, lista.dataset.status);
    });
});

function moverItem(id, novoStatus) {
    var item = buscarItem(id);
    if (!item || item.status === novoStatus) return;

    item.status = novoStatus;
    salvarDados(itens);
    renderizar();
    mostrarToast("Movido para \"" + colunas[novoStatus] + "\"");
}

function abrirModal(item) {
    limparErros();
    form.reset();

    if (item) {
        idEditando = item.id;
        tituloModal.textContent = "Editar cartão";
        document.getElementById("titulo").value = item.titulo;
        document.getElementById("descricao").value = item.descricao;
        document.getElementById("prioridade").value = item.prioridade;
        document.getElementById("dataVencimento").value = item.dataVencimento;
        document.getElementById("responsaveis").value = item.responsaveis;
        document.getElementById("status").value = item.status;
        campoStatus.style.display = "flex";
    } else {
        idEditando = null;
        tituloModal.textContent = "Novo cartão";
        campoStatus.style.display = "none";
    }

    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("titulo").focus();
}

function fecharModal() {
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
}

function mostrarErro(idCampo, idErro, mensagem) {
    document.getElementById(idCampo).classList.add("invalido");
    document.getElementById(idErro).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll(".erro").forEach(function (span) {
        span.textContent = "";
    });
    document.querySelectorAll(".invalido").forEach(function (campo) {
        campo.classList.remove("invalido");
    });
}

function validarFormulario(valores) {
    limparErros();
    var valido = true;

    if (valores.titulo.length < 3) {
        mostrarErro("titulo", "erroTitulo", "O título precisa ter pelo menos 3 letras.");
        valido = false;
    }

    if (valores.descricao.length > 200) {
        mostrarErro("descricao", "erroDescricao", "Máximo de 200 caracteres.");
        valido = false;
    }

    if (valores.prioridade === "") {
        mostrarErro("prioridade", "erroPrioridade", "Escolha uma prioridade.");
        valido = false;
    }

    if (valores.dataVencimento === "") {
        mostrarErro("dataVencimento", "erroData", "Informe a data de vencimento.");
        valido = false;
    } else if (idEditando === null && textoParaData(valores.dataVencimento) < hojeSemHora()) {
        mostrarErro("dataVencimento", "erroData", "A data não pode ser no passado.");
        valido = false;
    }

    if (valores.responsaveis === "") {
        mostrarErro("responsaveis", "erroResponsaveis", "Informe pelo menos um responsável.");
        valido = false;
    }

    return valido;
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    var valores = {
        titulo: document.getElementById("titulo").value.trim(),
        descricao: document.getElementById("descricao").value.trim(),
        prioridade: document.getElementById("prioridade").value,
        dataVencimento: document.getElementById("dataVencimento").value,
        responsaveis: document.getElementById("responsaveis").value.trim()
    };

    if (!validarFormulario(valores)) {
        var primeiroErro = document.querySelector(".invalido");
        if (primeiroErro) primeiroErro.focus();
        return;
    }

    if (idEditando === null) {
        valores.id = novoId();
        valores.status = "coluna1";
        itens.push(valores);
        mostrarToast("Cartão criado!");
    } else {
        var item = buscarItem(idEditando);
        item.titulo = valores.titulo;
        item.descricao = valores.descricao;
        item.prioridade = valores.prioridade;
        item.dataVencimento = valores.dataVencimento;
        item.responsaveis = valores.responsaveis;
        item.status = document.getElementById("status").value;
        mostrarToast("Cartão atualizado!");
    }

    salvarDados(itens);
    fecharModal();
    renderizar();
});

function excluirItem(id) {
    var item = buscarItem(id);
    if (!item) return;

    if (confirm("Tem certeza que deseja excluir \"" + item.titulo + "\"?")) {
        itens = itens.filter(function (i) {
            return i.id !== id;
        });
        salvarDados(itens);
        renderizar();
        mostrarToast("Cartão excluído.");
    }
}

document.addEventListener("click", function (e) {
    var botao = e.target.closest("[data-acao]");
    if (!botao) return;

    var id = Number(botao.dataset.id);
    if (botao.dataset.acao === "editar") {
        abrirModal(buscarItem(id));
    } else if (botao.dataset.acao === "excluir") {
        excluirItem(id);
    }
});

document.getElementById("btnNovo").addEventListener("click", function () {
    abrirModal(null);
});

document.getElementById("btnCancelar").addEventListener("click", fecharModal);

modal.addEventListener("click", function (e) {
    if (e.target === modal) fecharModal();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("aberto")) {
        fecharModal();
    }
});

document.querySelectorAll(".aba").forEach(function (aba) {
    aba.addEventListener("click", function () {
        trocarVisao(aba.dataset.visao);
    });
});

document.querySelectorAll(".filtro-coluna button").forEach(function (botao) {
    botao.addEventListener("click", function () {
        filtroTabela = botao.dataset.filtro;
        document.querySelectorAll(".filtro-coluna button").forEach(function (b) {
            b.classList.remove("ativo");
        });
        botao.classList.add("ativo");
        renderizar();
    });
});

campoBusca.addEventListener("input", renderizar);
filtroPrioridade.addEventListener("change", renderizar);

async function iniciar() {
    listas.forEach(function (lista) {
        lista.innerHTML = "<p class='vazio'>Carregando...</p>";
    });

    buscarProximoFeriado();

    itens = await carregarDados();
    renderizar();
}

iniciar();
