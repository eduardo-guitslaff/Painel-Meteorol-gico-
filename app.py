import os
import requests
from flask import Flask, render_template, request
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    weather_now = None
    forecast_list = []
    
    if request.method == 'POST':
        city = request.form.get('city')
        api_key = os.getenv("API_KEY") 
        
        # 1. Busca Clima ATUAL
        url_now = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric&lang=pt_br"
        # 2. Busca PREVISÃO
        url_forecast = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric&lang=pt_br"
        
        try:
            res_now = requests.get(url_now).json()
            res_forecast = requests.get(url_forecast).json()

            if res_now.get('cod') == 200:
                # Dados de AGORA
                weather_now = {
                    'city': res_now['name'],
                    'temp': res_now['main']['temp'],
                    'description': res_now['weather'][0]['description'],
                    'icon': res_now['weather'][0]['icon'],
                    'humidity': res_now['main']['humidity'],
                    'wind': res_now['wind']['speed']
                }
                
                # Dados dos PRÓXIMOS DIAS (Amanhã e Depois)
                # Pegamos o índice 8 (24h depois) e 16 (48h depois)
                indices = [8, 16]
                dias_nomes = ["Amanhã", "Depois de Amanhã"]
                for i, idx in enumerate(indices):
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
        except:
            weather_now = {'error': 'Erro de conexão.'}

    return render_template('index.html', weather=weather_now, forecast=forecast_list)

if __name__ == '__main__':
    app.run(debug=True)