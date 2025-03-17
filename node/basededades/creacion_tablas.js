import sequelize from "./conexion.js";
import Cuentas from "./cuentas.js";
import Imagenes from "./imagenes.js";

const syncDB = async () => {
  try {
    await sequelize.sync({ force : true })
    console.log("Tablas sincronizadas correctamente.");
  } catch (error) {
    console.error("Error al sincronizar: ", error)
  }
};

export default syncDB;