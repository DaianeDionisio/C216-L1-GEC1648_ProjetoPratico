const restify = require('restify');
const { Pool } = require('pg');

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres', // Usuário do banco de dados
    host: process.env.POSTGRES_HOST || 'db', // Este é o nome do serviço do banco de dados no Docker Compose
    database: process.env.POSTGRES_DB || 'reservas',
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
        await pool.query('DROP TABLE IF EXISTS quartos');
        
        await pool.query('CREATE TABLE IF NOT EXISTS reservas (id SERIAL PRIMARY KEY, nome_hospede VARCHAR(255) NOT NULL, cpf_hospede VARCHAR(255) NOT NULL, num_hospedes VARCHAR(255) NOT NULL, data_entrada DATE NOT NULL, data_saida DATE NOT NULL, numero_quarto VARCHAR(255) NOT NULL)');
        await pool.query('CREATE TABLE IF NOT EXISTS quartos (id SERIAL PRIMARY KEY, numero_quarto VARCHAR(255) NOT NULL, num_max_hospedes VARCHAR(255) NOT NULL)');
        
        await pool.query(`
            INSERT INTO quartos (numero_quarto, num_max_hospedes)
            VALUES 
            ('101A', '2'),
            ('102A', '2'),
            ('103A', '2'),
            ('201A', '3'),
            ('202A', '3'),
            ('203A', '4'),
            ('301A', '4'),
            ('302A', '4'),
            ('303A', '4')
        `);

        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao iniciar o banco de dados, tentando novamente em 5 segundos:', error);
        setTimeout(initDatabase, 5000);
    }
}

// Middleware para permitir o parsing do corpo da requisição
server.use(restify.plugins.bodyParser());

server.post('/api/v1/reserva/cadastrarReserva', async (req, res, next) => {
    const { nome_hospede, cpf_hospede, num_hospedes, data_entrada, data_saida, numero_quarto } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO reservas (nome_hospede, cpf_hospede, num_hospedes, data_entrada, data_saida, numero_quarto) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [nome_hospede, cpf_hospede, num_hospedes, data_entrada, data_saida, numero_quarto]
        );
        res.send(201, result.rows[0]);
        console.log('Reserva cadastrada com sucesso:', result.rows[0]);
    } catch (error) {
        console.error('Erro ao cadastrar reserva:', error);
        res.send(500, { message: 'Erro ao cadastrar reserva' });
    }

    return next();
});

