const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const { createUser, signIn, signOut } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-error');
const globalErrorHandler = require('./middlewares/global-error-handler');

const { PORT = 3000 } = process.env;

const limiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
mongoose.connect('mongodb://localhost:27017/moviesdb');

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use(limiter);

app.post('/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  createUser);

app.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  signIn);

app.post('/signout', signOut);

app.use(auth);

app.use(userRoutes);
app.use(movieRoutes);

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use(globalErrorHandler);

app.listen(PORT);
