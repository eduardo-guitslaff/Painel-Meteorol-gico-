import os
import requests
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    weather_now = None
    forecast_list = []
    
    # Captura a cidade do formulário (POST) ou da URL (GET)
    # O args.get('city') é fundamental para o redirecionamento da geolocalização
    city = request.form.get('city') or request.args.get('city')
    api_key = os.getenv("API_KEY")

    if city:
        # 1. URL para o clima ATUAL
        url_now = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=pt_br"
        # 2. URL para a PREVISÃO de 5 dias
        url_forecast = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric&lang=pt_br"
        
        try:
            res_now = requests.get(url_now).json()
            res_forecast = requests.get(url_forecast).json()

            if res_now.get('cod') == 200:
                # Monta os dados atuais e cria a classe CSS baseada na descrição
                weather_now = {
                    'city': res_now['name'],
                    'temp': res_now['main']['temp'],
                    'description': res_now['weather'][0]['description'],
                    'icon': res_now['weather'][0]['icon'],
                    'humidity': res_now['main']['humidity'],
                    'wind': res_now['wind']['speed'],
                    'description_class': res_now['weather'][0]['description'].replace(" ", "-").lower()
                }
                
                # Pega a previsão para os próximos períodos (índices 8 e 16 representam aprox. 24h e 48h)
                indices = [8, 16]
                dias_nomes = ["Amanhã", "Depois de Amanhã"]
                for i, idx in enumerate(indices):
                    if len(res_forecast.get('list', [])) > idx:
                        item = res_forecast['list'][idx]
                        forecast_list.append({
                            'dia': dias_nomes[i],
                            'temp_max': item['main']['temp_max'],
                            'temp_min': item['main']['temp_min'],
                            'icon': item['weather'][0]['icon'],
                            'desc': item['weather'][0]['description']
                        })
            else:
                weather_now = {'error': 'Cidade não encontrada.'}
                
        except Exception as e:
            weather_now = {'error': 'Erro de conexão com a API.'}

    return render_template('index.html', weather=weather_now, forecast=forecast_list)

@app.route('/coords', methods=['POST'])
def coords():
    """ Rota que recebe latitude e longitude e retorna o nome da cidade """
    data = request.get_json()
    lat = data.get('lat')
    lon = data.get('lon')
    api_key = os.getenv("API_KEY")
    
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=pt_br"
    
    try:
        res = requests.get(url).json()
        if res.get('cod') == 200:
            # Retornamos apenas o nome para o JS fazer o redirecionamento
            return jsonify({"city": res['name']})
        return jsonify({"error": "Localização não encontrada"}), 400
    except:
        return jsonify({"error": "Erro no servidor"}), 500

if __name__ == '__main__':
    app.run(debug=True)
