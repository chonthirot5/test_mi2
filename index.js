const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({
  quiet: true,
  path: `./config/.env.${process.env.NODE_ENV}`,
});

const app = express();

app.locals.ENV = process.env.NODE_ENV;
app.locals.API_URL = process.env.API_URL;
app.locals.API_PORT = process.env.API_PORT;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/public');
app.use(express.static(__dirname + '/public'));

app.get('/', (_req, res) => {
  res.render('core/views/index');
});

app.get('/login', (_req, res) => {
  res.render('core/views/login');
});

const filePath = path.join(__dirname, '/public', 'uploads', 'orders_500.json');

let ordersData = [];

try {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  ordersData = parsed.data || [];
} catch (error) {
  console.error('Error reading JSON file:', error);
}

app.get('/orders', (req, res) => {
  let { page = 1, pageSize = 1000 } = req.query;

  page = parseInt(page);
  pageSize = parseInt(pageSize);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(pageSize) || pageSize < 1) pageSize = 1000;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const results = ordersData.slice(startIndex, endIndex);

  res.json({
    page,
    pageSize,
    totalRecords: ordersData.length,
    totalPages: Math.ceil(ordersData.length / pageSize),
    data: results,
  });
});

app.use((_req, res) => {
  res.render('core/views/index');
});

app.listen(`${process.env.PORT}`, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
