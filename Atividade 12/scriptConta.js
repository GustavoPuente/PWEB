class Conta {
    constructor(nome, banco, numeroConta, saldo) {
        this._nome = nome;
        this._banco = banco;
        this._numeroConta = numeroConta;
        this._saldo = saldo;
    }

    get nome() {
        return this._nome;
    }

    get banco() {
        return this._banco;
    }

    get numeroConta() {
        return this._numeroConta;
    }

    get saldo() {
        return this._saldo;
    }

    set nome(valor) {
        this._nome = valor;
    }

    set banco(valor) {
        this._banco = valor;
    }

    set numeroConta(valor) {
        this._numeroConta = valor;
    }

    set saldo(valor) {
        this._saldo = valor;
    }
}

class Corrente extends Conta {
    constructor(nome, banco, numeroConta, saldo, saldoEspecial) {
        super(nome, banco, numeroConta, saldo);
        this._saldoEspecial = saldoEspecial;
    }

    get saldoEspecial() {
        return this._saldoEspecial;
    }

    set saldoEspecial(valor) {
        this._saldoEspecial = valor;
    }
}

class Poupanca extends Conta {
    constructor(nome, banco, numeroConta, saldo, juros, dataVencimento) {
        super(nome, banco, numeroConta, saldo);
        this._juros = juros;
        this._dataVencimento = dataVencimento;
    }

    get juros() {
        return this._juros;
    }

    get dataVencimento() {
        return this._dataVencimento;
    }

    set juros(valor) {
        this._juros = valor;
    }

    set dataVencimento(valor) {
        this._dataVencimento = valor;
    }
}
function criarContaCorrente() {

    let conta = new Corrente(
        document.getElementById("nomeCorrente").value,
        document.getElementById("bancoCorrente").value,
        document.getElementById("numeroCorrente").value,
        document.getElementById("saldoCorrente").value,
        document.getElementById("saldoEspecial").value
    );

    document.getElementById("resultadoCorrente").innerHTML = `
        <h3>Dados da Conta Corrente</h3>
        <p><strong>Nome:</strong> ${conta.nome}</p>
        <p><strong>Banco:</strong> ${conta.banco}</p>
        <p><strong>Número da Conta:</strong> ${conta.numeroConta}</p>
        <p><strong>Saldo:</strong> R$ ${conta.saldo}</p>
        <p><strong>Saldo Especial:</strong> R$ ${conta.saldoEspecial}</p>
    `;
}

function criarContaPoupanca() {

    let conta = new Poupanca(
        document.getElementById("nomePoupanca").value,
        document.getElementById("bancoPoupanca").value,
        document.getElementById("numeroPoupanca").value,
        document.getElementById("saldoPoupanca").value,
        document.getElementById("jurosPoupanca").value,
        document.getElementById("vencimentoPoupanca").value
    );

    document.getElementById("resultadoPoupanca").innerHTML = `
        <h3>Dados da Conta Poupança</h3>
        <p><strong>Nome:</strong> ${conta.nome}</p>
        <p><strong>Banco:</strong> ${conta.banco}</p>
        <p><strong>Número da Conta:</strong> ${conta.numeroConta}</p>
        <p><strong>Saldo:</strong> R$ ${conta.saldo}</p>
        <p><strong>Juros:</strong> ${conta.juros}%</p>
        <p><strong>Data de Vencimento:</strong> ${conta.dataVencimento}</p>
    `;
}