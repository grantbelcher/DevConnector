const express = require('express');
const db = require('./config/db.js')
const app = express();

// Connect to DB
db.connectDB();

// Init Middleware
app.use(express.json({ extended: false }))

app.get('/', (req, res) =>  res.send('API running'))

app.use('/api/profiles', require('./routes/api/profiles.js'))

app.use('/api/auth', require('./routes/api/auth'))

app.use('/api/users', require('./routes/api/users'))

app.use('/api/posts', require('./routes/api/posts'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Connected to PORT ${PORT}`))