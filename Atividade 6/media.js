function calcularMedia() {
    let nome = prompt("Digite o nome do aluno:");
    let notas = [];
    let soma = 0;

    for (let i = 0; i < 4; i++) {
        let nota = parseFloat(prompt(`Digite a nota ${i + 1}:`));
        notas.push(nota);
        soma += nota;
    }

    let media = soma / 4;
    alert(`Aluno: ${nome}\nMédia: ${media.toFixed(2)}`);
}
