import express from 'express';
import dotenv from 'dotenv'; 
import db from './config/db.js'; 
import authRouter from './routes/authRoutes.js'; 
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
const port = 3000;
db();
app.use(cookieParser());




app.use(express.json());
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlloMedia API',
      version: '1.0.0',
      description: 'API documentation for AlloMedia',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); 
});

app.use(authRouter);



app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;