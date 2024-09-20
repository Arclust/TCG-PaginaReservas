// Importar las dependencias necesarias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Me daba dramas, instalarlo lo arreglo


// Crear una instancia de la aplicación Express
const app = express();
app.use(cors());


// Configurar la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',     
  user: 'root',          //usuario de MariaBd
  password: 'jajablabla123',  //contraseña
  database: 'tcg-reservasdb' //nombre base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectandose a tecitos:', err);
    return;
  }
  console.log('Conectado a bd tecitos');
});



// Ruta de prueba para verificar que el servidor esté funcionando
app.get('/', (req, res) => {
  res.send('Servidor y base de datos conectados correctamente');
});



//ruta de ejemplo para obtener datos de la base de datos
app.get('/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuario'; // Reemplazar segun el query necesario
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});



// Ruta para obtener todos los usuarios de la tabla 'usuario'
app.get('/usuarios', (req, res) => {
    const query = 'SELECT * FROM usuario'; 
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).send('Error en la consulta');
        return;
      }
      res.json(results);
    });
  });

// Nueva ruta para obtener eventos de un día específico
app.get('/eventos/:fecha', (req, res) => {
    const fecha = req.params.fecha; // La fecha es enviada desde el frontend
  
    // Consulta de eventos para la fecha dada
    const query = 'SELECT * FROM evento WHERE DATE(fecha_evento) = ?'; // Asumiendo que la tabla es 'eventos' y tiene una columna 'fecha'
  
    connection.query(query, [fecha], (err, results) => {
      if (err) {
        console.error('Error ejecutando la consulta:', err);
        res.status(500).send('Error en la consulta');
        return;
      }
  
      // Enviar los resultados como JSON
      res.json(results);
    });
  });


// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
