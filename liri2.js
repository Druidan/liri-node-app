//Establish Dependancies
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const Spotify = require('node-spotify-api');
const moment = require('moment');
const keys = require("./keys.js");

//Establish API Keys from .env through keys.js
const spotify = new Spotify(keys.spotify);
const omdb = keys.omdb.apiKey;
const bit = keys.bitAPI.apiKey;

//Grab the command line information and narrow it down to user input.
let wholeEnchilada = process.argv.slice(3).join(" ")
let command = process.argv.splice(2,1).toString();


liriSearch(command)
function liriSearch(command){
    switch(command) {
        case "concert-this":
            bitThis()
            break;
        case "spotify-this-song":
            spotifyThis()
            break;
        case "movie-this":
            omdbThis()
            break;
        case "do-what-it-says":
            randomTxtThis()
            break;
        default:
            console.log("Hmmm... It looks like you didn't input one of the four valid commands. Please use only one of the following:\n'concert-this'\n'spotify-this-song'\n'movie-this'\nOr use 'do-what-it-says' if you want to see what search terms we're looking for! ;)")
            break;
    }
}

function bitThis(){
    artist = wholeEnchilada.replace("/","%252F").replace("?", "%253F").replace('"',"%27C");
    bitCall = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + bit;
    axios.get(bitCall).then(function(data){
            const dateTime = data.data[0].datetime
            const rawDate = dateTime.substring(0, dateTime.indexOf("T"));
            const date = moment(rawDate, "YYYY-MM-DD").format("L");
            let loggity = "\nWe've found the soonest upcoming show for " + wholeEnchilada +"!\n The Venue: " + data.data[0].venue.name + 
            "\n The Venue's Location: " + data.data[0].venue.city + ", " + data.data[0].venue.country + 
            "\n Date: " + date + "\n";
            console.log(loggity);
            fs.appendFile("log.txt", loggity, function (error){
                if (error) throw error;
                console.log("Your search has been saved to the log!")
            });
            consoleThanks()
    }).catch(function(error) {
        if (error.response) { //I'm pretty much taking this error catcher verbatim from Axios' npm documentation while adding my own message.
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            consoleError()
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
            consoleError()
            } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            consoleError()
            }
        console.log(error.config);
    });
}

function spotifyThis(){
    song = wholeEnchilada;
    if(!wholeEnchilada){
        song = "The Sign ace of base";
    }
    spotify
        .search({ type: 'track', query: song })
        .then(function(response) {
            let coreData = response.tracks.items[0]
            let loggity = "\nIt looks like we may have found your song!\n Artist(s): " + coreData.artists[0].name + 
            "\n Song Title: " + coreData.name + 
            "\n Album: " + coreData.album.name + 
            "\n Go Have a Listen on Spotify: " + coreData.href + "\n";
            console.log(loggity);
            fs.appendFile("log.txt", loggity, function (error){
                if (error) throw error;
                console.log("Your search has been saved to the log!")
            });
            consoleThanks();
        })
        .catch(function(err) {
            console.log(err);
            consoleError();
    });
}

function omdbThis(){
    movieTitle = wholeEnchilada;
    if(!wholeEnchilada){
        movieTitle = "Mr. Nobody";
    }
    movieQuery = "https://www.omdbapi.com/?t="+movieTitle+"&y=&plot=short&apikey=" + omdb;
    axios.get(movieQuery)
    .then( function(response) {
        console.log(response)
        let rottenTomatoRating;
        const rating = response.data.Ratings
        if(!rating[0].Source){
            return rottenTomatoRating = " and we don't have records of its Rotten Tomato Rating."
        } else {
            rating.forEach(function(i){
                if(i.Source === "Rotten Tomatoes"){
                    return rottenTomatoRating = ", and it currently has a " + i.Value + " on the Tomatometer at Rotten Tomatoes."
                }
            })
        }
        if(rottenTomatoRating === undefined){
            rottenTomatoRating = " and we don't have records of its Rotten Tomato Rating."
        }
        let loggity = "\nIt looks like we found your movie!\n Title: " + response.data.Title + 
        "\n Year: " + response.data.Year +
        "\n Country(ies): " + response.data.Country +
        "\n Language(s): " + response.data.Language +
        "\n Plot: " + response.data.Plot +
        "\n The Film Stars: " + response.data.Actors +
        "\n Its IMDB Rating sits at " + response.data.imdbRating + rottenTomatoRating + "\n";
        console.log(loggity);
        fs.appendFile("log.txt", loggity, function (error){
            if (error) throw error;
            console.log("Your search has been saved to the log!")
        });
        consoleThanks();
    }
    ).catch(function(error) {
        if (error.response) { //I'm pretty much taking this error catcher verbatim from Axios' npm documentation while adding my own message.
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            consoleError()
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
            consoleError()
            } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            consoleError()
            }
        console.log(error.config);
    });
}

function randomTxtThis(){
    fs.readFile("random.txt", 'utf8', (error, response) => {
        if(error){
            console.log(error);
            consoleError()
        }
        command = response.split(",")[0];
        wholeEnchilada = response.split(",")[1];
        liriSearch(command)
    })
}

function consoleThanks(){
    console.log("\nThank you for using LiriBot!\nCome back if you have any more searches you want to do!\nCommands:\n'concert-this' and the band's name for their next concert. \n'spotify-this-song' and the song title for details of any song.\n'movie-this' and a movie title for that movie's details,\nOr 'do-what-it-says' to see what we're searching!");
}

function consoleError(){
    console.log("\nHuh... We recieved an Error! Check to see if what you're searching for is accurate. If it is, then they probably aren't playing soon, or they aren't being tracked by our services. Sorry!")
}