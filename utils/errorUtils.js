const errorHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error('Error:', error);
        
        // Errores específicos de la base de datos
        if (error.code) {
            switch (error.code) {
                case 'ER_DUP_ENTRY':
                    return res.status(400).json({ 
                        error: 'Ya existe un registro con estos datos' 
                    });
                case 'ER_NO_REFERENCED_ROW':
                    return res.status(400).json({ 
                        error: 'Referencia inválida' 
                    });
                default:
                    return res.status(500).json({ 
                        error: 'Error en la base de datos' 
                    });
            }
        }

        // Errores de autenticación
        if (!req.isAuthenticated()) {
            return res.status(401).json({ 
                error: 'No autorizado' 
            });
        }

        // Error general
        res.status(500).json({ 
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
        });
    }
};

module.exports = { errorHandler };