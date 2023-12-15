const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const cors = require("cors");
const { Client } = require("whatsapp-web.js");
const client = new Client();

const app = express();
const port = 3001;

// Подключение к базе данных PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Chatbot",
  password: "17302128",
  port: 5432,
});

// Cors
const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

// Wwebjs
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  if (message.body === "/консультация") {
    client.sendMessage(
      message.from,
      "Здравствуйте. Ваша заявка на консультацию принята. Как вам удобно переговорить устно или перепиской? wa.me/7ХХХХХХХХХХ?text=/позвоните_мне wa.me/7ХХХХХХХХХХ?text=/напишите_мне"
    );
  } else if (
    message.body === "/позвоните_мне" ||
    message.body === "/напишите_мне"
  ) {
    client.sendMessage(
      message.from,
      "Ок. Первый освободившийся менеджер сразу же с вами свяжется. Спасибо за обращение."
    );
    // Логика для записи в БД или других действий
  }
  // Другие условия и логика чат-бота
});

client.initialize();

// Включаем CORS для всех запросов
app.use(cors(corsOptions));
app.use(bodyParser.json());

// API для сохранения данных чат-бота
app.post("/save-customers", async (req, res) => {
  try {
    const { date, time, username, phoneNumber, action } = req.body;

    const query = `
      INSERT INTO public.customers (date, time, username, phoneNumber, action)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;`;
    const values = [date, time, username, phoneNumber, action];

    const result = await pool.query(query, values);

    res.status(200).send(`Данные успешно сохранены с ID: ${result.rows[0].id}`);
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error);
    res.status(500).send("Ошибка на сервере: " + error.message);
  }
});

app.get("/", (req, res) => {
  console.log("Запрос получен");
  res.send("Сервер работает!");
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
