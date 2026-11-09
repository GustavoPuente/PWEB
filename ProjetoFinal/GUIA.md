# Guia do Projeto Final de PWEB — Study Manager (Kanban)

Este guia explica **tudo** do projeto: como as pastas estão organizadas, como o código funciona, como rodar no computador, como funciona o banco de dados e a API, e como subir para o GitHub e hospedar de graça.

---

## 1. O que o projeto faz

É um quadro **Kanban** com o tema escolhido: **Planejamento de Estudos**.

| Tema | Coluna 1 | Coluna 2 | Coluna 3 |
|---|---|---|---|
| Planejamento de Estudos | Conteúdo para estudar | Em Progresso | Concluído |

Funcionalidades (todas pedidas no documento):

- ✅ 3 colunas (quadros)
- ✅ Criar, alterar e excluir itens (o item novo sempre entra na **coluna 1**)
- ✅ 6 campos: **título, descrição, prioridade, data de vencimento, responsáveis e status**
- ✅ Arrastar e soltar entre as colunas (muda o `status`)
- ✅ Avisos visuais: borda e texto **vermelho** (atrasado), **amarelo** (vence em até 2 dias), **verde com ✔** (concluído)
- ✅ Pesquisa por título, responsável, data e filtro de prioridade (opcional do projeto)
- ✅ Validação do formulário com mensagens de erro
- ✅ Dados salvos na nuvem (**Firebase Firestore**), com cópia no navegador (**localStorage**)
- ✅ Responsivo (celular, tablet, computador)
- ✅ Extra: consome uma **API pública** (BrasilAPI) para mostrar o próximo feriado

---

## 2. Estrutura das pastas

O documento pede para separar HTML, CSS e JS:

```
ProjetoFinal/
├── index.html        → estrutura da página
├── css/
│   └── style.css     → todo o visual
├── js/
│   ├── storage.js    → salvar/carregar dados (Firebase + localStorage)
│   ├── api.js        → busca de feriados na BrasilAPI
│   └── script.js     → lógica do Kanban (CRUD, arrastar, filtros)
├── GUIA.md           → este guia
└── README.md         → descrição curta para o GitHub
```

> A ordem dos `<script>` no final do `index.html` importa: primeiro `storage.js`, depois `api.js`, por último `script.js` (que usa funções dos outros dois).

---

## 3. Como rodar no seu computador

**Opção 1 (mais fácil):** dê dois cliques no `index.html`. Abre no navegador e já funciona.

**Opção 2 (recomendada):** no **VS Code**:
1. Instale a extensão **Live Server** (de Ritwick Dey).
2. Abra a pasta `ProjetoFinal` no VS Code (`Arquivo > Abrir pasta`).
3. Clique com o botão direito no `index.html` → **Open with Live Server**.
4. Abre em `http://127.0.0.1:5500` e atualiza sozinho quando você salva um arquivo.

---

## 4. Como o código funciona (para explicar na apresentação)

### 4.1 Os dados

Todos os cartões ficam em uma lista (array) chamada `itens`:

```js
itens = [
  { id: 1, titulo: "Capítulo 4 de Biologia", descricao: "Células e metabolismo",
    prioridade: "Alta", dataVencimento: "2026-11-09",
    responsaveis: "Gustavo", status: "coluna1" },
  ...
]
```

E os nomes das colunas ficam no objeto `colunas`:

```js
var colunas = {
    coluna1: "Conteúdo para estudar",
    coluna2: "Em Progresso",
    coluna3: "Concluído"
};
```

O campo `status` guarda em qual coluna o item está: `"coluna1"`, `"coluna2"` ou `"coluna3"` (exatamente como o documento pede).

### 4.2 `renderizar()` — desenha a tela

Toda vez que algo muda (criar, editar, excluir, mover, pesquisar), o código chama `renderizar()`. Ela:
1. Filtra os itens pela pesquisa.
2. Limpa as colunas e cria um `<article class="card">` para cada item (`criarCard`).
3. Atualiza os contadores e a tabela CRUD.

### 4.3 Arrastar e soltar (Drag and Drop do HTML5)

