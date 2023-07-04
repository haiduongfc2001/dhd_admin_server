const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const moment = require('moment-timezone');
// const utcVietnam = moment.tz(Date.now(), 'Asia/Ho_Chi_Minh');
// const formattedTime = utcVietnam.format('DD-MM-YYYY HH:mm:ss');

const User = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        // required: true,
    },
    password: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Number,
        required: true,
    },
    is_verified: {
        type: Number,
        default: 0,
    },
    token: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    ratedMovies: [
        {
            movie: {
                type: Schema.Types.ObjectId,
                ref: 'Movie',
            },
            rating: {
                type: Number,
                min: 1,
                max: 10
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
        }
    ]
})

// User.pre('save', function(next) {
//     this.updatedAt = Date.now();
//     next();
// });

module.exports = mongoose.model('User', User);