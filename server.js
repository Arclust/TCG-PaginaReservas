// Importar las dependencias necesarias
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');  // Necesario para las sesiones
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ejs = require('ejs');
const authRoutes = require('./routes/auth-routes.js');
const { connect } = require('http2');

var permisos = false;
// Crear una instancia de la aplicación Express
const app = express();
app.use(express.json());

app.set('view engine','ejs');
app.set('auth',authRoutes)
app.use(express.static(__dirname));


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
    // Extraer el correo electrónico del perfil
    const email = profile.emails?.[0].value || '';
    const nombre = profile.displayName || '';
    const foto = profile.photos?.[0].value || '';
    const numero = profile.phoneNumbers?.[0].value || '';

    // Consultar la base de datos para verificar si el usuario ya existe
    const query = 'SELECT * FROM usuario WHERE correo_usuario = ?';
    connection.query(query, [email], (err, results) => {
      if (err) {
        return done(err);
      }

      if (results.length > 0) {
        // Si el usuario existe, continuar con el proceso de login
        return done(null, results[0]);
      } else {
        // Si el usuario no existe, registrarlo en la base de datos
        const insertQuery = 'INSERT INTO usuario (nombre_usuario, correo_usuario, tipo_usuario, numero_usuario, urlfoto_usuario) VALUES (?, ?, ?, ?, ?)';
        connection.query(insertQuery, [nombre, email, 0, numero, foto], (err, results) => {
          if (err) {
            return done(err);
          }

          // Obtener el usuario recién registrado y continuar con el proceso de login
          const newUser = {
            id: results.insertId,
            nombre_usuario: nombre,
            correo_usuario: email,
            tipo_usuario: 0, // Definir el tipo de usuario
            numero_usuario: numero,
            urlfoto_usuario: foto
          };
          return done(null, newUser);
        });
      }
    });
  }
));


// Ruta de prueba para verificar que el servidor esté funcionando
app.get('/', (req, res) => {
  if (req.isAuthenticated() &&  req.user.tipo_usuario==1){
    permisos = true;
  } else {
    permisos = false;
  }
  res.render('index',{permisos});
});

// Serialización y deserialización del usuario para mantener la sesión
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use(cors());


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});



// Rutas de autenticación con Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email', 'phone'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Redirigir a la página principal o al perfil después de autenticarse con éxito
    res.redirect('/profile');
  }
);

// Ruta para mostrar perfil solo si el usuario está autenticado
app.get('/profile', async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const correo = req.user.correo_usuario;
      const [results1] = await connection.promise().query('SELECT * FROM credencial WHERE correo_usuario = ?', [correo]);
      const [results2] = await connection.promise().query('SELECT * FROM compra WHERE correo_usuario = ?', [correo]);
      const credenciales = results1;
      const compras = results2;
      const data = {
        user: req.user,
        credenciales: credenciales,
        compras: compras
      };
      console.log(data.compras);
      console.log(data.credenciales);
      res.render('profile', data);  // Renderizar la vista perfil con el total
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener las credenciales' });
    }
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login'); // Renderiza la vista de inicio de sesión
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

//Obtener los eventos de una fecha especifica
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

// Inscribir usuario a un evento desde admin
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

app.use(express.urlencoded({ extended: false }));

app.get('/create', (req, res) => {
  res.render('create'); // Renderiza la vista de creacion
});

app.post('/create', async (req,res) =>  {
  const { titulo_evento, juego_evento, descripcion_evento, fecha_evento, cupos_evento, precio_evento, repetir_evento } = req.body;
  console.log(req.body)
  
  const query = 'INSERT INTO evento (titulo_evento, juego_evento, descripcion_evento, fecha_evento, cupos_evento, precio_evento, repetir_evento) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  connection.query(query, [titulo_evento, juego_evento, descripcion_evento, fecha_evento, cupos_evento, precio_evento, repetir_evento], (err, results) => {
    if (err) {
      console.error('Error al crear evento:', err);
      res.status(500).json({ error: 'Error al crear evento' });
      return;
    }
    res.json({ message: 'Evento creado correctamente' });
  });
});

// Inscribir usuario a un evento desde usuario
app.post('/inscribir-usuario/:ID_evento', async (req, res) => {
  const data = [
    req.user.correo_usuario,
    req.params.ID_evento,
    req.body.credencial_inscripcion
  ];
  console.log(data);

  // Inserta la participación en la base de datos
  const query = 'INSERT INTO participacion (correo_usuario, ID_evento, numero_credencial) VALUES (?, ?, ?)';
  connection.query(query, data, (err) => {
    if (err) {
      console.error('Error al inscribir al usuario:', err);
      return res.status(500).send('Error al inscribir al usuario');
    }

    // Redirige o muestra un mensaje de éxito
    res.send('Te has inscrito exitosamente al evento.');
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

app.get('/evento/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.render('login'); // Si no está autenticado, renderizar la vista de login
  }
  
  
  const eventId = req.params.id;
  const correo = req.user.correo_usuario;
  console.log(eventId);

  // Verificar si el usuario está autenticado
  

  try {
    // Consulta la base de datos
    const [results1] = await connection.promise().query('SELECT * FROM evento WHERE ID_evento = ?', [eventId]);
    const [results2] = await connection.promise().query('SELECT * FROM credencial WHERE correo_usuario = ?', [correo]);

    console.log(results2);

    const query = 'SELECT * FROM evento WHERE ID_evento = ?';
    connection.query(query, [eventId], (err, results) => {
      if (err) {
        console.error('Error al obtener el evento:', err);
        return res.status(500).send('Error al obtener el evento');
      }

      if (results.length === 0) {
        return res.status(404).send('Evento no encontrado');
      }
      console.log(req.user);
      // Renderiza la vista del evento y pasa el evento y el usuario autenticado
      res.render('event', {
        evento: results1[0],
        credenciales: results2,
        user: req.user || null // Pasa el usuario si está autenticado, de lo contrario pasa null
      });
    });
  } catch (error) {
    console.error('Error en la consulta:', error);
    res.status(500).send('Error en la consulta');
  }
});


// Obtener información del usuario autenticado
app.get('/api/usuario', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user); // Retorna los datos del usuario en sesión
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.get('/credenciales', async (req, res) => {
  const { correo } = req.query;

  try {
    const [results] = await pool.promise().query('SELECT COUNT(*) as total_credenciales FROM credenciales WHERE correo_usuario = ?', [correo]);
    const total = results[0].total_credenciales;
    res.json({ total_credenciales: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el conteo de credenciales' });
  }
});