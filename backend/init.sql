CREATE TABLE professores (
  id SERIAL PRIMARY KEY,
  nomeHospede VARCHAR(255) NOT NULL,
  dataEntrada DATE NOT NULL,
  dataSaida DATE NOT NULL,
  numeroQuarto INT NOT NULL
)