- O card tem `draggable = true`.
- No `dragstart` o card guarda o seu `id`: `e.dataTransfer.setData("text/plain", item.id)`.
- A coluna escuta `dragover` (precisa do `e.preventDefault()`, senão não deixa soltar) e `drop`.
- No `drop` a gente lê o id, troca o `status` do item, salva e renderiza de novo (`moverItem`).

> **No celular** o drag and drop do HTML5 não funciona com o dedo. Por isso, ao **Editar** um cartão aparece o campo **Status**, que permite mudar a coluna. Fale isso na apresentação — conta ponto em usabilidade/acessibilidade.

### 4.4 Avisos visuais de prazo

A função `situacaoPrazo(item)` calcula quantos dias faltam:

| Situação | Regra | Visual |
|---|---|---|
| `concluido` | está na coluna 3 | borda verde + ✔ |
| `atrasado` | data já passou | borda vermelha + "⛔ Atrasado há X dia(s)" |
| `proximo` | faltam 0 a 2 dias | borda amarela + "⚠ Vence em X dia(s)" |
| `normal` | mais de 2 dias | sem aviso |

O nome da situação vira uma **classe CSS** no card (`card atrasado`, `card proximo`...) e o CSS pinta a borda.

### 4.5 Validação (tratamento de erros)

Em `validarFormulario()`:
- Título com pelo menos 3 letras.
- Descrição com no máximo 200 caracteres.
- Prioridade obrigatória.
- Data obrigatória e **não pode ser no passado** (para cartão novo).
- Responsáveis obrigatório.

O erro aparece em vermelho embaixo do campo e o foco vai para o primeiro campo errado. Também há `try/catch` no Firebase, no localStorage e na API, para o site não quebrar se der erro.

### 4.6 Segurança

A função `escaparHTML()` impede que alguém digite `<script>` no título e isso rode na página (ataque XSS). Pode citar isso como "boa prática".

---

## 5. Banco de dados — Firebase Firestore (nuvem) + localStorage (backup)

O documento aceita **localStorage**, **IndexedDB** ou **banco em nuvem**. O projeto usa o **Firebase Firestore** (banco NoSQL na nuvem do Google). Assim os cartões aparecem em qualquer computador ou celular que abrir o site.

Também é salva uma **cópia no localStorage**: se a internet ou o Firebase falhar, o site continua funcionando com os dados do navegador.

Como funciona (arquivo `js/storage.js`):

```js
// conecta no projeto do Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var documentoKanban = db.collection("kanban").doc("dados");

// salvar: grava a lista inteira no documento kanban/dados
documentoKanban.set({ itens: itens });

// carregar: busca o documento (precisa de await porque vem da internet)
var doc = await documentoKanban.get();
var itens = doc.data().itens;
```

Estrutura no Firestore:

```
kanban            (coleção)
 └── dados        (documento)
      └── itens   (lista com todos os cartões)
```

> O Firestore não aceita uma lista "solta" como documento, por isso a lista fica dentro do campo `itens`.

Como a leitura demora um pouco (vem da internet), o `script.js` começa com `var itens = []` e a função `iniciar()` usa `await carregarDados()` antes de desenhar os cartões. Enquanto isso aparece "Carregando...".

