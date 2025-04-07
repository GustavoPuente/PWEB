function maiorNumero(a, b, c) {
    return Math.max(a, b, c);
  }
  
  function ordenarCrescente(a, b, c) {
    return [a, b, c].sort((x, y) => x - y);
  }
  
 
  function ehPalindromo(str) {
    const texto = str.toUpperCase();
    const reverso = texto.split('').reverse().join('');
    return texto === reverso;
  }
  
  
  function tipoTriangulo(a, b, c) {
    if (a + b > c && a + c > b && b + c > a) {
      if (a === b && b === c) return 'Equilátero';
      else if (a === b || a === c || b === c) return 'Isósceles';
      else return 'Escaleno';
    } else {
      return 'Não forma um triângulo';
    }
  }
  