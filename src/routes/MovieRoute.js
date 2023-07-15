const express = require("express");
const movieRoute = express();

const MovieController = require("../controllers/MovieController");
const path = require("path");

const bodyParser = require("body-parser");
const Auth = require("../middleware/Auth");
movieRoute.use(bodyParser.json());
movieRoute.use(bodyParser.urlencoded({ extended: true }));

movieRoute.set("view engine", "pug");
movieRoute.set("views", path.join(__dirname, "../views"));

// movieRoute.get('/movies', (req, res) => {
//     res.render('AddMovie')
// })

movieRoute.get("/movies", MovieController.AllMovies);
movieRoute.get("/movies/filter", MovieController.FilterMoviesByGenres);
movieRoute.get("/movie/:_id", MovieController.FindMovieById);
movieRoute.post("/movie", MovieController.AddMovie);
movieRoute.put("/movie/:_id", MovieController.EditMovie);
movieRoute.delete("/movie/:_id", MovieController.DeleteMovie);
movieRoute.delete("/movies/delete-multiple", MovieController.DeleteMovies);
movieRoute.post("/movie/add-link", MovieController.AddMovieByLink);

movieRoute.post("/movie/:_id/rating", MovieController.RatingMovie);

// movieRoute.get('/movie/genre/action', MovieController.FilterActionMovie);
movieRoute.get("/movie/genre/:genre", MovieController.FilterMoviesByGenre);
movieRoute.get("/movies/genres", MovieController.AllGenresOfMovies);

// movie.production_companies
movieRoute.get("/movies/companies", MovieController.AllProductionCompanies);
movieRoute.get("/movies/user-vote", MovieController.CountRatings);

movieRoute.get("/movies/ratings", MovieController.ListUsersRatingMovie);
movieRoute.get("/movies/search", MovieController.SearchMovies);

movieRoute.get(
  "/movies/decRatings",
  MovieController.SortMoviesByDecreaseRatings
);
movieRoute.get(
  "/movies/ascRatings",
  MovieController.SortMoviesByAscendingRatings
);

module.exports = movieRoute;
