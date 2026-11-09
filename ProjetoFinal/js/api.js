// ===================================
// api.js - Consumo de API externa
// Usa a BrasilAPI (gratuita, não precisa de chave) para mostrar
// o próximo feriado nacional no topo da página.
// Documentação: https://brasilapi.com.br/docs#tag/Feriados-Nacionais
// ===================================

async function buscarProximoFeriado() {
    var elemento = document.getElementById("feriado");
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var ano = hoje.getFullYear();

    try {
        // busca os feriados deste ano e do próximo (para funcionar em dezembro)
        var resp1 = await fetch("https://brasilapi.com.br/api/feriados/v1/" + ano);
        var resp2 = await fetch("https://brasilapi.com.br/api/feriados/v1/" + (ano + 1));

        if (!resp1.ok || !resp2.ok) {
            throw new Error("Resposta da API: " + resp1.status + " / " + resp2.status);
        }

        var lista1 = await resp1.json();
        var lista2 = await resp2.json();
        var feriados = lista1.concat(lista2);

        // procura o primeiro feriado a partir de hoje
        var proximo = null;
        for (var i = 0; i < feriados.length; i++) {
            var data = textoParaData(feriados[i].date);
            if (data >= hoje) {
                proximo = feriados[i];
                break;
            }
        }

        if (proximo) {
            var dataFeriado = textoParaData(proximo.date);
            var dias = Math.round((dataFeriado - hoje) / 86400000);
            var quando = dias === 0 ? "é hoje!" : "em " + dias + " dia(s)";
            elemento.textContent = "📅 Próximo feriado: " + proximo.name + " (" + formatarData(proximo.date) + ") " + quando;
        } else {
            elemento.textContent = "Nenhum feriado encontrado.";
        }
    } catch (erro) {
        console.error("Erro na API de feriados:", erro);
        elemento.textContent = "Não foi possível carregar os feriados agora.";
    }
}
