require('../Code_D-B/node_modules/dotenv').config({path: '../Code_D-B/.env'});
const jwt = require('../Code_D-B/node_modules/jsonwebtoken');
const axios = require('../Code_D-B/node_modules/axios');

const mongoose = require('../Code_D-B/node_modules/mongoose');
const User = require('../Code_D-B/src/models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const hod = await User.findOne({ role: 'hod' });
    if (!hod) throw new Error('No HOD found in DB');

    const token = jwt.sign({ id: hod._id, role: 'hod' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await axios.get('http://localhost:5000/api/v1/hod/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS! Resulting JSON:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  } finally {
    mongoose.disconnect();
  }
}
test();
