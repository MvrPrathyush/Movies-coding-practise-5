const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "/moviesData.db");
const sqlite3 = require("sqlite3");
let db = null;
app.use(express.json());
const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started succesfully");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeServerAndDb();

//GET API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT *
                                FROM movie;`;
  let moviesList = await db.all(getMoviesQuery);
  let moviesArr = [];
  for (let eachMovie of moviesList) {
    let movieObj = {
      movieName: eachMovie.movie_name,
    };
    moviesArr.push(movieObj);
  }
  response.send(moviesArr);
});

//POST API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `INSERT INTO 
                            movie (director_id,movie_name,lead_actor)
                            VALUES(
                                ${directorId},
                               '${movieName}',
                               ' ${leadActor}'
                            );
                            `;

  const dbResponse = await db.run(postMovieQuery);
  const movieId = dbResponse.lastID;

  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT 
                                * 
                           FROM movie
                            WHERE 
                                movie_id = ${movieId} ;       `;

  const movieDetails = await db.get(getMovieQuery);

  response.send({
    movieId: movieDetails.movie_id,
    directorId: movieDetails.director_id,
    movieName: movieDetails.movie_name,
    leadActor: movieDetails.lead_actor,
  });
});

///PUT API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `UPDATE movie
                                SET 
                                    director_id = ${directorId},
                                    movie_name = '${movieName}',
                                    lead_actor = '${leadActor}';
  `;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

///DELETE api
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `DELETE FROM movie
                                    WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

///GET DIRECTOR API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT *
                                FROM director;`;
  const directorsList = await db.all(getDirectorsQuery);
  let directorsArr = [];
  for (let eachDirector of directorsList) {
    let dirObj = {
      directorId: eachDirector.director_id,
      directorName: eachDirector.director_name,
    };
    directorsArr.push(dirObj);
  }

  response.send(directorsArr);
});

//GET movies by director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMoviesQuery = `
                            SELECT * 
                            FROM movie
                            WHERE director_id = ${directorId};`;

  const moviesList = await db.all(getMoviesQuery);

  const moviesArr = [];
  for (let eachMovie of moviesList) {
    const movieObj = {
      movieName: eachMovie.movie_name,
    };
    moviesArr.push(movieObj);
  }
  response.send(moviesArr);
});

module.exports = app;
