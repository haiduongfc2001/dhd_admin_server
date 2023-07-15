const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Movie = new Schema({
    adult: {
      type: Boolean,
      default: false,
    },
    backdrop_path: {
        type: String,
    },
    id: {
      type: Number,
    },
    title: {
        type: String,
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    genres: [
        {
            id: {
                type: String,
                // required: true
            },
            name: {
                type: String,
                // required: true
            }
        }
    ],
    poster_path: {
        type: String,
        required: true
    },
    production_companies: [
        {
            id: {
                type: Number,
            },
            logo_path: {
                type: String,
            },
            name: {
                type: String,
            },
            origin_country: {
                type: String,
            },
        }
    ],
    production_countries: [
        {
            iso_3166_1: {
                type: String,
            },
            name: {
                type: String,
            }
        }
    ],
    release_date: {
        type: Date,
    },
    status: {
        type: String,
    },
    vote_count_user: {
        type: Number,
        default: 0,
        min: 0,
    },
    vote_average_user: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    ratings: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            rating: {
                type: Number,
                min: 1,
                max: 10,
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

module.exports = mongoose.model('Movie', Movie);