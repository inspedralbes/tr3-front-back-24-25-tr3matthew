import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
console.log("MYSQL_DATABASE:", process.env.MYSQL_DATABASE);
console.log("MYSQL_USER:", process.env.MYSQL_USER);
console.log("MYSQL_PASSWORD:", process.env.MYSQL_PASSWORD ? "*****" : "NO PASSWORD");
console.log("MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("MYSQL_DIALECT:", process.env.MYSQL_DIALECT);

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, 
  process.env.MYSQL_USER, 
  process.env.MYSQL_PASSWORD, 
  {
    host: process.env.MYSQL_HOST,
    dialect: process.env.MYSQL_DIALECT || "mysql",
    logging: false
  }
);

export default sequelize;