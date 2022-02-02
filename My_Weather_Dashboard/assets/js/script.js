//Get cityName from Search Input on SearchBtn Click
var cityInput = $("#cityName");
var searchBtn = $("#searchBtn");
cityInput.focus();

// Search Weather Api with cityCoords
async function getCityWeather() {
  var cityValue = cityInput.val().replace(/\s/g, "+");
  // console.log(cityValue);

  //  Convert cityName to cityCoords
  const cityToCoords = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityValue}&limit=1&appid=ca658b3681c8bcc081b9fb02fedb375d`
  );
  const coords = await cityToCoords.json();
  // console.log(coords);

  var latCurrent = coords[0].lat;
  var lonCurrent = coords[0].lon;
  // console.log(latCurrent);
  // console.log(lonCurrent);

  const getWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=ca658b3681c8bcc081b9fb02fedb375d`
  );

  const weather = await getWeather.json();
  // console.log(weather);

  const getFullWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${latCurrent}&lon=${lonCurrent}&appid=ca658b3681c8bcc081b9fb02fedb375d`
  );

  const fullWeather = await getFullWeather.json();
  // console.log(fullWeather);

  //  Update City Name and Date (Weather Based Icon)
  var cityTitle = $("#currCity");
  var currCountry = $("#country");
  var currDate = $("#currDate");
  var weatherImg = $("#wicon");

  cityTitle.text(weather.name);
  currCountry.text(weather.sys.country);

  var today = moment(weather.dt, "X").format("(M/DD/YYYY)");
  currDate.text(today);

  var iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`;
  weatherImg.attr("src", iconUrl);

  //  Update Temp Wind Humid
  var temp = $("#temp");
  var calcTemp = Math.round(((parseInt(weather.main.temp) - 273.15) * 9) / 5 + 32);

  temp.text(calcTemp);

  var wind = $("#wind");
  wind.text(weather.wind.speed);

  var humid = $("#humid");
  humid.text(weather.main.humidity);

  //  Update UV Index and add bg success warning danger after evaluating

  var uvIndex = $("#uvIndex");
  var uvi = fullWeather.current.uvi;
  if (uvi <= 2) {
    var uvBtn = $('<button class="btn btn-success fs-6 text-white">');
    uvBtn.text(uvi);
    uvIndex.html(uvBtn);
  } else if (uvi >= 3 && uvi <= 5) {
    var uvBtn = $('<button class="btn btn-warning fs-6 text-white">');
    uvBtn.text(uvi);
    uvIndex.html(uvBtn);
  } else if (uvi >= 6) {
    var uvBtn = $('<button class="btn btn-danger fs-6 text-white">');
    uvBtn.text(uvi);
    uvIndex.html(uvBtn);
  }

  //5 Day foreCast

  // Get 5day data
  var fiveDays = fullWeather.daily.splice(0, 5);

  // Make new card for each day in data
  fiveDays.forEach((day, index, arr) => {
    var getDay = $(`#${index}-day`);
    var convertedDay = moment(day.dt, "X").format("dddd, MMMM Do");
    getDay.text(convertedDay);

    var getIcon = $(`#${index}-img`);
    var iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;

    getIcon.attr("style", "width: 4rem; height: 4rem");
    getIcon.attr("src", iconUrl);

    var getTemp = $(`#${index}-temp`);
    var convertedTemp = Math.round(((parseInt(day.temp.day) - 273.15) * 9) / 5 + 32);
    getTemp.text(convertedTemp);

    var getWind = $(`#${index}-wind`);
    var windSpeed = day.wind_speed;
    getWind.text(windSpeed);

    var getHumid = $(`#${index}-humid`);
    var humid = day.humidity;
    getHumid.text(humid);
  });
}

// Save cityName to localStorage
var savedCities = JSON.parse(localStorage.getItem("savedCities")) || [];

function saveTheCity() {
  //  Add new Button with current City Name as text and value
  var thisCity = cityInput.val().trim();
  if (thisCity != "" && savedCities.indexOf(thisCity) === -1) {
    savedCities.unshift(thisCity);
  } else {
    cityInput.val("");
    cityInput.attr("placeholder", "Please Enter A City");
  }
  localStorage.setItem("savedCities", JSON.stringify(savedCities));
}

function renderSearchHistory() {
  var getHistory = $("#searchHistory");
  getHistory.empty();

  for (city of savedCities) {
    var newBtnGroup = $(
      '<div class="btn-group d-flex align-items-stretch my-2" role="group" aria-label="City Button">'
    );
    var newBtn = $(`<button class="btn btn-secondary p-0 fs-6 w-75" style="opacity:0.7;">`);
    var closeBtn = $(`<button type="button" class="btn btn-close p-3 fs-6 bg-secondary" aria-label="Close">`);

    newBtn.text(city);
    newBtnGroup.append(newBtn);
    newBtnGroup.append(closeBtn);
    getHistory.append(newBtnGroup);
  }
}
renderSearchHistory();

var savedBtns = $('button[class*="btn-secondary"]');

searchBtn.click(() => {
  getCityWeather();
  saveTheCity();
  renderSearchHistory();
});

cityInput.keydown((event) => {
  if (event.which == 13) {
    getCityWeather();
    saveTheCity();
    renderSearchHistory();
  }
});

$(document).on("click", ".btn-close", (event) => {
  var thisCity = event.target;
  var parentEl = thisCity.parentElement;

  for (var i = 0; i < savedCities.length; i++) {
    if (parentEl.innerText === savedCities[i]) {
      savedCities.splice(i, 1);
    }
  }

  localStorage.setItem("savedCities", JSON.stringify(savedCities));
  parentEl.remove();
});

$(document).on("click", ".btn-secondary", (event) => {
  var savedCity = event.target.innerText;
  cityInput.val(savedCity);

  getCityWeather();

  cityInput.val("");
});
