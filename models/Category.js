const { Model, DataTypes } = require('sequelize');

const sequelize = require('../config/connection.js');
//creating the Category model
class Category extends Model {}
//creation of the fields and columns of the Catagory model
Category.init(
  {
    // define columns
    //id column
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, 
      autoIncrement: true
    },
    //product column
    product: {
      type: DataTypes.STRING,
      allowNull: false
    },
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'category',
  }
);

module.exports = Category;