server.get('/api/v1/reserva/listarReservas', async  (req, res, next) => {
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

server.post('/api/v1/reserva/atualizarReserva', async (req, res, next) => {
    const { nome_hospede, cpf_hospede, num_hospedes, data_entrada, data_saida, numero_quarto, id } = req.body;

    try {
        const result = await pool.query(
          'UPDATE reservas SET nome_hospede = $1, cpf_hospede = $2, num_hospedes = $3, data_entrada = $4, data_saida = $5, numero_quarto = $6 WHERE id = $7 RETURNING *',
          [nome_hospede, cpf_hospede, num_hospedes, data_entrada, data_saida, numero_quarto, id]
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

server.post('/api/v1/reserva/excluirReserva', async (req, res, next) => {
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

server.post('/api/v1/quarto/registrarQuarto', async (req, res, next) => {
    const { numero_quarto, num_max_hospedes } = req.body;

    try {
        const result = await pool.query(
          'INSERT INTO quartos (numero_quarto, num_max_hospedes) VALUES ($1, $2) RETURNING *',
          [numero_quarto, num_max_hospedes]
        );
        res.send(201, result.rows[0]);
        console.log('Quarto registrado com sucesso:', result.rows[0]);
    } catch (error) {
        console.error('Erro ao registrar quarto:', error);
        res.send(500, { message: 'Erro ao registrar quarto' });
    }

    return next();
});

server.get('/api/v1/quarto/listarQuartos', async  (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM quartos');
        res.send(result.rows);
        console.log('Quartos encontrados:', result.rows);
    } catch (error) {
        console.error('Erro ao listar quartos:', error);
        res.send(500, { message: 'Erro ao listar quartos' });
    }
    
      return next();
});

server.post('/api/v1/quarto/atualizarQuarto', async (req, res, next) => {
    const { numero_quarto, num_max_hospedes, id } = req.body;

    try {
        const result = await pool.query(
          'UPDATE quartos SET numero_quarto = $1, num_max_hospedes = $2 WHERE id = $3 RETURNING *',
          [numero_quarto, num_max_hospedes, id]
        );
        if (result.rowCount === 0) {
          res.send(404, { message: 'Quarto não encontrado' });
        } else {
          res.send(200, result.rows[0]);
          console.log('Quarto atualizado com sucesso:', result.rows[0]);
        }
    } catch (error) {
        console.error('Erro ao atualizar quarto:', error);
        res.send(500, { message: 'Erro ao atualizar quarto' });
    }

    return next();
});

server.post('/api/v1/quarto/excluirQuarto', async (req, res, next) => {
    const { id } = req.body;

    try {
        const result = await pool.query('DELETE FROM quartos WHERE id = $1', [id]);
        if (result.rowCount === 0) {
          res.send(404, { message: 'Quarto não encontrado' });
        } else {
          res.send(200, { message: 'Quarto deletado com sucesso' });
          console.log('Quarto deletado com sucesso');
        }
    } catch (error) {
        console.error('Erro ao deletar quarto:', error);
        res.send(500, { message: 'Erro ao deletar quarto' });
    }

    return next();
});

server.post('/api/v1/reserva/buscarQuartosDisponiveis', async (req, res, next) => {
    const { num_hospedes, data_entrada, data_saida, id } = req.body;

    try {
        let quartosQueCorrespondemAoNumeroDeHospedes = await pool.query(
          'SELECT * FROM quartos WHERE num_max_hospedes >= $1',
          [num_hospedes]
        );

        let quartosDisponiveis = [];

        await Promise.all(quartosQueCorrespondemAoNumeroDeHospedes.rows.map(async quarto => {
            const numero_quarto = quarto.numero_quarto;

            try {
                // Verifica se há reservas que ocupam o quarto nas datas solicitadas
                let result;
                if (id) {
                    result = await pool.query(`
                        SELECT *
                        FROM reservas
                        WHERE numero_quarto = $1
                        AND (
                            (data_entrada <= $2 AND data_saida > $2) OR
                            (data_entrada < $3 AND data_saida >= $3) OR
                            (data_entrada >= $2 AND data_saida <= $3)
                        ) AND id != $4
                    `,
                    [numero_quarto, data_entrada, data_saida, id]);
                } else {
                    result = await pool.query(`
                        SELECT *
                        FROM reservas
                        WHERE numero_quarto = $1
                        AND (
                            (data_entrada <= $2 AND data_saida > $2) OR
                            (data_entrada < $3 AND data_saida >= $3) OR
                            (data_entrada >= $2 AND data_saida <= $3)
                        )
                    `,
                    [numero_quarto, data_entrada, data_saida]);
                }

                // Se não houver reservas que ocupem o quarto nas datas solicitadas, adiciona à lista de quartos disponíveis
                if (result.rows.length === 0) {
                    quartosDisponiveis.push(numero_quarto);
                }
            } catch (error) {
                console.error(`Erro ao verificar disponibilidade do quarto ${numero_quarto}:`, error);
                throw error; // Lança o erro para ser capturado pelo bloco catch externo
            }
        }));

        res.send(200,quartosDisponiveis); // Retorna a lista de quartos disponíveis como um array simples
        console.log('Quartos disponíveis:', quartosDisponiveis);
    } catch (error) {
        console.error('Erro ao buscar quartos disponíveis:', error);
        res.send(500, { message: 'Erro ao buscar quartos disponíveis' });
    }

    return next();
});

// endpoint para resetar o banco de dados
server.del('/api/v1/database/reset', async (req, res, next) => {
    try {
        await pool.query('DROP TABLE IF EXISTS reservas');
        await pool.query('DROP TABLE IF EXISTS quartos');
        await pool.query('CREATE TABLE IF NOT EXISTS reservas (id SERIAL PRIMARY KEY, nome_hospede VARCHAR(255) NOT NULL, cpf_hospede VARCHAR(255) NOT NULL, num_hospedes VARCHAR(255) NOT NULL, data_entrada DATE NOT NULL, data_saida DATE NOT NULL, numero_quarto VARCHAR(255) NOT NULL)');
        await pool.query('CREATE TABLE IF NOT EXISTS quartos (id SERIAL PRIMARY KEY, numero_quarto VARCHAR(255) NOT NULL, num_max_hospedes VARCHAR(255) NOT NULL)');
      
        await pool.query(`
            INSERT INTO quartos (numero_quarto, num_max_hospedes)
            VALUES 
            ('101A', '2'),
            ('102A', '2'),
            ('103A', '2'),
            ('201A', '3'),
            ('202A', '3'),
            ('203A', '4'),
            ('301A', '4'),
            ('302A', '4'),
            ('303A', '4')
        `);

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