const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(process.env.CONNECT_MONGODB_LOCAL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit with failure
    }
}

module.exports = { connect }