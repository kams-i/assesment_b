import express from 'express';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const port = process.env.PORT || 7001;

app.use(express.json());
app.get('/', (req, res) => {
    res.send('hi, this is the working server for this project.')
});

const runServer = async () => {
    try {
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