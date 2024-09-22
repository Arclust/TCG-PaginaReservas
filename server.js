// Importar las dependencias necesarias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 

// Crear una instancia de la aplicación Express
const app = express();
app.use(cors());
app.use(express.json());  // Para procesar JSON en solicitudes POST

// Configurar la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',     
  user: 'root',          
  password: 'jajablabla123',
  database: 'tcg-reservasdb'
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error conectandose a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

// Ruta de prueba para verificar que el servidor esté funcionando
app.get('/', (req, res) => {
  res.send('Servidor y base de datos conectados correctamente');
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

// Ruta para obtener eventos de un día específico
app.get('/eventos/:fecha', (req, res) => {
  const fecha = req.params.fecha; 
  const query = 'SELECT * FROM evento WHERE DATE(fecha_evento) = ?'; 
  
  connection.query(query, [fecha], (err, results) => {
    if (err) {
      console.error('Error ejecutando la consulta:', err);
      res.status(500).send('Error en la consulta');
      return;
    }
    res.json(results);
  });
});

// Inscribir usuario a un evento
app.post('/inscribir/:ID_evento', (req, res) => {
  const { correo_usuario, ID_evento } = req.body;
  
  const query = 'INSERT INTO participacion (correo_usuario, ID_evento) VALUES (?, ?)';
  connection.query(query, [correo_usuario, ID_evento], (err, results) => {
    if (err) {
      console.error('Error al inscribir usuario:', err);
      res.status(500).json({ error: 'Error al inscribir usuario' });
      return;
    }
    res.json({ message: 'Usuario inscrito correctamente' });
  });
});



// Crear un nuevo evento
app.post('/crear-evento', (req, res) => {
  const { titulo_evento, descripcion_evento, juego_evento, fecha_evento } = req.body;
  
  const query = 'INSERT INTO evento (titulo_evento, descripcion_evento, juego_evento, fecha_evento) VALUES (?, ?, ?, ?)';
  connection.query(query, [titulo_evento, descripcion_evento, juego_evento, fecha_evento], (err, results) => {
    if (err) {
      console.error('Error al crear evento:', err);
      res.status(500).json({ error: 'Error al crear evento' });
      return;
    }
    res.json({ message: 'Evento creado correctamente' });
  });
});

// Crear un nuevo usuario
app.post('/crear-usuario', (req, res) => {
  const { nombre_usuario, correo_usuario, tipo_usuario } = req.body;

  if (!nombre_usuario || !correo_usuario || typeof tipo_usuario !== 'number') {
    res.status(400).json({ error: 'Todos los campos son requeridos y tipo_usuario debe ser un número' });
    return;
  }

  const query = 'INSERT INTO usuario (nombre_usuario, correo_usuario, tipo_usuario) VALUES (?, ?, ?)';
  connection.query(query, [nombre_usuario, correo_usuario, tipo_usuario], (err, results) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      res.status(500).json({ error: 'Error al crear usuario' });
      return;
    }
    res.json({ message: 'Usuario creado correctamente', userId: results.insertId });
  });
});

// Eliminar una cuenta de usuario
app.delete('/eliminar-usuario/:correo_usuario', (req, res) => {
  const correo_usuario = req.params.correo_usuario;
  
  console.log("Correo recibido para eliminar:", correo_usuario); // Añadir este log

  const query = 'DELETE FROM usuario WHERE correo_usuario = ?';
  connection.query(query, [correo_usuario], (err, results) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      res.status(500).json({ error: 'Error al eliminar usuario' });
      return;
    }

    console.log("Resultados de la eliminación:", results); // Añadir este log

    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
    } else {
      res.json({ message: 'Usuario eliminado correctamente' });
    }
  });
});

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
