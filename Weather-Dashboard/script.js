const apiKey = "5c2dd7bc6f2cb52ba7b8fadc5343c865"; // Replace with your API key
const apiUrl = "https://api.openweathermap.org/data/2.5/";

const locationEl = document.getElementById("location");
const dateEl = document.getElementById("date");
const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const weatherIconEl = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

function formatDate(timestamp) {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return new Date(timestamp * 1000).toLocaleDateString(undefined, options);
}

async function fetchWeather(city) {
  try {
    const res = await fetch(`${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    if (data.cod !== 200) {
      alert("City not found!");
      return;
    }

    updateWeatherUI(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
}

async function fetchForecast(lat, lon) {
  try {
    const res = await fetch(`${apiUrl}forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await res.json();

    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 3);

    forecastContainer.innerHTML = "";
    daily.forEach(day => {
      const card = document.createElement("div");
      card.classList.add("forecast-card");
      card.innerHTML = `
        <h4>${new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: "short" })}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" />
        <p>${Math.round(day.main.temp)}°C</p>
        <small>${day.weather[0].description}</small>
      `;
      forecastContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching forecast:", err);
  }
}

function updateWeatherUI(data) {
  locationEl.textContent = `${data.name}, ${data.sys.country}`;
  dateEl.textContent = formatDate(data.dt);
  temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
  conditionEl.textContent = data.weather[0].description;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(`${apiUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await res.json();
        updateWeatherUI(data);
        fetchForecast(lat, lon);
      } catch (err) {
        console.error("Error fetching location weather:", err);
      }
    }, () => {
      alert("Location access denied. Please search manually.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    cityInput.value = "";
  }
});

getLocationWeather();
