import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import profileRoutes from "./routes/profile.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Express & TypeScript server!" });
});

app.use("/api", profileRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

