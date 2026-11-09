
function maiorNumero(a, b, c) {
    if (a >= b && a >= c) {
        return a;
    } else if (b >= a && b >= c) {
        return b;
    } else {
        return c;
    }
}
function ordemCrescente(a, b, c) {
    let numeros = [a, b, c];
    numeros.sort(function(x, y) {
        return x - y;
    });
    return numeros;
}

function palindromo(palavra) {

    let texto = palavra.toUpperCase();
    texto = texto.replace(/\s/g, "");
    let invertida = texto.split("").reverse().join("");
    return texto === invertida;
}
function somar(a, b) {
    return a + b;
}
function calcularMedia(a, b, c) {
    return (a + b + c) / 3;
}
