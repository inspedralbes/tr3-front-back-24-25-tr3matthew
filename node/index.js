import express from "express";
import multer from "multer";
import cors from 'cors';
import sequelize from "./basededades/conexion.js";
import Cuentas from "./basededades/cuentas.js";
import Imagenes from "./basededades/imagenes.js";
import { createServer } from  "node:http";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import { hashPassword, verifyPassword } from "./bcrypt/bycryptUtils.js";
import sharp from "sharp";
const app = express();
const server = createServer(app);
const ws = new WebSocketServer({ server });
/*const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "DELETE", "PUT", "POST"]
    }
});*/
const PORT = process.env.PORT;
const NODE_URL = process.env.NODE_URL;

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const portada = `${Date.now()}_${file.originalname}.jpg`;
        cb(null, portada);
    }
});

const upload = multer({ storage : storage});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

async function emiNumeroPortadas() {
    const totalPortadas = await Imagenes.count();
    const message = JSON.stringify({ type: "NumeroPortadas", data: totalPortadas });

    ws.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message)
        }
    });
}

async function recortarImagen(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .resize(1980, 1080)
        .toFile(outputPath);
    
    fs.unlink(inputPath, (error) => {
        if(error) {
            console.error("Error eliminando la imagen original: ", error);
        }
    });
    }
    catch(error) {
        throw new Error("Error al procesar la imagen: " + error.message);
    }
}

app.post("/cuentas", async (req, res) => {
    try {
        const { username, password } = req.body;
        const bcryptPassword = await hashPassword(password);
        const nuevaCuenta = await Cuentas.create({ username : username, password : bcryptPassword });
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

app.get("/FcuentasU", async (req, res) => {
    const { username, password } = req.query;
    const cuenta = await Cuentas.findOne({
        where: {
            username: username,
        }
    });
    if (!cuenta ) {
        res.status(400).json({error: "Cuenta no encontrada."});
    }
    else {
        const validacionContra = await verifyPassword(password, cuenta.password);
        if (validacionContra) {
            //console.log("Cuenta encontrada: ", cuenta);
            res.json(cuenta); 
        }
        else {
            console.log(`Contraseña de ${cuenta.username} incorrecta.`);
        }
    }
});

app.put("/cuentas/:username", async (req, res) => {
    const { username, password } = req.body;
    const cuentamodif = await Cuentas.findByPk(req.params.username);
    if (!cuentamodif) {
        res.status(400).json({error: "Cuenta no encontrada."});
    }
    else {
        cuentamodif.username =  username;
        cuentamodif.password = password;
        await cuentamodif.save();
        res.json(cuentamodif);
    }
});

app.delete("/cuentas/:username", async (req, res) => {
    try {
        const cuentaelim = await Cuentas.findByPk(req.params.username);
        await cuentaelim.destroy();
        res.json({message: "Cuenta eliminada con exito. "})
    }
    catch {
        res.status(400).json({ error: "Cuenta no encontrada."});
    }
});

app.post("/imagenes/:cuentaID", upload.single("imagen"), async (req, res) => {
    console.log(`multer: ${req.file}`);
    try { 
        const { cuentaID } = req.params;
        const cuenta = await Cuentas.findByPk(cuentaID);
        
        if (!cuenta) {
            res.status(400).json({ error: "Cuenta no entcontrada." });
        }
        else {
            const outputPath = `uploads/recortado_${req.file.filename}`;
            await recortarImagen(req.file.path, outputPath);
            console.log(req.file.path);
            const nuevaImagen = await Imagenes.create({
                ruta: outputPath,
                nombre: req.file.filename,
                fecha: new Date(),
                cuentaID
            });
            
            await emiNumeroPortadas();
            const mensajeImagen = JSON.stringify({ type: "nuevaImagen", data: nuevaImagen});

            ws.clients.forEach(client => {
                if (client.readyState === 1) {
                    client.send(mensajeImagen);
                }
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
    const imagenes_url = imagenes.map(img => ({
        ...img.toJSON(),
        url:`${NODE_URL}/${img.ruta}`
    }));
    res.json(imagenes_url);
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
        const imagePath = path.join("./", imagen.ruta);
        fs.unlink(imagePath, (error) => {
            if(error) {
                console.error("Error al eliminar la imagen: ", error);
            }
        });
        await imagen.destroy();
        res.json({ message: "Imagen eliminada." });
    }
});

ws.on("connection", (ws) => {
    console.log("Cliente conectado a WebSocket");
    emiNumeroPortadas();
    ws.on("message", (message) => {
        console.log("Mensaje de Unity: ", message.toString());
        ws.send("Mensaje recibido en WebSocket")
    });

    ws.on("close", () => {
        console.log("Cliente desconectado de WebSocket");
    });

    ws.on("error", (error) => {
        console.error("Error en WebSocket:", error);
    });
});

const syncDB = async () => {
  try {
    await sequelize.sync()
    console.log("Tablas sincronizadas correctamente.");

    server.listen(PORT, () =>{
        console.log(`Servidor corriendo en ${NODE_URL}`)
    });

  } catch (error) {
    console.error("Error al sincronizar: ", error)
  }
};

(async () => {
    await syncDB();
})();