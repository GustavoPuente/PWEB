function jogar(escolhaUsuario) {
    let numero = Math.random();

    let escolhaComputador;

    if (numero < 0.33) {
        escolhaComputador = 'pedra';
    } else if (numero < 0.66) {
        escolhaComputador = 'papel';
    } else {
        escolhaComputador = 'tesoura';
    }

    let resultado = "";

    if (escolhaUsuario === escolhaComputador) {
        resultado = "Empate!";
    } else if (
        (escolhaUsuario === 'pedra' && escolhaComputador === 'tesoura') ||
        (escolhaUsuario === 'tesoura' && escolhaComputador === 'papel') ||
        (escolhaUsuario === 'papel' && escolhaComputador === 'pedra')
    ) {
        resultado = "Você venceu!";
    } else {
        resultado = "Computador venceu!";
    }

    document.getElementById("resultado").innerHTML =
        `Você escolheu: ${escolhaUsuario} <br>
         Computador escolheu: ${escolhaComputador} <br>
         Resultado: ${resultado}`;
}