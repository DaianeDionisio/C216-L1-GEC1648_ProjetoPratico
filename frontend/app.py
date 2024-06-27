from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import requests
import os

app = Flask(__name__)

# Definindo as variáveis de ambiente
API_BASE_URL = os.getenv("API_BASE_URL" , "http://localhost:5000/api/v1/reserva")
API_BASE_URL_QUARTO = os.getenv("API_BASE_URL_QUARTO" , "http://localhost:5000/api/v1/quarto")
API_DATABASE_RESET = os.getenv("API_DATABASE_RESET" , "http://localhost:5000/api/v1/database/reset") 

# Função para formatar data (filtro personalizado)
def converterDataParaDDMMAAAA(value, format='%d/%m/%Y'):
    value = datetime.fromisoformat(value)
    return value.strftime(format)

def converterDataParaAAAAMMDD(value, format='%Y-%m-%dT%H:%M:%S.%fZ'):
    # Converte a string para um objeto datetime
    value = datetime.strptime(value, format)
    # Formata a data no formato 'YYYY-MM-DD' que é aceito pelo input type="date"
    return value.strftime('%Y-%m-%d')

# Registrar o filtro no Jinja2 do Flask
app.jinja_env.filters['converterDataParaDDMMAAAA'] = converterDataParaDDMMAAAA
app.jinja_env.filters['converterDataParaAAAAMMDD'] = converterDataParaAAAAMMDD

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para exibir o formulário de cadastro de reserva
@app.route('/cadastrarReserva', methods=['GET'])
def cadastrar_reserva_form():
    return render_template('cadastrarReserva.html')

