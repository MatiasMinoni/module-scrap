const PORT = 8080;
import axios from "axios";
import cheerio from "cheerio";
import express, { json } from "express";

import fs from "fs";
import path from "path";
 import mongoose from "mongoose";

const app = express();

import admin from "firebase-admin";

app.use(express.static("src"));
app.use(express.urlencoded({ extended: true }));
const accountService = JSON.parse(
  fs.readFileSync(
    "./scraping-0-firebase-adminsdk-al7ez-3b351fa923.json",
    "utf-8"
  )
);

// FIREBASE
admin.initializeApp({ credential: admin.credential.cert(accountService) });
console.log("conectado!");
const db = admin.firestore();
const scraping = db.collection("scraping");
// FIREBASE
scraping.get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        doc.ref.delete();
    });
});
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../src/index.html"));
  res.render("index");
});

const articlesDB = [];
const datosSchema = new mongoose.Schema(
  {
    title: { type: String },
    price: { type: Number },
    articleURL: { type: String },
  },
  {
    collection: "meli",
  }
);
const datosDAO = mongoose.model("meli", datosSchema);

await mongoose.connect(
  "mongodb+srv://matiminoni:IpVJUbNlAku3H0BE@scrap-0.dmfgab9.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  }
);
console.log("Base de datos conectada!");

mongoose.connection.db.dropCollection("meli");


await app.get("/resultado", function (req, res) {
  const url = "https://listado.mercadolibre.com.ar/motorola#D[A:motorola]";

  axios(url).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const articles = [];
    escribir.write("Producto|Precio|URL\n");
    $(".ui-search-result__content-wrapper ").map((i, el) => {
      const title = $(el).find(".shops__item-title").text();
      const price = parseInt(
        $(el).find("span.ui-search-price__part>span").text(),
        10
      );
      const articleURL = $(el).find("a").attr("href");
      articles.push({ title, price, articleURL });
      escribir.write(`${title}|${price}|${articleURL}\n`);
    });
    async function crearDbMongoose() {
      articlesDB.push(articles);
      const inserciones = [];
      for (const dato of articlesDB) {
        inserciones.push(datosDAO.create(dato));
      }
      const results = await Promise.allSettled(inserciones);
      const rejected = results.filter((r) => r.status == "rejected");

      if (rejected.length > 0) {
        console.log(rejected);
      } else {
        console.log("Coleccion actualizada!");
      }

      // CRUD
      //     datosDAO.find({}).sort({title: 1})
      //   .then(articlesDB =>{
      //       articlesDB.forEach(articlesDB=>{
      //            console.log(JSON.stringify(articlesDB))
      //       })
      //     })

      // CRUD
    }

    function crearDbFirebase() {
      for (const dato of articles) scraping.doc().set(dato);
      console.log("valores insertados");
    }
    crearDbMongoose();
    crearDbFirebase();
    res.json(articles);
  });
});

const escribir = fs.createWriteStream("products.csv");

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
