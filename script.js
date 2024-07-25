const apiKey = '983febedfa8b54e18b34367cb7f8f6b3';
const apiUrl = 'https://api.openweathermap.org/data/2.5';

window.onload = () => {
  localStorage.clear();
};

async function getWeatherByCity(city) {
  try {
    const extendedForecastContainer = document.getElementById('extendedForecast');
    extendedForecastContainer.innerHTML = ``;
    showLoading()
    const response = await fetch(`${apiUrl}/weather?q=${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) {
      throw new Error('City not found');
    }
    const data = await response.json();
    displayWeather(data);
    updateRecentSearches(city);
  } catch (error) {
    displayError(error.message);
  } finally {
    hideLoading()
  }
}

async function getWeatherByLocation() {
  if (navigator.geolocation) {
    const extendedForecastContainer = document.getElementById('extendedForecast');
    extendedForecastContainer.innerHTML = ``;
    showLoading()
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const response = await fetch(`${apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const data = await response.json();
      displayWeather(data);
      hideLoading()
    });
  } else {
    displayError('Geolocation is not supported by this browser.');
  }
}

async function getExtendedForecast(city) {
  try {
    const response = await fetch(`${apiUrl}/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    displayExtendedForecast(data);
  } catch (error) {
    displayError('There has been a problem with your fetch operation.');
  }
}

function showLoading() {
  const weatherDisplay = document.getElementById('weatherDisplay');
  weatherDisplay.innerHTML = `
    <div class="text-center h-[70vh] flex items-center justify-center">
    <div class='absolute'>Loading...</div>
      <div class="loader"></div>
    </div>
  `;
}

function hideLoading() {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
}

function displayWeather(data) {
  const weatherDisplay = document.getElementById('weatherDisplay');
  weatherDisplay.innerHTML = `
    <div class="flex justify-between bg-blue-500 text-white  drop-shadow-md p-4 rounded">
    <div class='flex flex-col justify-evenly'>
      <h2 class="text-xl md:text-2xl font-bold">${data.name} (${new Date().toLocaleDateString()})</h2>
      <p class='text-sm md:text-md'>Temperature: ${data.main.temp.toFixed(2)}°C</p>
      <p class='text-sm md:text-md'>Wind: ${data.wind.speed.toFixed(2)} M/S</p>
      <p class='text-sm md:text-md'>Humidity: ${data.main.humidity}%</p>
      </div>
      <div class='flex flex-col items-center justify-center w-32 h-32  bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40'>
      <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
      <p class='text-xs md:text-large'>${data.weather[0].description}</p>
    </div>
    </div>
    <h1 class="extended-h1 my-4 text-2xl font-semibold" >5 days extended forecast:</h1>
  `;
  getExtendedForecast(data.name);
}

function displayExtendedForecast(data) {
  const extendedForecastContainer = document.getElementById('extendedForecast');
  extendedForecastContainer.innerHTML = ``;
  data.list.forEach((forecast, index) => {
    if (index % 8 === 0) { // Display forecast for every 24 hours (8 * 3-hour intervals)
      const forecastCard = document.createElement('div');
      forecastCard.className = 'p-4 text-white drop-shadow-md flex flex-col items-center   rounded shadow  bg-slate-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40';
      forecastCard.innerHTML = `
        <h3>${new Date(forecast.dt_txt).toLocaleDateString()}</h3>
        <div class=' bg-blue-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40 m-4'>
        <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
        </div>
        <p>Temp: ${forecast.main.temp.toFixed(2)}°C</p>
        <p>Wind: ${forecast.wind.speed.toFixed(2)} M/S</p>
        <p>Humidity: ${forecast.main.humidity}%</p>
      `;
      extendedForecastContainer.appendChild(forecastCard);
    }
  });
}

function updateRecentSearches(city) {
  let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  if (!recentSearches.includes(city)) {
    recentSearches.push(city);
    if (recentSearches.length > 5) {
      recentSearches.shift();
    }
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }
}

function renderRecentSearches() {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  const card = document.getElementById('recentSearchesCard');
  card.innerHTML = '';
  if (recentSearches.length > 0) {
    recentSearches.forEach((city) => {
      const cityButton = document.createElement('button');
      cityButton.className = 'block w-full text-left p-2 hover:bg-gray-200 border border-b-black border-b-100 ';
      cityButton.textContent = city;
      cityButton.addEventListener('click', () => {
        document.getElementById('cityInput').value = city;
        getWeatherByCity(city);
        card.classList.add('hidden');
      });
      card.appendChild(cityButton);
    });
    card.classList.remove('hidden');
  } else {
    card.classList.add('hidden');
  }
}

function filterRecentSearches(query) {
  const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
  const card = document.getElementById('recentSearchesCard');
  card.innerHTML = '';
  recentSearches.forEach((city) => {
    if (city.toLowerCase().includes(query.toLowerCase())) {
      const cityButton = document.createElement('button');
      cityButton.className = 'block w-full text-left p-2 hover:bg-gray-200';
      cityButton.textContent = city;
      cityButton.addEventListener('click', () => {
        document.getElementById('cityInput').value = city;
        getWeatherByCity(city);
        card.classList.add('hidden');
      });
      card.appendChild(cityButton);
    }
  });
  if (card.innerHTML === '') {
    card.classList.add('hidden');
  } else {
    card.classList.remove('hidden');
  }
}

function displayError(message) {
  const weatherDisplay = document.getElementById('weatherDisplay');
  weatherDisplay.innerHTML = `<p class="text-red-500">${message}</p>`;
}

// Event Listeners 

document.getElementById('searchButton').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (city) {
    getWeatherByCity(city);
  } else {
    const extendedForecastContainer = document.getElementById('extendedForecast');
    extendedForecastContainer.innerHTML = ``;
    displayError('Please enter a city name.');
  }
});

document.getElementById('cityInput').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query) {
    filterRecentSearches(query);
  } else {
    renderRecentSearches();
  }
});

document.getElementById('cityInput').addEventListener('focus', renderRecentSearches);
document.getElementById('cityInput').addEventListener('blur', () => {
  setTimeout(() => {
    document.getElementById('recentSearchesCard').classList.add('hidden');
  }, 200); // Delay hiding to allow click event to register
});

document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
      getWeatherByCity(city);
    } else {
      displayError('Please enter a city name.');
    }
  }
});

document.getElementById('currentLocationButton').addEventListener('click', getWeatherByLocation);

renderRecentSearches();
