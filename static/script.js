document.querySelector('form').addEventListener('submit', function() {
    const btn = document.querySelector('button');
    btn.innerHTML = 'Buscando...';
    btn.style.opacity = '0.7';
});
// static/js/script.js
const tempElement = document.querySelector('.temp-main');
if (tempElement) {
    const temp = parseInt(tempElement.innerText);
    const body = document.body;

    if (temp > 30) {
        body.style.background = "linear-gradient(135deg, #f59e0b, #ef4444)"; // Quente (Laranja/Vermelho)
    } else if (temp < 15) {
        body.style.background = "linear-gradient(135deg, #3b82f6, #1e3a8a)"; // Frio (Azul)
    }
}