CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  nome_hospede VARCHAR(255) NOT NULL,
  cpf_hospede VARCHAR(255) NOT NULL,
  num_hospedes INT NOT NULL,
  data_entrada DATE NOT NULL,
  data_saida DATE NOT NULL,
  numero_quarto VARCHAR(255) NOT NULL
);

CREATE TABLE quartos (
  id SERIAL PRIMARY KEY,
  numero_quarto VARCHAR(255) NOT NULL,
  num_max_hospedes INT NOT NULL
);