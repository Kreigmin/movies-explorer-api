const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();
const {
  getUser,
  updateUserInfo,
  signOut,
} = require('../controllers/users');

router.get('/api/users/me', getUser);

router.patch('/api/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().required().email(),
    }),
  }),
  updateUserInfo);

router.post('/api/signout', signOut);

module.exports = router;
