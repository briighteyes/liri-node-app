require("dotenv").config();

//IMPORT FILES AND PACKAGES
var keys = require("./keys.js");
var axios = require('axios'); 
var fs = require('fs'); 
var Spotify = require('node-spotify-api');
var inquirer = require('inquirer');

//FORMAT CLI INPUT
let input = process.argv.slice(3).join(' '); 
let command = process.argv[2]; 

//PAIR USER INPUT WITH APPROPRIATE FUNCTION
function takeCommand (command) {
    switch(command) {
        case 'concert-this':
        concertThis(input);
        break; 

        case 'spotify-this-song':
        console.log(spotifyThisSong(input));
        break;
    
        case 'movie-this':
        console.log(movieThis(input));
        break; 

        case 'do-what-it-says':
        console.log(doWhatItSays(input)); 
        break; 

        default: console.log('fail'); 
        break; 

    }

}



//CONERT-THIS 
function concertThis(artist) {

    if (!artist) {
        artist = "Rise Against"; 
    }

    let queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
    
    axios.get(queryUrl).then(function(response) {
    let jsonData = response.data[0].venue;

    let concertInfo = [
        `\n\n\n\nYOUR CONCERT SEARCH RESULTS`, 
        `Artist: ${artist.toUpperCase()}`,
        `Venue: ${jsonData.name}`,
        `Location: ${jsonData.city}, ${jsonData.country}`,
        `Time of Event: ${response.data[0].datetime}`,

        ].join("\n") 
    

        fs.appendFile('log.txt', concertInfo, function (err) {
            if (err) throw err; 
            console.log('Successfully added Concert Data to log.txt'); 
        
         } )
      });
    }


//SPOTIFY-THIS-SONG
      function spotifyThisSong(song) {
        let spotify = new Spotify(keys.spotify);
        // If there is no song name, set the song to Blink 182's What's my age again
        if (!song) {
            song = "What's my age again";
        }
        spotify.search({ type: 'track', query: song }, function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            } else {
                let songInfo  = [
                    `\n\n\n\nYOUR SONG SEARCH RESULTS`, 
                    `Artist Name: ${data.tracks.items[0].album.artists[0].name}`,
                    `Song Name: ${song.toUpperCase()}`, 
                    `Album Name: ${data.tracks.items[0].album.name}`,
                    `URL: ${data.tracks.items[0].album.external_urls.spotify}`,
                ].join("\n");

                fs.appendFile('log.txt', songInfo, function (err) {
                    if (err) throw err; 
                    console.log('Successfully added Song Data to log.txt'); 
                
                 } )
            }
          });

        }


//MOVIE-THIS
    function movieThis(movieTitle) {

        if (!movieTitle) {
            movieTitle = "Braveheart";
        }
       
        let queryUrl = `http://www.omdbapi.com/?t=${movieTitle}&y=&plot=short&apikey=33981212`
        axios.get(queryUrl).then(function(response) {
            let jsonData = response.data; 

            let movieResponse = [
                `\n\n\n\nYOUR MOVIE SEARCH RESULTS`,                 
                `Year: ${jsonData['Year']}`,
                `Title: ${jsonData['Title']}`,
                `IMBD Rating: ${response.data.imdbRating}`,
                `Rotten Tomatoes Rating: ${response.data.Ratings[1].Value}`,
                `Country: ${jsonData['Country']}`,
                `Language: ${jsonData['Language']}`,
                `Plot: ${jsonData['Plot']}`,
                `Actors: ${jsonData['Actors']}`,
                ].join("\n");

                fs.appendFile('log.txt', movieResponse, function (err) {
                    if (err) throw err; 
                    console.log('Successfully added Movie Data to log.txt'); 
                
                 } )

        })
    
}
    

//DO-WHAT-IT-SAYS
function doWhatItSays() {
    
    // Reads the random text file and passes it to the spotify function
    fs.readFile("log.txt", "utf8", function(error, data) {
    });

//PROMPTS FOR QUESTIONS
let questions = [{
        type: 'list',
        name: 'programs',
        message: 'What would you like to do?',
        choices: ['Music', 'Movies', 'Concerts']
    },
    {
        type: 'input',
        name: 'songChoice',
        message: 'What is the name of the song you would like?',
        when: function(answers) {
            return answers.programs == 'Music';
        }
    
    },
    {
        type: 'input',
        name: 'movieChoice',
        message: 'What is the name of the movie you would like?',
        when: function(answers) {
            return answers.programs == 'Movies';
        }
    },
    {
        type: 'input',
        name: 'concertChoice',
        message: 'What is the name of the Artist whose Concert you would like to see?',
        when: function(answers) {
            return answers.programs == 'Concerts';
        }
    }
];

inquirer
    .prompt(questions)
    .then(answers => {
        console.log(answers);
        switch (answers.programs) {
            case 'Music':
                spotifyThisSong(answers.songChoice)
                break;
            case 'Movies':
                movieThis(answers.movieChoice);
                break;
            case 'Concerts':
                concertThis(answers.concertChoice);
                break;
            
            default:
                console.log('LIRI doesn\'t know that');
        }
    
    });
}



takeCommand(command); 

