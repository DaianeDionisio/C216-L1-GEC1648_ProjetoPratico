from flask import Flask, render_template, request, redirect, url_for, jsonify
import requests
import os

app = Flask(__name__)

# Definindo as variáveis de ambiente
API_BASE_URL = os.getenv("API_BASE_URL" , "http://localhost:5000/api/v1/reserva")
API_DATABASE_RESET = os.getenv("API_DATABASE_RESET" , "http://localhost:5000/api/v1/database/reset") 

# Rota para a página inicial
@app.route('/')
def index():
    return render_template('index.html')

# Rota para exibir o formulário de cadastro
@app.route('/cadastrar', methods=['GET'])
def cadastrar_reserva_form():
    return render_template('cadastrar.html')

# Rota para enviar os dados do formulário de cadastro para a API
@app.route('/cadastrar', methods=['POST'])
def cadastrar_reserva():
    nomehospede = request.form['nomehospede']
    dataentrada = request.form['dataentrada']
    datasaida = request.form['datasaida']
    numeroquarto = request.form['numeroquarto']

    payload = {
        'nomehospede': nomehospede,
        'dataentrada': dataentrada,
        'datasaida': datasaida,
        'numeroquarto': numeroquarto
    }

    response = requests.post(f'{API_BASE_URL}/cadastrar', json=payload)
    
    if response.status_code == 201:
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao cadastrar reserva", 500

# Rota para listar todas as reservas
@app.route('/listar', methods=['GET'])
def listar_reservas():
    response = requests.get(f'{API_BASE_URL}/listar')
    reservas = response.json()
    return render_template('listar.html', reservas=reservas)

# Rota para exibir o formulário de edição da reserva
@app.route('/atualizar/<int:reserva_id>', methods=['GET'])
def atualizar_reserva_form(reserva_id):
    response = requests.get(f"{API_BASE_URL}/listar")
    #filtrando apenas a reserva correspondente ao ID
    reservas = [reserva for reserva in response.json() if reserva['id'] == reserva_id]
    if len(reservas) == 0:
        return "Reserva não encontrada", 404
    reserva = reservas[0]
    return render_template('atualizar.html', reserva=reserva)

# Rota para enviar os dados do formulário de edição da reserva para a API
@app.route('/atualizar/<int:reserva_id>', methods=['POST'])
def atualizar_reserva(reserva_id):
    nomehospede = request.form['nomehospede']
    dataentrada = request.form['dataentrada']
    datasaida = request.form['datasaida']
    numeroquarto = request.form['numeroquarto']

    payload = {
        'nomehospede': nomehospede,
        'dataentrada': dataentrada,
        'datasaida': datasaida,
        'numeroquarto': numeroquarto
    }

    response = requests.post(f"{API_BASE_URL}/atualizar", json=payload)
    
    if response.status_code == 200:
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao atualizar reserva", 500

# Rota para excluir uma reserva
@app.route('/excluir/<int:reserva_id>', methods=['POST'])
def excluir_reserva(reserva_id):
    payload = {'id': reserva_id}

    response = requests.post(f"{API_BASE_URL}/excluir", json=payload)
    
    if response.status_code == 200  :
        return redirect(url_for('listar_reservas'))
    else:
        return "Erro ao excluir reserva", 500

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