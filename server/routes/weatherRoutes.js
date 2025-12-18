import express from "express";
import axios from "axios";

const router = express.Router();

// Get forecast for a city
router.get("/:city", async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.WEATHER_API_KEY;

        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
            city
        )}&days=3&aqi=no&alerts=no`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        // console.error("Weather API Error:", error.response?.data || error.message);
        res.status(500).json({ message: "City not found or API error" });
    }
});

// Search for city suggestions
router.get("/search/:query", async (req, res) => {
    try {
        const query = req.params.query;
        const apiKey = process.env.WEATHER_API_KEY;

        const url = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(
            query
        )}`;

        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        // console.error("Search API Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Search error" });
    }
});

export default router;
