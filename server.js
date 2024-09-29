// Importar las dependencias necesarias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const path = require('path');
const session = require('express-session');  // Necesario para las sesiones
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Crear una instancia de la aplicación Express
const app = express();

// Configurar la sesión para manejar la autenticación
app.use(session({
  secret: 'your-secret-key',  // Cambia esto a una clave secreta más fuerte
  resave: false,
  saveUninitialized: true
}));

// Inicializar Passport y sesiones
app.use(passport.initialize());
app.use(passport.session());

// Configurar la estrategia de Google OAuth con Passport
passport.use(new GoogleStrategy({
    clientID: '842226429616-i1955a95lr4co6b2b8hi2p4si1a9vdgi.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/callback" // Asegúrate de que el callback esté correcto
  },
  function(accessToken, refreshToken, profile, done) {
    // Aquí puedes manejar el perfil del usuario autenticado
    return done(null, profile);
  }
));

// Serialización y deserialización del usuario para mantener la sesión
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(cors());

// Permitir el uso de archivos estáticos como 'index.html'
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de autenticación con Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Redirigir a la página principal o al perfil después de autenticarse con éxito
    res.redirect('/profile');
  }
);

// Ruta para mostrar perfil solo si el usuario está autenticado
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`<h1>Bienvenido ${req.user.displayName}</h1><a href="/logout">Cerrar sesión</a>`);
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

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
    console.error('Error conectándose a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

// Ruta de prueba para verificar que el servidor esté funcionando
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

  const query = 'DELETE FROM usuario WHERE correo_usuario = ?';
  connection.query(query, [correo_usuario], (err, results) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      res.status(500).json({ error: 'Error al eliminar usuario' });
      return;
    }

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
