import express from "express";
import multer from "multer";
import cors from 'cors';
import sequelize from "./basededades/conexion.js";
import Cuentas from "./basededades/cuentas.js";
import Imagenes from "./basededades/imagenes.js";
import { createServer } from  "http";
import fs from "fs";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const portada = `${Date.now()}_${file.originalname}`;
        cb(null, portada);
    }
});

const upload = multer({ storage : storage});

app.use(express.json());
app.use(cors());

app.post("/cuentas", async (req, res) => {
    try {
        const { username, password } = req.body;
        const nuevaCuenta = await Cuentas.create({ username : username, password : password });
        res.json(nuevaCuenta);
        console.log("¡Cuenta creada con éxito!")
    }
    catch (error) {
        res.status(400).json({ error : error.message})
    }
});

app.get("/Fcuentas", async (req, res) => {
    const cuentas = await Cuentas.findAll();
    res.json(cuentas);
})

app.get("/Fcuentas/:id", async (req, res) => {
    const cuenta = await Cuentas.findByPk(req.params.id);
    if (!cuenta) {
        res.status(400).json({error: "Cuenta no encontrada."});
    }
    else {
        res.json(cuenta); 
    }
});

app.put("/cuentas/:id", async (req, res) => {
    const { id, username, password } = req.body;
    const cuentamodif = await Cuentas.findByPk(req.params.id);
    if (!cuentamodif) {
        res.status(400).json({error: "Cuenta no encontrada."});
    }
    else {
        cuentamodif.id = id;
        cuentamodif.username =  username;
        cuentamodif.password = password;
        await cuentamodif.save();
        res.json(cuentamodif);
    }
});

app.delete("/cuentas/:id", async (req, res) => {
    try {
        const cuentaelim = await Cuentas.findByPk(req.params.id);
        await cuentaelim.destroy();
        res.json({message: "Cuenta eliminada con exito. "})
    }
    catch {
        res.status(400).json({ error: "Cuenta no encontrada."});
    }
});

app.post("/imagenes/:cuentaID", upload.single("imagen"), async (req, res) => {
    console.log(req.file);
    try { 
        const { cuentaID } = req.params;
        const cuenta = await Cuentas.findByPk(cuentaID);
        if (!cuenta) {
            res.status(400).json({ error: "Cuenta no entcontrada." });
        }
        else {
            const nuevaImagen = await Imagenes.create({
                ruta: req.file.path,
                nombre: req.file.filename,
                fecha: new Date(),
                cuentaID
            });

            res.json(nuevaImagen);
        }
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get("/imagenes", async (req, res) => {
    const imagenes = await Imagenes.findAll();
    res.json(imagenes);
});

app.get("/imagenes/:cuentaID", async (req, res) => {
    const { cuentaID } = req.params;
    const imagenes = await Imagenes.findAll({ where: { cuentaID } });
    res.json(imagenes)
});

app.delete("/imagenes/:id", async (req, res) => {
    const imagen = await Imagenes.findByPk(req.params.id);
    if (!imagen) {
        console.status(400).json({ error: "Imagen no encontrada" });
    }
    else { 
        /*fs.unlink(filePath, async (err) => {
            if (err && err.code !== "ENOENT") {  // ENOENT significa que el archivo ya no existe
                return res.status(500).json({ error: "Error al eliminar la imagen del sistema" });
            }})*/
        await imagen.destroy();
        res.json({ message: "Imagen eliminada." });
    }
});

const syncDB = async () => {
  try {
    await sequelize.sync()
    console.log("Tablas sincronizadas correctamente.");

    app.listen(PORT, () =>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    });

  } catch (error) {
    console.error("Error al sincronizar: ", error)
  }
};

(async () => {
    await syncDB();
})();