import { useState, useEffect, useRef } from "react";
import axios from "axios";

function Weather() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimer = useRef(null);

  // Suggestions logic
  useEffect(() => {
    if (query.trim().length > 2) {
      const timer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async (q) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/weather/search/${q}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error("Suggestions error:", err);
    }
  };

  const getWeather = async (city) => {
    if (!city || city.trim().length === 0) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/weather/${city}`);
      setWeather(res.data);
      setSelectedDayIndex(0);
    } catch (err) {
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (cityName) => {
    setQuery(cityName);
    getWeather(cityName);
  };

  // Auto-search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2 && (!weather || weather.location.name.toLowerCase() !== query.toLowerCase())) {
        getWeather(query);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen px-4 py-8 md:py-12 flex flex-col items-center">
      <div className="w-full max-w-xl">

        {/* Simple Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            SkyCast
          </h1>
          <p className="text-slate-500 mt-2">Simple, accurate weather forecasts</p>
        </header>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getWeather(query)}
              placeholder="Enter a city name e.g. Quetta"
              className="flex-1 px-5 py-4 text-slate-700 outline-none"
            />
            {/* <button
              onClick={() => getWeather(query)}
              className="px-6 py-4 bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Search
            </button> */}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.name)}
                  className="w-full px-5 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  <span className="text-sm text-slate-500 ml-2">{s.region}, {s.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center mb-6">
            {error}
          </div>
        )}

        {loading && !weather && (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        )}

        {weather && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Current Day Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center">
              <span className="text-slate-500 font-medium mb-1 uppercase tracking-wider text-xs">
                {weather.location.name}, {weather.location.country}
              </span>
              <h2 className="text-5xl font-bold text-slate-800 mb-6">
                {Math.round(weather.current.temp_c)}°C
              </h2>

              <div className="flex items-center gap-4 mb-8">
                <img
                  src={weather.current.condition.icon}
                  alt={weather.current.condition.text}
                  className="w-16 h-16"
                />
                <span className="text-xl font-medium text-slate-700">
                  {weather.current.condition.text}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full border-t border-slate-100 pt-8">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Humidity</p>
                  <p className="text-2xl font-bold text-slate-800">{weather.current.humidity}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Wind</p>
                  <p className="text-2xl font-bold text-slate-800">{Math.round(weather.current.wind_kph)} <span className="text-sm">km/h</span></p>
                </div>
              </div>
            </div>

            {/* Forecast Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar snap-x no-scrollbar">
              {weather.forecast.forecastday.map((day, index) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDayIndex(index)}
                  className={`flex-shrink-0 w-32 px-4 py-6 rounded-2xl border transition-all snap-start ${selectedDayIndex === index
                    ? 'bg-slate-800 border-slate-800 text-white shadow-lg'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm'
                    }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                    {index === 0 ? "Today" : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <img src={day.day.condition.icon} alt="" className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-xl font-bold">{Math.round(day.day.avgtemp_c)}°</p>
                </button>
              ))}
            </div>

            {/* Hourly Filter (Minimal) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">
                Hourly Breakdown
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {weather.forecast.forecastday[selectedDayIndex].hour
                  .filter((_, i) => i % 2 === 0) // Show every 2nd hour for simplicity
                  .map((h, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-16 flex flex-col items-center gap-2 snap-center"
                    >
                      <span className="text-xs text-slate-500 font-medium">{h.time.split(" ")[1]}</span>
                      <img src={h.condition.icon} alt="" className="w-8 h-8" />
                      <span className="font-bold text-slate-800 text-sm">{Math.round(h.temp_c)}°</span>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
