import { DataTypes } from "sequelize";
import sequelize from "./conexion.js";

const Cuentas = sequelize.define("Cuentas", {
    /*id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },*/
    username : {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    password : {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    timestamps: true
});

export default Cuentas;