**Como mostrar para o professor que está salvando:**
1. Abra o site e crie ou mova um cartão.
2. Em outra aba, abra o [console do Firebase](https://console.firebase.google.com) → projeto **study manager** → **Firestore Database** → coleção `kanban` → documento `dados`.
3. Os cartões aparecem lá, atualizados.
4. Abra o site em outro navegador ou no celular: os mesmos cartões aparecem.

**Para zerar os dados** (voltar aos exemplos): no console do Firebase, apague o documento `dados` (três pontinhos → Excluir documento) e recarregue o site.

---

## 6. API — como o site consome uma API (BrasilAPI)

No topo do site aparece o **próximo feriado nacional**. Isso vem da [BrasilAPI](https://brasilapi.com.br/docs#tag/Feriados-Nacionais), que é gratuita e **não precisa de cadastro nem chave**.

Arquivo `js/api.js`:

```js
var resposta = await fetch("https://brasilapi.com.br/api/feriados/v1/2026");
var feriados = await resposta.json();
// feriados = [ { date: "2026-01-01", name: "Confraternização mundial", type: "national" }, ... ]
```

Passo a passo:
1. `fetch(url)` faz a requisição HTTP (GET) para a API.
2. `await` espera a resposta chegar (por isso a função é `async`).
3. `resposta.ok` confere se deu certo (status 200).
4. `resposta.json()` converte o texto da resposta em objeto JavaScript.
5. Procuramos o primeiro feriado com data maior ou igual a hoje e mostramos na tela.
6. Se der erro (sem internet, API fora do ar) o `catch` mostra uma mensagem amigável.

**Para testar a API sozinha:** cole `https://brasilapi.com.br/api/feriados/v1/2026` no navegador — vai aparecer o JSON.

**Ver a requisição acontecendo:** F12 → aba **Network (Rede)** → recarregue a página → aparece a chamada `2026`.

---

## 7. Como o Firebase foi configurado (passo a passo)

Isso **já está feito** no projeto (projeto `study-manager-1a9e4`). Fica aqui para você saber explicar ou refazer.

### 7.1 Criar o projeto no Firebase
1. Entre em <https://console.firebase.google.com> com uma conta Google.
2. **Adicionar projeto** → dê um nome (ex: `study-manager`) → pode desativar o Google Analytics → Criar.
3. No menu: **Firestore Database** → **Criar banco de dados** → local `southamerica-east1` → **Iniciar no modo de teste**.
4. **Visão geral do projeto** → **+ Adicionar app** → ícone **`</>`** (Web) → apelido → **Registrar app**.
5. Na tela "Adicionar o SDK", copie só o objeto `firebaseConfig` (as linhas com `import` e `npm install` não são usadas, porque o projeto é HTML puro).

### 7.2 Regras do Firestore (importante!)
No console: **Firestore Database → Regras**. No **modo de teste** a regra libera leitura e escrita só até uma data (30 dias):

```
allow read, write: if request.time < timestamp.date(2026, 12, 9);
```

Se o site parar de salvar depois da apresentação, é porque essa data passou. Para liberar de novo, troque a data por uma mais longe e clique em **Publicar**.

> A `apiKey` do Firebase pode ficar no código do site — ela não é uma senha. Quem protege os dados são as **regras**. Como as regras de teste deixam qualquer pessoa ler e escrever, depois que o trabalho for avaliado você pode apagar o projeto no console do Firebase.

### 7.3 Como está no código
No `index.html`, **antes** dos seus scripts:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
```

No `js/storage.js` ficam o `firebaseConfig`, a função `carregarDados()` (lê do Firestore; se falhar, usa o localStorage) e `salvarDados()` (grava no Firestore e no localStorage). No fim do `script.js`, a função `iniciar()` espera os dados chegarem antes de desenhar a tela.

**Se aparecer o aviso "Sem conexão com o banco"**: aperte F12 → aba **Console** e veja o erro.
- `permission-denied` → as regras do Firestore estão bloqueando (veja 7.2).
- `failed to get document because the client is offline` → sem internet.

---

## 8. Subir o código no GitHub (pasta `ProjetoFinal` dentro do repositório `PWEB`)

O documento pede: *"pasta ProjetoFinal dentro do repositório PWEB"*.

### Opção A — pelo site (sem usar comandos)
1. Entre em <https://github.com> e faça login.
2. Se ainda não tem o repositório: **New** → nome `PWEB` → **Public** → Create repository.
3. Dentro do repositório: **Add file > Upload files**.
4. Arraste a **pasta `ProjetoFinal` inteira** (o GitHub mantém as subpastas `css` e `js`).
5. Escreva uma mensagem (ex: "Projeto final Kanban") → **Commit changes**.

### Opção B — pelo terminal (Git)
Instale o Git: <https://git-scm.com/downloads>. Depois, no terminal:

```bash
git clone https://github.com/SEU_USUARIO/PWEB.git
```

Copie a pasta `ProjetoFinal` para dentro da pasta `PWEB` que foi criada. Depois:

```bash
cd PWEB
```

```bash
git add ProjetoFinal
```

```bash
git commit -m "Projeto final: Kanban Study Manager"
```

```bash
git push
```

Na primeira vez o Git pede login — vai abrir uma janela do GitHub no navegador para você autorizar.

---

## 9. Hospedar de graça (e pegar a URL para entregar)

### Opção A — GitHub Pages (recomendada, já usa o repositório)
1. No repositório `PWEB` no GitHub → **Settings** → **Pages** (menu da esquerda).
2. Em **Source** escolha **Deploy from a branch**.
3. Branch: **main**, pasta: **/(root)** → **Save**.
4. Espere 1–2 minutos e recarregue a página. Vai aparecer o link do site.
5. A URL do projeto será:

```
https://SEU_USUARIO.github.io/PWEB/ProjetoFinal/
```

> Se der erro 404: confira se o arquivo se chama exatamente `index.html` (tudo minúsculo) e se a pasta é `ProjetoFinal` (o GitHub diferencia maiúsculas de minúsculas).

### Opção B — Netlify Drop (mais rápida, sem GitHub)
1. Entre em <https://app.netlify.com/drop>.
2. Arraste a pasta `ProjetoFinal`.
3. Pronto, ele gera um link tipo `https://nome-aleatorio.netlify.app`. Crie uma conta grátis para o link não expirar.

### Opção C — Vercel
1. Entre em <https://vercel.com> com a conta do GitHub.
2. **Add New > Project** → importe o repositório `PWEB`.
3. Em **Root Directory** escolha `ProjetoFinal` → **Deploy**.

Depois de hospedar, **teste o link no celular** e cole a URL na tarefa do Teams.

---

## 10. Preenchendo o documento (itens 1, 8 e 9)

- **Item 1:** já está preenchido com os dados do grupo (adicione os outros integrantes, se tiver).
- **Item 8 — Tema escolhido:** já preenchido no documento atualizado (`Projeto Kanban - preenchido.docx`):
  > Planejamento de Estudos — Colunas: Conteúdo para estudar / Em Progresso / Concluído.
- **Item 9 — Telas:** no documento atualizado as imagens foram trocadas por prints da tela inicial e da Lista CRUD só com o tema de estudos.

---

## 11. Checklist dos critérios de avaliação

| Critério | Onde está no projeto |
|---|---|
| Código no GitHub (`PWEB/ProjetoFinal`) | Seção 8 deste guia |
| Funcionalidades obrigatórias | `js/script.js` (CRUD, drag and drop, avisos) |
| Tratamento de erros e validação | `validarFormulario()`, `try/catch` em `storage.js` e `api.js` |
| Qualidade do código | arquivos separados, funções com nomes claros, comentários |
| Responsividade e usabilidade | `@media` no fim do `style.css`, modal, toast, filtros |
| Acessibilidade | `lang="pt-BR"`, `label` em todos os campos, foco visível, `aria-*`, fecha modal com ESC |
| Persistência dos dados | Firebase Firestore + `localStorage` em `js/storage.js` |
| Hospedagem gratuita | Seção 9 deste guia |

---

## 12. Perguntas que o professor pode fazer (e respostas curtas)

- **"Onde os dados ficam salvos?"** — No Firebase Firestore, coleção `kanban`, documento `dados`, campo `itens`. Também guardo uma cópia no localStorage (chave `studyManagerItens`) caso a internet caia.
- **"Por que `async/await` no carregarDados?"** — Porque buscar no Firestore demora (vem da internet); o `await` espera a resposta antes de desenhar os cartões.
- **"Como o arrastar funciona?"** — Com a API de Drag and Drop do HTML5: `dragstart` guarda o id, `dragover` libera a coluna e `drop` muda o status do item.
- **"Como sabe que o prazo está próximo?"** — Subtraio a data de vencimento da data de hoje e divido por 86.400.000 (milissegundos de um dia). Se der entre 0 e 2, está próximo; negativo, atrasado.
- **"Por que `JSON.stringify`?"** — Porque o localStorage só guarda texto.
- **"O que é `async/await`?"** — Serve para esperar a resposta da API sem travar a página.
- **"Por que tem um campo Status na edição?"** — Porque no celular não dá para arrastar; assim o usuário consegue mover o cartão de outro jeito.

---

## 13. Ideias para melhorar (se sobrar tempo)

- Trocar `confirm()` por um modal bonito de confirmação.
- Usar IndexedDB ou o Firebase (seção 7).
- Ordenar os cards por data ou prioridade.
- Botão "Exportar JSON" para baixar os dados.
- Modo escuro.
