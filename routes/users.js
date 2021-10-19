const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();
const {
  getUser,
  updateUserInfo,
} = require('../controllers/users');

router.get('/users/me', getUser);

router.patch('/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().required().email(),
    }),
  }),
  updateUserInfo);

module.exports = router;
