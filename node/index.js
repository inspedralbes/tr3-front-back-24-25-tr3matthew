import express from "express";
import multer from "multer";
import cors from 'cors';
import sequelize from "./basededades/conexion.js";
import Cuentas from "./basededades/cuentas.js";
import Imagenes from "./basededades/imagenes.js";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import { hashPassword, verifyPassword } from "./bcrypt/bycryptUtils.js";
import sharp from "sharp";
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
const app = express();
const server = createServer(app);
const ws = new WebSocketServer({ server });
const mongoUrl = process.env.MONGO_URL_DATABASE;
const dbName = process.env.MONGO_DATABASE;
let gameParams = {
    speed: 10,
    saltosMaximos: 1
  };

const PORT = process.env.PORT;
const NODE_URL = process.env.NODE_URL;

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        const portada = `${Date.now()}_${file.originalname}.jpg`;
        cb(null, portada);
    }
});

const upload = multer({ storage: storage });
const partidaSchema = new mongoose.Schema({
    objetosRecogidos: Number,
    fecha: { type: Date, default: Date.now }
});
const Partida = mongoose.model('Partida', partidaSchema);

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
       const metadata = await sharp(inputPath).metadata();

        const size = Math.min(metadata.width, metadata.height);

        const left = (metadata.width - size) / 2;
        const top = (metadata.height - size) / 2;

        await sharp(inputPath)
            .extract({ width: size, height: size, left: Math.round(left), top: Math.round(top) })
            .resize(100,100)
            .toFile(outputPath);

        fs.unlink(inputPath, (error) => {
            if (error) {
                console.error("Error eliminando la imagen original: ", error);
            }
        });
    }
    catch (error) {
        throw new Error("Error al procesar la imagen: " + error.message);
    }
}

app.post("/cuentas", async (req, res) => {
    try {
        const { username, password } = req.body;
        const bcryptPassword = await hashPassword(password);
        const nuevaCuenta = await Cuentas.create({ username: username, password: bcryptPassword });
        res.json(nuevaCuenta);
        console.log("¡Cuenta creada con éxito!")
    }
    catch (error) {
        res.status(400).json({ error: error.message })
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
    if (!cuenta) {
        res.status(400).json({ error: "Cuenta no encontrada." });
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
        res.status(400).json({ error: "Cuenta no encontrada." });
    }
    else {
        cuentamodif.username = username;
        cuentamodif.password = password;
        await cuentamodif.save();
        res.json(cuentamodif);
    }
});

app.delete("/cuentas/:username", async (req, res) => {
    try {
        const cuentaelim = await Cuentas.findByPk(req.params.username);
        await cuentaelim.destroy();
        res.json({ message: "Cuenta eliminada con exito. " })
    }
    catch {
        res.status(400).json({ error: "Cuenta no encontrada." });
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
            const mensajeImagen = JSON.stringify({ type: "nuevaImagen", data: nuevaImagen });

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
        url: `${NODE_URL}/${img.ruta}`
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
            if (error) {
                console.error("Error al eliminar la imagen: ", error);
            }
        });
        await imagen.destroy();
        const mensajeEliminar = JSON.stringify({ 
            type: "imagenEliminada", 
            data: req.params.id 
        });

        ws.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(mensajeEliminar);
            }
        });
        res.json({ message: "Imagen eliminada." });
    }
});
app.post("/partidas", async (req, res) => {
    console.log("Datos recibidos:", req.body); // ← Añade esto para debug
    
    try {
        const { objetosRecogidos } = req.body;
        
        if(!objetosRecogidos) {
            return res.status(400).json({ error: "objetosRecogidos es requerido" });
        }

        const nuevaPartida = new Partida({
            objetosRecogidos: parseInt(objetosRecogidos)
        });
        
        await nuevaPartida.save();
        
        res.json({ 
            success: true,
            partidaId: nuevaPartida._id 
        });
    } catch (error) {
        console.error("Error en /partidas:", error); // ← Log detallado
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});


ws.on("connection", (ws) => {
    console.log("Cliente conectado a WebSocket");
    emiNumeroPortadas();
    /*ws.on("message", (message) => {
        console.log("Mensaje de Unity: ", message.toString());
        ws.send("Mensaje recibido en WebSocket")
    });*/

    ws.on("close", () => {
        console.log("Cliente desconectado de WebSocket");
    });

    ws.on("error", (error) => {
        console.error("Error en WebSocket:", error);
    });
    ws.send(JSON.stringify({
        type: 'INITIAL_PARAMS',
        data: gameParams
      }));
    
      // Escuchar mensajes del cliente
      ws.on('message', (message) => {
        const { type, data } = JSON.parse(message);
        
        if (type === 'UPDATE_PARAMS') {
          gameParams = { ...gameParams, ...data };
          // Broadcast a todos los clientes
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'PARAMS_UPDATED',
                data: gameParams
              }));
            }
          });
        }
      });
});

const syncDB = async () => {
    try {
        await sequelize.sync()
        console.log("Tablas sincronizadas correctamente.");

        server.listen(PORT, () => {
            console.log(`Servidor corriendo en ${NODE_URL}`)
        });

    } catch (error) {
        console.error("Error al sincronizar: ", error)
    }
};

/*(async () => {
    await syncDB();
})();
*/
async function connectMongo() {
    try {
        await mongoose.connect(`${mongoUrl}/${dbName}`);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
    }
}

(async () => {
    await connectMongo();
    await syncDB();
})();