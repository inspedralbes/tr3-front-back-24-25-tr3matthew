import express from "express";
import cors from 'cors'
import { createServer } from  "http";

const app = express();
const server = createServer(app);

import syncDB from "./basededades/creacion_tablas.js";

(async () => {
    await syncDB();
})();
