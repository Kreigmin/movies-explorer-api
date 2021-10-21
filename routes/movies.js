const express = require('express');
const { Joi, celebrate } = require('celebrate');
const validator = require('validator');

const router = express.Router();
const {
  getAllMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

const validateUrl = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('Неправильный формат ссылки');
  }
  return value;
};

router.get('/api/movies', getAllMovies);

router.post('/api/movies',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required().custom(validateUrl),
      trailer: Joi.string().required().custom(validateUrl),
      thumbnail: Joi.string().required().custom(validateUrl),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
      movieId: Joi.number().required(),
    }),
  }),
  createMovie);

router.delete('/api/movies/:movieId',
  celebrate({
    params: Joi.object().keys({
      movieId: Joi.string().length(24).hex(),
    }),
  }),
  deleteMovie);

module.exports = router;
