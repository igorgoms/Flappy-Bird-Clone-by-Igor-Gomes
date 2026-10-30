<h1 align="center">
   🐤 Flappy Bird Clone — Arcade Edition
</h1>

<p align="center">
   <em>Recriação fiel e aprimorada do lendário jogo Flappy Bird desenvolvida em HTML5 Canvas e JavaScript puro.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-Arcade%20Style-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Web%20Audio-8--Bit%20SFX-green?style=for-the-badge" alt="Web Audio" />
</p>

---

## 🎮 Sobre o Jogo

Este projeto é um clone completo e responsivo do clássico **Flappy Bird**, projetado para rodar diretamente em navegadores desktop e dispositivos móveis (smartphones e tablets).

O jogo utiliza os assets clássicos combinados com um motor de física aprimorado a 60 FPS, sintetizador sonoro retrô embutido via Web Audio API e sistema de recorde gravado localmente.

---

## ✨ Principais Melhorias Implementadas

- 🛠️ **Correção Crítica de Bugs:** Eliminado o erro de variável indefinida que impedia o jogo de executar e substituído o `setInterval` arcaico por `requestAnimationFrame` estável e suave a 60 FPS.
- 📐 **Resolução Arcade Adaptativa:** O jogo agora roda em proporção vertical árcade (420x650), eliminando o canvas gigante de 1400x800 que transbordava a tela.
- 🐦 **Física & Rotação Autêntica:** O pássaro agora inclina para cima ao bater as asas e mergulha suavemente em direção ao solo ao cair, com hitbox ajustada e justa.
- 🔊 **Efeitos Sonoros Retrô (Web Audio API):** Sons autênticos de pulo (*flap*), pontuação (*coin*), colisão (*hit*) e queda (*die*), sintetizados em tempo real sem dependência de arquivos externos e com botão liga/desliga.
- 🏆 **Sistema de Pontuação Real & Recorde:** Pontua ao ultrapassar cada cano com sucesso e armazena o recorde pessoal (*High Score*) no `localStorage`.
- 🔁 **Reinício Instantâneo:** Não é mais necessário recarregar a página (F5) ao perder. Basta pressionar <kbd>Espaço</kbd> ou tocar na tela para jogar novamente na hora.
- 📱 **Suporte Touch Completo:** Jogue confortavelmente no celular com toques na tela ou no computador usando o teclado ou o mouse.

---

## 🕹️ Controles

| Ação | Teclado | Mouse / Touch |
| :--- | :--- | :--- |
| **Bater Asas (Pular)** | <kbd>Barra de Espaço</kbd> / <kbd>▲ Seta Cima</kbd> / <kbd>W</kbd> | Clique esquerdo / Toque na tela |
| **Iniciar / Reiniciar** | <kbd>Barra de Espaço</kbd> | Clique ou Toque no botão de Game Over |
| **Ligar/Desligar Som** | Clique no botão 🔊 no canto inferior | Toque no botão 🔊 |

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/igorgoms/Flappy-Bird-Clone-by-Igor-Gomes.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd Flappy-Bird-Clone-by-Igor-Gomes
   ```

3. Abra o arquivo `index.html` em seu navegador web preferido.

---

## 👤 Autor

Desenvolvido e aprimorado por **Igor Gomes**.
- GitHub: [@igorgoms](https://github.com/igorgoms)

---

## 📄 Licença

Distribuído sob a licença MIT. Sinta-se livre para jogar, modificar e compartilhar!
