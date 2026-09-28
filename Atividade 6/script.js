function iniciar() {

    let confirmar = confirm("Deseja iniciar o cálculo?");
    
    if (confirmar) {

        let n1 = parseFloat(prompt("Digite o primeiro número:"));
        let n2 = parseFloat(prompt("Digite o segundo número:"));

        if (isNaN(n1) || isNaN(n2)) {
            alert("Por favor, digite apenas números válidos.");
            return;
        }

        let soma = n1 + n2;
        let subtracao = n1 - n2;
        let produto = n1 * n2;
        let divisao = n2 !== 0 ? (n1 / n2) : "Não é possível dividir por zero";
        let resto = n2 !== 0 ? (n1 % n2) : "Não é possível calcular resto com divisor zero";

        alert(
            "Resultados:\n\n" +
            "Soma: " + soma + "\n" +
            "Subtração: " + subtracao + "\n" +
            "Produto: " + produto + "\n" +
            "Divisão: " + divisao + "\n" +
            "Resto da divisão: " + resto
        );

    } else {
        alert("Operação cancelada.");
    }
}