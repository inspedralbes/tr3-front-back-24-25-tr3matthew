import { DataTypes } from "sequelize";
import sequelize from "./conexion.js";

const Cuentas = sequelize.define("Cuentas", {
    username : {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password : {
        type: DataTypes.STRING,
        allowNull: false
    }
})

export default Cuentas;