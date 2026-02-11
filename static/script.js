document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const geoBtn = document.getElementById('geo-btn');
    const historyDiv = document.getElementById('history');
    const loader = document.getElementById('loader');

    // 1. Lógica do Histórico (Carregar ao iniciar)
    const carregarHistorico = () => {
        if (!historyDiv) return;
        historyDiv.innerHTML = '';
        const buscas = JSON.parse(localStorage.getItem('buscas') || '[]');
        
        buscas.forEach(cidade => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.type = 'button';
            btn.innerText = cidade;
            // Ao clicar no chip, redireciona para a busca daquela cidade
            btn.onclick = () => window.location.href = `/?city=${encodeURIComponent(cidade)}`;
            historyDiv.appendChild(btn);
        });
    };

    const salvarBusca = (cidade) => {
        if (!cidade || cidade.trim() === "") return;
        let buscas = JSON.parse(localStorage.getItem('buscas') || '[]');
        // Remove se já existir para colocar no topo
        buscas = buscas.filter(item => item.toLowerCase() !== cidade.toLowerCase());
        buscas.unshift(cidade);
        // Mantém apenas as 3 últimas
        localStorage.setItem('buscas', JSON.stringify(buscas.slice(0, 3)));
    };

    // Inicializa o histórico visual
    carregarHistorico();

    // 2. Envio do Formulário Manual
    if (form) {
        form.addEventListener('submit', function(e) {
            const cityInput = this.querySelector('input[name="city"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            
            if (cityInput.value) {
                salvarBusca(cityInput.value);
            }
            
            // Feedback visual de carregamento
            if (submitBtn) {
                submitBtn.innerHTML = 'Buscando...';
                submitBtn.disabled = true;
            }
            if (loader) loader.style.display = 'block';
            
            const containerClima = document.querySelector('.weather-current');
            if (containerClima) containerClima.style.opacity = '0.3';
        });
    }

    // 3. Geolocalização (📍 Minha Localização)
    if (geoBtn) {
        geoBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("O seu navegador não suporta geolocalização.");
                return;
            }

            geoBtn.innerHTML = '📍 Localizando...';
            geoBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    fetch('/coords', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({lat: latitude, lon: longitude})
                    })
                    .then(res => {
                        if (!res.ok) throw new Error("Erro no servidor");
                        return res.json();
                    })
                    .then(data => {
                        if (data.city) {
                            // Salva a cidade encontrada via GPS no histórico e redireciona
                            salvarBusca(data.city);
                            window.location.href = `/?city=${encodeURIComponent(data.city)}`;
                        } else {
                            throw new Error("Cidade não encontrada");
                        }
                    })
                    .catch(err => {
                        alert("Erro ao obter cidade: " + err.message);
                        geoBtn.disabled = false;
                        geoBtn.innerHTML = '📍 Minha Localização';
                    });
                },
                (error) => {
                    let msg = "Erro ao obter localização.";
                    if (error.code === 1) msg = "Por favor, permita o acesso à localização no seu navegador.";
                    alert(msg);
                    geoBtn.disabled = false;
                    geoBtn.innerHTML = '📍 Minha Localização';
                }
            );
        });
    }

    // 4. Mudança Dinâmica de Cor via Temperatura (Opcional, se não usar as classes do Python)
    const tempElement = document.querySelector('.temp-main');
    if (tempElement) {
        const temp = parseInt(tempElement.innerText);
        if (temp > 30) {
            document.body.classList.add('quente');
        } else if (temp < 15) {
            document.body.classList.add('frio');
        }
    }
});
