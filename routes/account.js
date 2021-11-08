const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();
const { createUser, signIn } = require('../controllers/users');

router.post('/api/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser);

router.post('/api/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  signIn);

module.exports = router;
