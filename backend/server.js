require('./config/env');
const express = require('express');
const cors = require('cors');
const prisma = require('./config/db');
const authMiddleware = require('./middleware/auth');
const upload = require('./middleware/upload');

const app = express();

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests) or any origin
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(upload.uploadDir));
app.use(authMiddleware);

// Test DB connection
prisma.$connect()
    .then(() => console.log('Connected to Neon PostgreSQL via Prisma'))
    .catch(err => console.error('DB connection error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/credentials', require('./routes/credential'));
app.use('/api/portfolio', require('./routes/portfolio'));

app.use((err, req, res, next) => {
    console.error('Unhandled request error:', {
        path: req.originalUrl,
        method: req.method,
        name: err?.name,
        code: err?.code,
        message: err?.message,
        meta: err?.meta,
        stack: err?.stack
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: 'Internal Server Error',
        code: err?.code || null
    });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
module.exports = app;
