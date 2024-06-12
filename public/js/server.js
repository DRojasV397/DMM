import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
const port = 1234;

const config = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '1234',
  database: 'tourtales'
};

app.get('/usuarios', async (req, res) => {
  try {
    const connection = await mysql.createConnection(config);
    const [rows, fields] = await connection.query('SELECT id, Nombre, Apellido FROM usuario_turista');
    res.json(rows);
    await connection.end();
  } catch (error) {
    res.status(500).send('Error en el servidor: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
