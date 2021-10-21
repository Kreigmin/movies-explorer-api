const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const { NODE_ENV, JWT_SECRET } = process.env;

const createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, email, password: hash }))
    .then(() => {
      res.status(201).send({ user: { name, email } });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new ConflictError('Данный email уже существует.'));
      }
      return next(err);
    });
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFoundUserId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotFoundUserId') {
        return next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный id пользователя.'));
      }
      return next(err);
    });
};

const updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotFoundUserId'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotFoundUserId') {
        return next(new NotFoundError('Пользователь по указанному _id не найден.'));
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(new ConflictError('Данный email уже существует.'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      return next(err);
    });
};

const signIn = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev_secret',
        {
          expiresIn: '7d',
        },
      );

      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      });
      res.status(200).send({ message: 'Вы успешно вошли.' });
    })
    .catch((err) => {
      if (err.message === 'Unauthorized') {
        return next(new UnauthorizedError('Неправильные почта или пароль.'));
      }
      return next(err);
    });
};

const signOut = (req, res, next) => {
  try {
    res.cookie('jwt', '', {
      maxAge: 1,
      httpOnly: true,
      sameSite: true,
    });
  } catch (err) {
    return next(new Error('С токеном что-то не так.'));
  }
  return res.status(200).send({ message: 'Вы успешно вышли' });
};

module.exports = {
  createUser,
  getUser,
  updateUserInfo,
  signIn,
  signOut,
};
