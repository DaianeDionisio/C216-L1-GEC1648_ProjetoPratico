const restify = require('restify');
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres', // Usuário do banco de dados
    host: process.env.POSTGRES_HOST || 'db', // Este é o nome do serviço do banco de dados no Docker Compose
    database: process.env.POSTGRES_DB || 'professores',
    password: process.env.POSTGRES_PASSWORD || 'password', // Senha do banco de dados
    port: process.env.POSTGRES_PORT || 5432,
});

// iniciar o servidor
var server = restify.createServer({
    name: 'C216-L1-GEC1648_ProjetoPratico',
});

// iniciar o servidor
var server = restify.createServer({
    name: 'C216-L1-GEC1648_ProjetoPratico',
});

// Iniciando o banco de dados
async function initDatabase() {
    try {
        await pool.query('DROP TABLE IF EXISTS reservas');
        await pool.query('CREATE TABLE IF NOT EXISTS reservas (id SERIAL PRIMARY KEY, nomehospede VARCHAR(255) NOT NULL, dataentrada DATE NOT NULL, datasaida DATE NOT NULL, numeroquarto INT NOT NULL)');
        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}

// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser());

server.post('/api/v1/reserva/cadastrar', async (req, res, next) => {
    const { nomehospede, dataentrada, datasaida, numeroquarto } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO reservas (nomehospede, dataentrada, datasaida, numeroquarto) VALUES ($1, $2, $3, $4) RETURNING *',
          [nomehospede, dataentrada, datasaida, numeroquarto]
        );
        res.send(201, result.rows[0]);
        console.log('Reserva cadastrada com sucesso:', result.rows[0]);
    } catch (error) {
        console.error('Erro ao cadastrar reserva:', error);
        res.send(500, { message: 'Erro ao cadastrar reserva' });
    }

    return next();
});

server.get('/api/v1/reserva/listar', async  (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM reservas');
        res.send(result.rows);
        console.log('Reservas encontradas:', result.rows);
    } catch (error) {
        console.error('Erro ao listar reservas:', error);
        res.send(500, { message: 'Erro ao listar reservas' });
    }
    
      return next();
});

server.post('/api/v1/reserva/atualizar', async (req, res, next) => {
    const { nomehospede, dataentrada, datasaida, numeroquarto, id } = req.body;

    try {
        const result = await pool.query(
          'UPDATE reservas SET nomehospede = $1, dataentrada = $2, datasaida = $3, numeroquarto = $4 WHERE id = $5 RETURNING *',
          [nomehospede, dataentrada, datasaida, numeroquarto, id]
        );
        if (result.rowCount === 0) {
          res.send(404, { message: 'Reserva não encontrada' });
        } else {
          res.send(200, result.rows[0]);
          console.log('Reserva atualizada com sucesso:', result.rows[0]);
        }
    } catch (error) {
        console.error('Erro ao atualizar reserva:', error);
        res.send(500, { message: 'Erro ao atualizar reserva' });
    }

    return next();
});

server.post('/api/v1/reserva/excluir', async (req, res, next) => {
    const { id } = req.body;

    try {
        const result = await pool.query('DELETE FROM reservas WHERE id = $1', [id]);
        if (result.rowCount === 0) {
          res.send(404, { message: 'Reserva não encontrada' });
        } else {
          res.send(200, { message: 'Reserva cancelada com sucesso' });
          console.log('Reserva cancelada com sucesso');
        }
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.send(500, { message: 'Erro ao cancelar reserva' });
    }

    return next();
});

// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res, next) => {
    try {
      await pool.query('DROP TABLE IF EXISTS reservas');
      await pool.query('CREATE TABLE IF NOT EXISTS reservas (id SERIAL PRIMARY KEY, nomehospede VARCHAR(255) NOT NULL, dataentrada DATE NOT NULL, datasaida DATE NOT NULL, numeroquarto INT NOT NULL)');
      res.send(200, { message: 'Banco de dados resetado com sucesso' });
      console.log('Banco de dados resetado com sucesso');
    } catch (error) {
      console.error('Erro ao resetar o banco de dados:', error);
      res.send(500, { message: 'Erro ao resetar o banco de dados' });
    }
  
    return next();
});

// iniciar o servidor
var port = process.env.PORT || 5000;

// configurando o CORS
server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

server.listen(port, function() {
    console.log('Servidor iniciado', server.name, ' na url http://localhost:' + port);
    console.log('Iniciando o banco de dados');
    initDatabase();
})