# Rota para enviar os dados do formulário de cadastro para a API
@app.route('/cadastrarReserva', methods=['POST'])
def cadastrar_reserva():
    nome_hospede = request.form['nome_hospede']
    cpf_hospede = request.form['cpf_hospede']
    num_hospedes = request.form['num_hospedes']
    data_entrada = request.form['data_entrada']
    data_saida = request.form['data_saida']
    numero_quarto = request.form['numero_quarto']

    payload = {
        'nome_hospede': nome_hospede,
        'cpf_hospede': cpf_hospede,
        'num_hospedes': num_hospedes,
        'data_entrada': data_entrada,
        'data_saida': data_saida,
        'numero_quarto': numero_quarto
    }

    # Checar se quarto está disponível e se correspondente ao número de hospedes
    requests.post(f'{API_BASE_URL}/checarQuartoDisponivel', json=payload)

    response = requests.post(f'{API_BASE_URL}/cadastrarReserva', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao cadastrar reserva", 500

# Rota para listar todas as reservas
@app.route('/listarReservas', methods=['GET'])
def listar_reservas():
    response = requests.get(f'{API_BASE_URL}/listarReservas')
    reservas = response.json()
    return render_template('listarReservas.html', reservas=reservas)

# Rota para exibir o formulário de edição da reserva
@app.route('/atualizarReserva/<int:reserva_id>', methods=['GET'])
def atualizar_reserva_form(reserva_id):
    response = requests.get(f"{API_BASE_URL}/listarReservas")
    #filtrando apenas a reserva correspondente ao ID
    reservas = [reserva for reserva in response.json() if reserva['id'] == reserva_id]
    if len(reservas) == 0:
        return "Reserva não encontrada", 404
    reserva = reservas[0]
    return render_template('atualizarReserva.html', reserva=reserva)

# Rota para enviar os dados do formulário de edição da reserva para a API
@app.route('/atualizarReserva/<int:reserva_id>', methods=['POST'])
def atualizar_reserva(reserva_id):
    nome_hospede = request.form['nome_hospede']
    cpf_hospede = request.form['cpf_hospede']
    num_hospedes = request.form['num_hospedes']
    data_entrada = request.form['data_entrada']
    data_saida = request.form['data_saida']
    numero_quarto = request.form['numero_quarto']

    payload = {
        'id': reserva_id,
        'nome_hospede': nome_hospede,
        'cpf_hospede': cpf_hospede,
        'num_hospedes': num_hospedes,
        'data_entrada': data_entrada,
        'data_saida': data_saida,
        'numero_quarto': numero_quarto
    }

    response = requests.post(f"{API_BASE_URL}/atualizarReserva", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao atualizar reserva", 500

# Rota para excluir uma reserva
@app.route('/excluirReserva/<int:reserva_id>', methods=['POST'])
def excluir_reserva(reserva_id):
    payload = {'id': reserva_id}

    response = requests.post(f"{API_BASE_URL}/excluirReserva", json=payload)
    
    if response.status_code == 200  :
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao excluir reserva", 500
    
# Rota para exibir o formulário de registro de quarto
@app.route('/registrarQuarto', methods=['GET'])
def registrar_quarto_form():
    return render_template('registrarQuarto.html')

# Rota para enviar os dados do formulário de registro de quarto para a API
@app.route('/registrarQuarto', methods=['POST'])
def registrar_quarto():
    numero_quarto = request.form['numero_quarto']
    num_max_hospedes = request.form['num_max_hospedes']

    payload = {
        'numero_quarto': numero_quarto,
        'num_max_hospedes': num_max_hospedes
    }

    response = requests.post(f'{API_BASE_URL_QUARTO}/registrarQuarto', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_quartos'))
    else:
        return "Erro ao registrar quarto", 500

# Rota para listar todos os quartos
@app.route('/listarQuartos', methods=['GET'])
def listar_quartos():
    quartos = requests.get(f'{API_BASE_URL_QUARTO}/listarQuartos')
    quartos = quartos.json()
    return render_template('listarQuartos.html', quartos=quartos)

# Rota para exibir o formulário de edição de quarto
@app.route('/atualizarQuarto/<int:quarto_id>', methods=['GET'])
def atualizar_quarto_form(quarto_id):
    response = requests.get(f"{API_BASE_URL_QUARTO}/listarQuartos")
    #filtrando apenas a reserva correspondente ao ID
    quartos = [quarto for quarto in response.json() if quarto['id'] == quarto_id]
    if len(quartos) == 0:
        return "Quarto não encontrado", 404
    quarto = quartos[0]
    return render_template('atualizarQuarto.html', quarto=quarto)

# Rota para enviar os dados do formulário de edição da reserva para a API
@app.route('/atualizarQuarto/<int:quarto_id>', methods=['POST'])
def atualizar_quarto(quarto_id):
    numero_quarto = request.form['numero_quarto']
    num_max_hospedes = request.form['num_max_hospedes']

    payload = {
        'id': quarto_id,
        'numero_quarto': numero_quarto,
        'num_max_hospedes': num_max_hospedes
    }

    response = requests.post(f"{API_BASE_URL_QUARTO}/atualizarQuarto", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_quartos'))
    else:
        return "Erro ao atualizar quarto", 500

# Rota para excluir um quarto
@app.route('/excluirQuarto/<int:quarto_id>', methods=['POST'])
def excluir_quarto(quarto_id):
    payload = {'id': quarto_id}

    response = requests.post(f"{API_BASE_URL_QUARTO}/excluirQuarto", json=payload)
    
    if response.status_code == 200  :
        return redirect(url_for('listar_quartos'))
    else:
        return "Erro ao excluir quarto", 500

# Rota para buscar quartos disponiveis
@app.route('/buscarQuartosDisponiveis', methods=['POST'])
def buscar_quarto_disponivel():
    num_hospedes = request.form['num_hospedes']
    data_entrada = request.form['data_entrada']
    data_saida = request.form['data_saida']

    payload = {
        'num_hospedes': num_hospedes,
        'data_entrada': data_entrada,
        'data_saida': data_saida
    }

    response = requests.post(f'{API_BASE_URL}/buscarQuartosDisponiveis', json=payload)
    
    if response.status_code == 201:
        return response
    else:
        return "Erro ao buscar quartos disponíveis", 500
    

#Rota para resetar o database
@app.route('/reset-database', methods=['GET'])
def resetar_database():
    response = requests.delete(API_DATABASE_RESET)
    
    if response.status_code == 200  :
        return redirect(url_for('index'))
    else:
        return "Erro ao resetar o database", 500


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')