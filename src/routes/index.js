const MovieRoute = require("./MovieRoute");
const UserRoute = require("./UserRoute");
const AdminRoute = require("./AdminRoute");
const dataMovies = require("../config/dataMovie.json");

function route(app) {
  app.use("/", MovieRoute);
  app.use("/", UserRoute);
  app.use("/admin", AdminRoute);

  app.get("/api/all-movies", async (req, res) => {
    res.json(dataMovies);
  });
}

module.exports = route;
