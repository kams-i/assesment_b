import express from 'express';
import http from 'http';
import { sequelize } from './config/database';
import { initSocket } from './config/socket';
import dotenv from 'dotenv';
import cors from 'cors';
import errors from './middleware/errorhandler';
import logger from './middleware/logger';
import notFound from './middleware/notFound';
import userRoute from './routes/userRoute';
import authRoute from './routes/authRoute';
import adminRoute from './routes/adminRoute';
import uploadRoute from './routes/uploadRoute';
import postRoute from './routes/postRoute';
import likeRoute from './routes/likeRoute';
import messageRoute from './routes/messageRoute';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(logger);
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000'],
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('hi, this is the working server for this project.')
});

// 1. Mount your routers FIRST
app.use('/api/v4/user', userRoute);
app.use('/api/v4/auth', authRoute);
app.use('/api/v4/admin', adminRoute);
app.use('/api/v4/upload', uploadRoute);
app.use('/api/v4/post', postRoute);
app.use('/api/v4/like', likeRoute);
app.use('/api/v4/message', messageRoute);

// 2. Fallback & Error Handlers MUST go LAST (after all valid routes)
app.use(notFound);
app.use(errors);

const runServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        await sequelize.sync({ alter: true });
        console.log('Models synchronized with database');

        const server = http.createServer(app);
        initSocket(server);

        server.listen(port, () => {
            console.log(`This project is running at ${port}`);
        });

        // Increase timeout to 5 minutes (300,000 ms) for video uploads
        server.timeout = 300000;
        server.keepAliveTimeout = 300000;
    } catch (error) {
        console.error('Failed to start server!:', error);
        process.exit(1);
    }
};

runServer();