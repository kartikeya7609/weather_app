const elements = {
  search: document.querySelector(".search"),
  cityInput: document.querySelector('.input'),
  searchBtn: document.querySelector('.btn'),
  weatherContainer: document.querySelector('.weather-container'),
  weatherInfo: document.querySelector('.weather-info'),
  weatherError: document.createElement('div'),
  temperature: document.querySelector(".temp-txt"),
  condition: document.querySelector(".condition-txt"),
  cityName: document.querySelector("#city"),
  humidity: document.querySelector(".humdity-value"),
  windSpeed: document.querySelector(".wind-speed"),
  date: document.querySelector("#date-time"),
  weatherIcon: document.querySelector('.image-one'),
  suggestionsList: document.querySelector('.suggestions-list')
};

const config = {
  apiKey: '3fc70bbf0291c7c20b4088835cdd7aa6',
  baseUrl: 'https://api.openweathermap.org/data/2.5'
};

function init() {
  setupErrorElement();
  setCurrentDate();
  setupEventListeners();
  updateWeatherInfo('Durgapur');
}

function setupErrorElement() {
  elements.weatherError.className = 'weather-error';
  elements.weatherError.style.display = 'none';
  elements.weatherContainer.appendChild(elements.weatherError);
}

function setCurrentDate() {
  const now = new Date();
  elements.date.textContent = `${now.getDate()}-${now.toLocaleString('default', { month: 'short' })}, ${now.toLocaleString('default', { weekday: 'short' })}`;
}

function setupEventListeners() {
  elements.searchBtn.addEventListener("click", toggleSearch);
  elements.cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
  });
  
  elements.cityInput.addEventListener('input', async () => {
      const query = elements.cityInput.value.trim();
      if (query.length < 2) {
          elements.suggestionsList.style.display = 'none';
          return;
      }
      
      const suggestions = await getCitySuggestions(query);
      displaySuggestions(suggestions);
  });
}

function toggleSearch() {
  elements.search.classList.toggle("active");
  if (elements.search.classList.contains("active")) {
      elements.cityInput.focus();
  } else {
      elements.suggestionsList.style.display = 'none';
  }
}

async function handleSearch() {
  const city = elements.cityInput.value.trim();
  if (!city) return;

  try {
      await updateWeatherInfo(city);
      elements.search.classList.remove("active");
      elements.cityInput.value = '';
      elements.suggestionsList.style.display = 'none';
  } catch (error) {
      showWeatherError(error.message);
  }
}

async function getCitySuggestions(query) {
  const limit = 5;
  try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${config.apiKey}`);
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
  }
}

function displaySuggestions(suggestions) {
  elements.suggestionsList.innerHTML = '';

  if (suggestions.length === 0) {
      elements.suggestionsList.style.display = 'none';
      return;
  }

  suggestions.forEach((cityObj) => {
      const li = document.createElement('li');
      li.textContent = `${cityObj.name}${cityObj.state ? ', ' + cityObj.state : ''}, ${cityObj.country}`;
      li.addEventListener('click', () => {
          elements.cityInput.value = cityObj.name;
          elements.suggestionsList.style.display = 'none';
          updateWeatherInfo(cityObj.name);
      });
      elements.suggestionsList.appendChild(li);
  });
  
  elements.suggestionsList.style.display = 'block';
}

document.addEventListener('click', (e) => {
  if (!elements.suggestionsList.contains(e.target) && e.target !== elements.cityInput) {
      elements.suggestionsList.style.display = 'none';
  }
});

async function fetchWeatherData(city) {
  try {
      const response = await fetch(`${config.baseUrl}/weather?q=${city}&appid=${config.apiKey}&units=metric`);
      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(data.message || "City not found");
      }
      
      return data;
  } catch (error) {
      console.error("Fetch error:", error);
      throw new Error("Failed to get weather data. Please try again.");
  }
}

function showWeatherError(message) {
  elements.weatherInfo.style.opacity = '0.2';
  elements.weatherError.textContent = message;
  elements.weatherError.style.display = 'block';

  setTimeout(() => {
      elements.weatherError.style.display = 'none';
      elements.weatherInfo.style.opacity = '1';
  }, 3000);
}

async function updateWeatherInfo(city) {
  try {
      const weatherData = await fetchWeatherData(city);

      elements.temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;
      elements.condition.textContent = weatherData.weather[0].main;
      elements.cityName.textContent = weatherData.name;
      elements.humidity.textContent = `${weatherData.main.humidity}%`;
      elements.windSpeed.textContent = `${weatherData.wind.speed.toFixed(1)} m/s`;
      
      const iconCode = weatherData.weather[0].icon;
      elements.weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      elements.weatherIcon.alt = weatherData.weather[0].description;
      
      elements.weatherError.style.display = 'none';
      elements.weatherInfo.style.opacity = '1';
      
  } catch (error) {
      console.error('Error:', error.message);
      showWeatherError(error.message);
      throw error;
  }
}

init();
