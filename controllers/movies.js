const mongoose = require('mongoose');

const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');

const getAllMovies = (req, res, next) => {
  Movie.find({})
    .then((cards) => res.status(200).send({ cards }))
    .catch(next);
};

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    nameRU,
    nameEN,
    movieId,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    nameRU,
    nameEN,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании карточки.'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const objectMovieId = mongoose.Types.ObjectId(movieId);
  Movie.findById(movieId)
    .orFail(new Error('NotFoundMovieId'))
    .then((card) => {
      if (req.user._id !== card.owner) {
        return next(new ForbiddenError('Нельзя удалять чужой фильм.'));
      }
      return Movie.deleteOne(objectMovieId)
        .then(() => {
          res.status(200).send({ message: 'Фильм удалён.' });
        })
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'NotFoundMovieId') {
        return next(new NotFoundError('Фильм с указанным id не найден.'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные для удаления карточки.'));
      }
      return next(err);
    });
};

module.exports = {
  getAllMovies,
  createMovie,
  deleteMovie,
};
