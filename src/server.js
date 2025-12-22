const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const { PORT, MONGO_URI } = require('./config');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const dashboardRoutes = require('./routes/dashboard');
const doctorRoutes = require('./routes/doctors');
const recordRoutes = require('./routes/records');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/appointments', appointmentRoutes);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });
