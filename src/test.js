// const Movie = require("./models/MovieModel/MovieModel");
// const User = require("./models/UserModel");
// router.post('/movie/:_id/rating', async (req, res) => {
//     try {
//         const {rating} = req.body;
//         const userId = req.user._id;
//
//         // Check if movie exists
//         const movieId = req.params._id;
//         const movie = await Movie.findById(movieId);
//         if (!movie) {
//             return res.status(404).json({error: 'Movie not found!'});
//         }
//
//         let sumRating = 0;
//
//         const existingRatingMovie = user.ratedMovies.find((ratedMovie) => String(ratedMovie.movie) === movieId);
//         if (existingRatingMovie) {
//             existingRatingMovie.rating = rating;
//             await user.save();
//
//             const existingRatingUser = movie.ratings.find((ratingUser) => String(ratingUser.user) === userId)
//             if (existingRatingUser) {
//                 existingRatingUser.rating = rating;
//                 for (let i = 0; i < movie.ratings.length; i++) {
//                     sumRating += movie.ratings[i].rating;
//                 }
//                 if (movie.vote_count_user !== 0) {
//                     movie.vote_average_user = (sumRating / movie.vote_count_user).toFixed(1);
//                 }
//
//                 await movie.save();
//             }
//
//             return res.status(200).json({message: 'Rating updated successfully'});
//         }
//
//         // Create a new rating
//         const newRatingMovie = {
//             movie: movieId,
//             rating: rating,
//         };
//         user.ratedMovies.push(newRatingMovie);
//         await user.save();
//
//         const newRatingUser = {
//             user: userId,
//             rating: rating,
//         };
//         movie.ratings.push(newRatingUser);
//         movie.vote_count_user += 1;
//
//         for (let i = 0; i < movie.ratings.length; i++) {
//             sumRating += movie.ratings[i].rating;
//         }
//         if (movie.vote_count_user !== 0) {
//             movie.vote_average_user = (sumRating / movie.vote_count_user).toFixed(1);
//         }
//
//         await movie.save();
//
//         res.status(200).json({message: 'Rating added successfully'});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({error: 'Server error'});
//     }
// };
