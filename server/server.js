import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weatherRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/weather", weatherRoutes);

app.listen(process.env.SERVER_PORT, () => {
    // console.log(`Server running on port ${process.env.SERVER_PORT}`);
});
