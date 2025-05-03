const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');

const updateStylistReferences = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const bookings = await Booking.find();

    for (const booking of bookings) {
      if (typeof booking.stylist === 'string') {
        const stylist = await User.findOne({ username: booking.stylist });
        if (stylist) {
          booking.stylist = stylist._id;
          await booking.save();
          console.log(`Updated booking ${booking._id} with stylist ${stylist.username}`);
        } else {
          console.warn(`No user found for stylist name: ${booking.stylist}`);
        }
      }
    }

    console.log('Stylist references updated successfully.');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating stylist references:', error);
    mongoose.disconnect();
  }
};

updateStylistReferences();