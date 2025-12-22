const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGO_URI } = require('./config');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Record = require('./models/Record');
const Appointment = require('./models/Appointment');
async function run(){
  await mongoose.connect(MONGO_URI);
  console.log('Connected to db for seeding');
  await User.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});
  await Record.deleteMany({});
  await Appointment.deleteMany({});
  const pass = await bcrypt.hash('password123',10);

  // Create admin
  const admin = await User.create({ email:'admin@example.com', passwordHash:pass, role:'admin', name:'Admin User' });

  // Create 5 doctors
  const doctorData = [
    { email:'dr.john@example.com', name:'Dr John Smith', specialization:'General Medicine' },
    { email:'dr.sara@example.com', name:'Dr Sara Johnson', specialization:'Cardiology' },
    { email:'dr.mike@example.com', name:'Dr Mike Brown', specialization:'Orthopedics' },
    { email:'dr.lisa@example.com', name:'Dr Lisa Davis', specialization:'Pediatrics' },
    { email:'dr.david@example.com', name:'Dr David Wilson', specialization:'Dermatology' }
  ];
  const doctors = [];
  for(let d of doctorData){
    const user = await User.create({ email:d.email, passwordHash:pass, role:'doctor', name:d.name });
    const doctor = await Doctor.create({ user: user._id, specialization:d.specialization, contact:'+3876112345' + (doctors.length+1) });
    doctors.push({ user, doctor });
  }

  // Create 10 patients
  const patientData = [
    { email:'jane.patient@example.com', name:'Jane Patient', dob:'1990-05-12', gender:'female', citizenId:'123456789' },
    { email:'bob.patient@example.com', name:'Bob Patient', dob:'1985-03-20', gender:'male', citizenId:'987654321' },
    { email:'alice.patient@example.com', name:'Alice Patient', dob:'1992-07-15', gender:'female', citizenId:'456789123' },
    { email:'charlie.patient@example.com', name:'Charlie Patient', dob:'1980-11-08', gender:'male', citizenId:'789123456' },
    { email:'diana.patient@example.com', name:'Diana Patient', dob:'1995-01-25', gender:'female', citizenId:'321654987' },
    { email:'eve.patient@example.com', name:'Eve Patient', dob:'1988-09-30', gender:'female', citizenId:'654987321' },
    { email:'frank.patient@example.com', name:'Frank Patient', dob:'1975-12-05', gender:'male', citizenId:'147258369' },
    { email:'grace.patient@example.com', name:'Grace Patient', dob:'1998-04-18', gender:'female', citizenId:'963852741' },
    { email:'henry.patient@example.com', name:'Henry Patient', dob:'1982-06-22', gender:'male', citizenId:'852741963' },
    { email:'ivy.patient@example.com', name:'Ivy Patient', dob:'1993-08-10', gender:'female', citizenId:'741963852' }
  ];
  const patients = [];
  for(let p of patientData){
    const user = await User.create({ email:p.email, passwordHash:pass, role:'patient', name:p.name });
    const patient = await Patient.create({ user: user._id, uniqueCitizenIdentifier: p.citizenId, dob: new Date(p.dob), gender:p.gender, contact:'+3876123456' + (patients.length+1) });
    patients.push({ user, patient });
  }

  // Create records for some patients
  const recordTitles = ['Initial Checkup', 'Follow-up Visit', 'Blood Test', 'X-Ray', 'Consultation', 'Vaccination'];
  const recordDescriptions = ['All good', 'Minor issues', 'Needs medication', 'Further tests required', 'Healthy', 'Routine check'];
  for(let i = 0; i < 20; i++){
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const rec = await Record.create({
      patient: patient.patient._id,
      doctor: doctor.doctor._id,
      title: recordTitles[Math.floor(Math.random() * recordTitles.length)],
      description: recordDescriptions[Math.floor(Math.random() * recordDescriptions.length)],
      files:[]
    });
    patient.patient.records.push(rec._id);
    await patient.patient.save();
  }

  // Create appointments
  for(let i = 0; i < 15; i++){
    const patient = patients[Math.floor(Math.random() * patients.length)];
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const daysAhead = Math.floor(Math.random() * 30) + 1;
    const slot = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    slot.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9-16 hours
    await Appointment.create({ patient: patient.patient._id, doctor: doctor.doctor._id, slot });
  }

  console.log('Seed complete. Created:', { admin: 1, doctors: doctors.length, patients: patients.length, records: 20, appointments: 15 });
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });
