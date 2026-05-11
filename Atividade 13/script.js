const janela = document.getElementById("janela");
const texto = document.getElementById("texto");



const imgFechada = "img/janela_fechada.jfif";
const imgAberta = "img/janela_aberta.jpg";
const imgQuebrada = "img/janela_quebrada.webp";



janela.addEventListener("mouseenter", function(){

    if(janela.src.includes("janela_quebrada.webp")){
        return;
    }

    janela.src = imgAberta;
    texto.innerHTML = "Janela Aberta";
});



janela.addEventListener("mouseleave", function(){

    if(janela.src.includes("janela_quebrada.webp")){
        return;
    }

    janela.src = imgFechada;
    texto.innerHTML = "Janela Fechada";
});



janela.addEventListener("click", function(){

    janela.src = imgQuebrada;
    texto.innerHTML = "Janela Quebrada";
});