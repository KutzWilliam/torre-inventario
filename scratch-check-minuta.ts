import { Client } from 'pg';

const dbConfig = {
  host: '172.20.40.1',
  port: 5432,
  user: 'postgres',
  password: '123',
  database: 'api-torre'
};

async function check() {
  const client = new Client(dbConfig);
  await client.connect();

  const res = await client.query('SELECT origem, destino, rota FROM minuta WHERE id_minuta = 1511415');
  console.log(res.rows[0]);

  await client.end();
}

check();
