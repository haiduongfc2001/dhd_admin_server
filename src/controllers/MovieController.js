const Movie = require("../models/MovieModel/MovieModel");
const User = require("../models/UserModel");
const axios = require("axios");

// Tất cả movie
const AllMovies = async (req, res) => {
    // try {
    //     const movies = await Movie.find()
    //     res.json(movies);
    // } catch (error) {
    //     res.send(error.message);
    // }

    try {
        const movies = await Movie.find();
        res.json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

// Tìm movie theo id
const FindMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params._id);

        if (movie) {
            res.json(movie);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Thêm movie
const AddMovie = async (req, res) => {
    try {

        const movie = new Movie(req.body);
        await movie.save();
        res.status(200).json(movie);

    } catch (error) {
        res.send(error.message);
    }
}

// Sửa thông tin movie
const EditMovie = async (req, res) => {
    try {
        const {title, overview, poster_path} = req.body;

        const movieId = req.params._id;
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({message: 'Movie not found'});
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            movieId,
            {title, overview, poster_path},
            {new: true});

        res.status(200).json(updatedMovie);

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// Xóa movie
const DeleteMovie = async (req, res) => {
    try {
        const deleteMovie = await Movie.findOneAndRemove({_id: req.params._id});

        if (deleteMovie) {
            res.send(`Movie ${req.params._id} deleted successfully!`);
        } else {
            res.send(`Movie ${req.params._id} not found!`);
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
};

// // Delete a movie
// app.delete('/movie/:_id', (req, res) => {
//     Movie.findOneAndRemove({_id: req.params._id}).then((movie) => {
//         if (movie) {
//             res.send(`Movie ${req.params._id} deleted successfully!`);
//         } else {
//             res.send(`Movie ${req.params._id} not found!`);
//         }
//     }).catch((err) => {
//         console.error(err);
//         res.status(500).send('Error deleting movie');
//     });
// });

const AddMovieByLink = async (req, res) => {
    try {
        // const movie = new Movie(req.body);
        // await movie.save();
        // res.status(200).json(movie);

        // Access the link value from the request body
        const {link} = req.body;

        // Make a request to fetch the movie data based on the provided link
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${link}?api_key=043ea53b0f115cd3997dcbb3f8a46a1a`);
        const movieData = response.data;

        // Process the movie data and add it to your database or perform any other necessary operations
        // Replace this logic with your actual implementation to add the movie based on the provided link

        // Create a new movie instance
        const newMovie = new Movie({
            ...movieData,
        });

        // Save the movie to the database
        const savedMovie = await newMovie.save();

        // Return a success response with the saved movie data
        res.status(201).json(savedMovie);

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const RatingMovie = async (req, res) => {
    try {
        const {rating, userId} = req.body;
        // const userId = req.body;

        // const userId = '6480b15eaccd5290025c73ab';

        // Check if movie exists
        const movieId = req.params._id;
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({error: 'Movie not found!'});
        }

        // Check if user has already rated the movie
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: 'User not found!'});
        }

        let sumRating = 0;

        const existingRatingMovie = user.ratedMovies.find((ratedMovie) => String(ratedMovie.movie) === movieId);
        if (existingRatingMovie) {
            existingRatingMovie.rating = rating;
            existingRatingMovie.updatedAt = Date.now();
            await user.save({$set: {updatedAt: existingRatingMovie.updatedAt}});

            const existingRatingUser = movie.ratings.find((ratingUser) => String(ratingUser.user) === userId)
            if (existingRatingUser) {
                existingRatingUser.rating = rating;
                existingRatingUser.updatedAt = Date.now();
                for (let i = 0; i < movie.ratings.length; i++) {
                    sumRating += movie.ratings[i].rating;
                }
                if (movie.vote_count_user !== 0) {
                    movie.vote_average_user = (sumRating / movie.vote_count_user).toFixed(1);
                }

                await movie.save({$set: {updatedAt: existingRatingUser.updatedAt}});

                return res.status(200).json({message: 'Rating updated successfully', rating});
            }
        }

        // Create a new rating
        const newRatingMovie = {
            movie: movieId,
            rating: rating,
        };
        user.ratedMovies.push(newRatingMovie);
        await user.save();

        const newRatingUser = {
            user: userId,
            rating: rating,
        };
        movie.ratings.push(newRatingUser);
        movie.vote_count_user += 1; // Tăng giá trị của vote_count_user

        for (let i = 0; i < movie.ratings.length; i++) {
            sumRating += movie.ratings[i].rating;
        }
        if (movie.vote_count_user !== 0) {
            movie.vote_average_user = (sumRating / movie.vote_count_user).toFixed(1);
        }

        await movie.save();

        res.status(200).json({message: 'Rating added successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
};

const FilterMovie = async (req, res) => {
    try {

        const { genre } = req.params;

        // movie.genres.name
        // sử dụng biểu thức chính quy `regex` để tìm kiếm
        // $regex: new RegExp(genre, 'i') là một toán tử so khớp mẫu (regex) được sử dụng để tìm kiếm.
        // Chúng ta tạo một đối tượng RegExp mới bằng cách truyền biến genre vào hàm RegExp và
        // tham số 'i' để cho phép tìm kiếm không phân biệt chữ hoa chữ thường.
        const genreMovies = await Movie.find({ 'genres.name': { $regex: new RegExp(genre, 'i') } });

        if (genreMovies.length > 0) {
            res.json(genreMovies);
        } else {
            res.status(404).json({message: 'Movie not found!'});
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Server error'});
    }
}

const AllGenresOfMovies = async (req, res) => {
    try {

        const movies = await Movie.find();
        const genres = movies.reduce((result, movie) => {
            movie.genres.forEach((genre) => {
                const { id, name } = genre;
                const existingGenre = result.find((g) => g.id === id);
                if (!existingGenre) {
                    result.push({ id, name });
                }
            });
            return result;
        }, []);
        res.json(genres);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const AllProductionCompanies = async (req, res) => {
    try {

        const movies = await Movie.find();
        const productionCompanies = movies.reduce((result, movie) => {
            movie.production_companies.forEach((company) => {
                const { _id, id, name, logo_path, origin_country } = company;
                const existingCompany = result.find((c) => (c.id === id || c.name === name));
                if (!existingCompany) {
                    result.push({ _id, id, name, logo_path, origin_country });
                }
            });
            return result;
        }, []);

        res.json(productionCompanies);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}

// const AllProductionCompanies = async (req, res) => {
//     try {
//         const movies = await Movie.find();
//         const productionCompanies = Array.from(new Set(movies.flatMap(movie => movie.production_companies.map(company => ({
//             _id: company._id,
//             id: company.id,
//             name: company.name,
//             logo_path: company.logo_path,
//             origin_country: company.origin_country
//         })))));
//
//         res.json(productionCompanies);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// }




module.exports = {
    AllMovies,
    FindMovieById,
    AddMovie,
    EditMovie,
    DeleteMovie,
    AddMovieByLink,
    RatingMovie,
    // FilterActionMovie,
    FilterMovie,
    AllGenresOfMovies,
    AllProductionCompanies
}

// const FilterActionMovie = async (req, res) => {
//     try {
//
//         const actionMovies = await Movie.find({ 'genres.name': { $regex: /action/i } })
//         if (actionMovies) {
//             res.json(actionMovies);
//         } else {
//             res.status(404).json({message: 'Movie not found!'});
//         }
//
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({error: 'Server error'});
//     }
// }
