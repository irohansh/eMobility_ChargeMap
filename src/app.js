const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:5173'
    ],
    credentials: true
}));

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('ChargeMap API is running successfully!'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));