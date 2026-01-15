const mongoose = require('mongoose');
require('dotenv').config();

// exports.connect = () => {
//     mongoose.connect(process.env.MONGODB_URI, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }).then(() => {
//         console.log('Database connection successful');
//     }).catch((err) => {
//         console.error('Database connection error:', err);
//         process.exit(1);
//     });
// };

// new way of setting up mongoose connection
exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Stop the app if DB fails
    }
};