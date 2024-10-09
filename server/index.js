import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(cors());

const dbConfig = {
  user: 'inventory-admin@plymouthhousing.org@myfreesqldbserver8465',
  password: 'Volunteer4plymouth',
  server: 'myfreesqldbserver8465.database.windows.net',
  database: 'myFreeDB',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  }
};

app.get('/api/inventory', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig)

    let result = await pool.request().query('SELECT * FROM inventory');

    res.json(result.recordset);
  } catch (err) {
    console.log(err)
  }
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost: ${port}`)
})