const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors()); // Permite peticiones desde el frontend

app.get("/", (req, res) => {
    res.send("Hola vue" );
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
