const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-error');
const globalErrorHandler = require('./middlewares/global-error-handler');
const limiter = require('./middlewares/rate-limiter');

const { PORT = 3000, MONGODB_SERVER_URL, NODE_ENV } = process.env;

const app = express();
mongoose.connect(NODE_ENV === 'production' ? MONGODB_SERVER_URL : 'mongodb://localhost:27017/moviesdb');

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.use(limiter);

app.use(require('./routes/account'));

app.use(auth);

app.use(require('./routes/users'));
app.use(require('./routes/movies'));

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

app.use(errorLogger);

app.use(errors());

app.use(globalErrorHandler);

app.listen(PORT);
