$(document).ready(function () {
    var searchHistory = [];

    const momentDay = moment().format('dddd, MMMM Do');
    $('.todayDate').prepend(momentDay);

    for (var i = 1; i < 6; i++) {
        $(`#${i}Date`).text(moment().add(i, 'd').format('dddd, MMMM Do'));
    }
    
    $('form').on('submit', function (event) {
        event.preventDefault();
       
        let city = $('input').val();
        
        if (city === '') {
            return;
        }

        call();

        $('form')[0].reset();
    });

    $('.searchHistoryEl').on('click', '.historyBtn', function (event) {
        event.preventDefault();

        let btnCityName = $(this).text();
        
        call(btnCityName);
    });

    $('#clearBtn').on('click', function (event) {
        event.preventDefault();
        
        window.localStorage.clear();
        
        $('.searchHistoryEl').empty();
        searchHistory = [];
        renderButtons();
        
        $('form')[0].reset();
    });

    const renderButtons = () => {
        
        $('.searchHistoryEl').html('');
       
        for (var j = 0; j < searchHistory.length; j++) {
            
            let cityName1 = searchHistory[j];
            let historyBtn = $(
                '<button type="button" class="btn btn-primary btn-lg btn-block historyBtn">'
            ).text(cityName1);
            
            $('.searchHistoryEl').prepend(historyBtn);
        }
    };
    
    const init = () => {
      
        let storedCities = JSON.parse(localStorage.getItem('searchHistory'));
        
        if (storedCities !== null) {
            searchHistory = storedCities;
        }
        
        renderButtons();
    };

    init();
    
    const storeCities = () =>
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    const uvCall = (lon, lat) => {
        let uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&units=imperial&appid=77cb488591d883bec900753d1136d81c`;

        $.ajax({
            url: uvQueryURL,
            method: 'GET',
        }).then(function (uvResponse) {
            // Display UV Index data
            $('#uvData').html(`${uvResponse.value}`);
            // Color code the UV Index row
            if (uvResponse.value <= 2) {
                $('.uvRow').css('background-color', 'green');
            } else if (uvResponse.value > 2 && uvResponse.value <= 5) {
                $('.uvRow').css('background-color', 'yellow');
            } else if (uvResponse.value > 5 && uvResponse.value <= 7) {
                $('.uvRow').css('background-color', 'orange');
            } else if (uvResponse.value > 7 && uvResponse.value <= 10) {
                $('.uvRow').css('background-color', 'red');
            } else {
                $('.uvRow').css('background-color', 'violet');
            }
        });
    };

   
    const fiveDay = (lon, lat) => {
        let fiveQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=imperial&appid=77cb488591d883bec900753d1136d81c`;

        $.ajax({
            url: fiveQueryURL,
            method: 'GET',
        }).then(function (fiveResponse) {
            // Loops through the forecast starting tomorrow
            for (var k = 1; k < 6; k++) {
                // Displays the image in the appropriate card
                $(`#${k}img`).attr(
                    'src',
                    `http://openweathermap.org/img/wn/${fiveResponse.daily[k].weather[0].icon}@2x.png`
                );
                // Displays the temp in the appropriate card
                $(`#${k}temp`).html(
                    `Temp: ${fiveResponse.daily[k].temp.day} &#8457;`
                );
                // Displays the humidity in the appropriate card
                $(`#${k}humid`).html(
                    `Humidity: ${fiveResponse.daily[k].humidity}%`
                );
            }
        });
    };

    const call = (btnCityName) => {
        let cityName = btnCityName || $('input').val();
        
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=77cb488591d883bec900753d1136d81c`;
       
        $.ajax({
            url: queryURL,
            method: 'GET',
        })
            .then(function (response) {
                if (!btnCityName) {
                    // Adds the searched city to the search history array
                    searchHistory.unshift(cityName);
                    // Runs function to store the search history array in local storage
                    storeCities();
                    // Runs function to create and display buttons of prior searched cities
                    renderButtons();
                }
                // Collect lon and lat for subsequent API calls
                var lon = response.coord.lon;
                var lat = response.coord.lat;
                // Lists the data in the Jumbotron
                $('#cityName').text(response.name);
                $('#currentImg').attr(
                    'src',
                    `http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`
                );
                $('#tempData').html(`${response.main.temp} &#8457;`);
                $('#humidData').html(`${response.main.humidity}%`);
                $('#windData').html(`${response.wind.speed} mph`);
                $('#windArrow').css({
                    transform: `rotate(${response.wind.deg}deg)`,
                });
                // Calls the API for uv index data
                uvCall(lon, lat);
                // Calls the API for five-day forecast info
                fiveDay(lon, lat);
            })
            // If an error is returned
            .catch(function (error) {
                // Throws an alert if invalid city
                alert('Enter a valid city');
            });
    };
    call(searchHistory[0]);
});
