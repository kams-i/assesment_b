import express from 'express';
import { sequelize } from './config/database.ts';
import dotenv from 'dotenv';
import cors from 'cors';


dotenv.config();
const app = express();
const port = process.env.PORT || 7001;

app.use(express.json());
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));



app.get('/', (req, res) => {
    res.send('hi, this is the working server for this project.')
});

const runServer = async () => {
    try {
        // Authenticate & Sync Sequelize
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({ alter: true });
        console.log(' Models synchronized with database');

        // Start Express HTTP Server
        app.listen(port, () => {
            console.log(`This project is running at ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server!:', error);
        process.exit(1);
    }
};

runServer();