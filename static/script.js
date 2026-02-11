// Aguarda o HTML carregar completamente
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const geoBtn = document.getElementById('geo-btn');
    const historyDiv = document.getElementById('history');
    const loader = document.getElementById('loader');

    // 1. Lógica do Histórico (Carregar ao iniciar)
    const carregarHistorico = () => {
        historyDiv.innerHTML = '';
        const buscas = JSON.parse(localStorage.getItem('buscas') || '[]');
        buscas.forEach(cidade => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.type = 'button';
            btn.innerText = cidade;
            btn.onclick = () => window.location.href = `/?city=${cidade}`;
            historyDiv.appendChild(btn);
        });
    };
    carregarHistorico();

    function salvarBusca(cidade) {
        if (!cidade) return;
        let buscas = JSON.parse(localStorage.getItem('buscas') || '[]');
        if (!buscas.includes(cidade)) {
            buscas.unshift(cidade);
            localStorage.setItem('buscas', JSON.stringify(buscas.slice(0, 3)));
        }
    }

    // 2. Envio do Formulário
    if (form) {
        form.addEventListener('submit', function(e) {
            const cityInput = this.querySelector('input[name="city"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            
            salvarBusca(cityInput.value);
            
            // Visual de carregamento
            submitBtn.innerHTML = 'Buscando...';
            submitBtn.disabled = true;
            if (loader) loader.style.display = 'block';
            
            const containerClima = document.querySelector('.weather-current');
            if (containerClima) containerClima.style.opacity = '0.3';
        });
    }

    // 3. Geolocalização (📍 Minha Localização)
    if (geoBtn) {
        geoBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert("Seu navegador não suporta geolocalização.");
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
                    .then(res => res.json())
                    .then(data => {
                        if (data.city) {
                            window.location.href = `/?city=${data.city}`;
                        } else {
                            alert("Cidade não encontrada por coordenadas.");
                            geoBtn.disabled = false;
                            geoBtn.innerHTML = '📍 Minha Localização';
                        }
                    })
                    .catch(() => {
                        alert("Erro ao conectar com o servidor.");
                        geoBtn.disabled = false;
                    });
                },
                (error) => {
                    alert("Erro ao obter localização. Verifique se o GPS está ativo e se você permitiu o acesso.");
                    geoBtn.disabled = false;
                    geoBtn.innerHTML = '📍 Minha Localização';
                }
            );
        });
    }
});
