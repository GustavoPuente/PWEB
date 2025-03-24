function calcularOperacoes() {
    let num1 = parseFloat(prompt("Digite o primeiro número:"));
    let num2 = parseFloat(prompt("Digite o segundo número:"));

    let soma = num1 + num2;
    let subtracao = num1 - num2;
    let multiplicacao = num1 * num2;
    let divisao = num1 / num2;
    let resto = num1 % num2;

    alert(
        `Resultados:\n` +
        `Soma: ${soma}\n` +
        `Subtração: ${subtracao}\n` +
        `Multiplicação: ${multiplicacao}\n` +
        `Divisão: ${divisao.toFixed(2)}\n` +
        `Resto da divisão: ${resto}`
    );
}

