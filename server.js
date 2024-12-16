const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const storeRoutes = require('./routes/store');
const imageRoutes = require('./routes/images');
const dataRoutes = require('./routes/data');
const merchantRoutes = require('./routes/merchant');
const ipLocationRoutes = require('./routes/ipLocation');
require('dotenv').config();


delete require.cache[require.resolve('./routes/merchant')];
delete require.cache[require.resolve('./controllers/merchantController')];

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(fileUpload()); // Add this line for handling file uploads

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/ipLocation', ipLocationRoutes)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});