import { DataTypes } from "sequelize";
import sequelize from "./conexion.js";
import Cuentas from "./cuentas.js";

const Imagenes = sequelize.define("Imagenes", {
    ruta : {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre : {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha : {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

Cuentas.hasMany(Imagenes, { foreignKey: "cuentaID"});
Imagenes.belongsTo(Cuentas, {foreignKey: "cuentaID"});

export default Imagenes;