function Retangulo(x, y) {
    this.base = x;
    this.altura = y;

    this.calcularArea = function() {
        return this.base * this.altura;
    };
}

function executar() {

    let x = parseFloat(document.getElementById("base").value);
    let y = parseFloat(document.getElementById("altura").value);


    let retangulo = new Retangulo(x, y);
    let area = retangulo.calcularArea();

    document.getElementById("resultado").innerHTML =
        "A área do retângulo é: " + area;
}