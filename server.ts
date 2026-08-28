import express from 'express';
import { sequelize } from './config/database.ts';
import dotenv from 'dotenv';
import cors from 'cors';
import errors from './middleware/errorhandler.ts';
import logger from './middleware/logger.ts';
import notFound from './middleware/notFound.ts';
import userRoute from './routes/userRoute.ts';
import authRoute from './routes/authRoute.ts';
import adminRoute from './routes/adminRoute.ts'

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(logger);
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('hi, this is the working server for this project.')
});

// 1. Mount your routers FIRST
app.use('/api/v4/user', userRoute);
app.use('/api/v4/auth', authRoute);
app.use('/api/v4/admin', adminRoute)

// 2. Fallback & Error Handlers MUST go LAST (after all valid routes)
app.use(notFound);
app.use(errors);

const runServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({ alter: true });
        console.log(' Models synchronized with database');

        app.listen(port, () => {
            console.log(`This project is running at ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server!:', error);
        process.exit(1);
    }
};

runServer();