const router = require('express').Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Record = require('../models/Record');

router.get('/', auth, role(['admin']), async (req, res) => {
  const doctors = await User.countDocuments({ role: 'doctor' });
  const patients = await User.countDocuments({ role: 'patient' });
  const records = await Record.countDocuments();
  const appointments = await Appointment.countDocuments();

  res.json({
    doctors,
    patients,
    records,
    appointments,
    appointmentsPerMonth: [
      { month: 'Jan', value: 5 },
      { month: 'Feb', value: 8 },
      { month: 'Mar', value: 12 }
    ],
    recordsByType: [
      { label: 'Diagnosis', value: 10 },
      { label: 'Prescription', value: 6 },
      { label: 'Lab Result', value: 4 }
    ]
  });
});

module.exports = router;
