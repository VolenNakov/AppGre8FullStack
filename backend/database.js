import { Sequelize, DataTypes } from 'sequelize'

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/database.sqlite',
})

const Picture = sequelize.define('Picture', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    originalName: DataTypes.STRING,
    filename: DataTypes.STRING,
})

export { Picture }
