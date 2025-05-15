require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const statesRoutes = require('./routes/states');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

app.use(cors());
app.use(express.json());

app.use('/states', statesRoutes);

app.get('/', (req, res) => {
  res.send('<h1>US States API</h1>');
});

app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).send('<h1>404 Not Found</h1>');
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).type('txt').send('404 Not Found');
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));