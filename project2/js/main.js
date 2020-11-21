"use strict";

// Constant URLS
const PokiAPI_URL = "https://pokeapi.co/api/v2/";
const PokiParkArea_URL = PokiAPI_URL + "pal-park-area/";
const Pokemon_URL = PokiAPI_URL + "pokemon/";
const PokiSpecies_URL = PokiAPI_URL + "pokemon-species/";
const encounterSprite_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";
const teamKey = "msm6982-team";

let currentTeam = [];
let currentTeamHTML = [];
let areaNums = [];

let caughtPokemon = "";

// Load areas and add event listeners
function setupFunctions() {
    getAreas();
    document.querySelector("#searchButton button").addEventListener('click', manualSearch);
    document.querySelector("#teamDisplay button").addEventListener('click', releaseTeam);
    loadSavedData();

}

window.onload = setupFunctions;

// Load the locally saved search term 
function loadSavedData() {
    const searchTerm = document.querySelector("#searchTerm");
    const prefix = "msm6982-";
    const searchKey = prefix + "search";


    const savedSearch = localStorage.getItem(searchKey);
    const savedTeam = localStorage.getItem(teamKey);

    if (savedSearch) {
        document.querySelector("#searchTerm").value = savedSearch;
    }
    else {
        document.querySelector("#searchTerm").value = "Pikachu";
    }

    // Not yet implemented will always go to else
    if (savedTeam) {
        currentTeam = savedTeam;
    }
    else {
        document.querySelector("#teamStatus").innerHTML = "<p>Team Status: Catch a Pokémon!</p>"
    }

    searchTerm.onchange = e => { localStorage.setItem(searchKey, e.target.value); };
    /*
    currentTeam.onchange = e => {
        localStorage.setItem(teamKey, currentTeam);
        
        currentTeam.forEach(pokemon => {
            GetTeamMember(pokemon);
        });
        
    }
    */
}

// Get the areas the user can choose from using the pal park area endpoint
function getAreas(e) {
    let xhr = new XMLHttpRequest();
    let url = PokiParkArea_URL;
    xhr.onload = areasLoaded;
    xhr.open("GET", url);
    xhr.send();
}

// Get the current team based on the 
function getTeamMember(e) {
    let xhr = new XMLHttpRequest();
    let url = Pokemon_URL + e + "/";
    xhr.onload = loadTeamPokemon;
    xhr.open("GET", url);
    xhr.send();
}

// Get the pokemons the user can choose from using an area form pal park area endpoint
function getEncounters(e) {
    let xhr = new XMLHttpRequest();
    let buttonId = parseInt(this.attributes[1].nodeValue);
    let correctArea = areaNums[buttonId]

    let url = PokiParkArea_URL + correctArea + "/";

    xhr.onload = encounterLoad;
    xhr.open("GET", url);
    xhr.send();
}

// Get the pokemon the user searched for
function manualSearch(e) {
    let term = document.querySelector("#searchTerm").value;
    term = term.trim();
    if (term.length < 1) return;
    manualSearchData(term.toLowerCase());
}

// Get the ur to get searched pokemon data
function manualSearchData(e) {
    let xhr = new XMLHttpRequest();
    let url = Pokemon_URL + e + "/";
    xhr.onload = catchManualSearch;
    xhr.onerror = faildTerm;
    xhr.open("GET", url);
    xhr.send();
}

// Do nothing if a term wasn't found
function faildTerm(e) {

}

// Display a pokemon that came as a result of a manual search
function catchManualSearch(e) {
    clearSearch();
    if (e.target.responseText == "Not Found") {
        document.querySelector("#searchStatus").innerHTML = "<p>Nothing was found!</p>";
        return;
    }


    let obj = JSON.parse(e.target.responseText);

    let searchSprite = document.querySelector("#searchMedia");
    let searchContent = document.querySelector("#searchDIV");
    let searchButton = document.querySelector("#catchButton");
    searchButton.addEventListener('click', catchFromSearch);

    let objName = obj.name;
    let searchName = capFirstLetter(objName);
    let searchID = obj.id;
    let searchDisplay = "";
    if (searchID > 649) {
        searchDisplay = obj.sprites.front_default;
    }
    else {
        searchDisplay = obj.sprites.versions['generation-v']['black-white'].animated.front_default;
    }


    caughtPokemon = searchName;

    document.querySelector("#searchStatus").innerHTML = "<p>A wild " + searchName + " appeared!</p>";

    searchSprite.innerHTML = "<img src='" + searchDisplay + "' alt='" + searchName + " spirte'>";
    searchContent.innerHTML = "<span><p><b>" + searchName + "</b></p></span>";
    searchButton.setAttribute("value", searchID);
    searchButton.innerHTML = "<button>Catch!</button>";
    searchButton.addEventListener('click', catchFromSearch);
}

// Add a caught pokemon from manual search to the team
function catchFromSearch(e) {
    clearSearch();
    document.querySelector("#searchStatus").innerHTML = "<p>Gotcha! " + caughtPokemon + " was caught!</p>";
    caughtPokemon = "";
    addPokemonToTeam(e);
}


// Load three areas the user can click to encounter pokemon from that area
function areasLoaded(e) {
    // Clear all the choices and the saved areas
    clearChoices();
    areaNums.length = 0;

    let obj = JSON.parse(e.target.responseText);

    // Total possible areas
    let possibleAreas = obj.results.length;
    // Array to save refrences to areas selected
    let displayAreas = [];

    // Randomly get new area and save their index
    for (let index = 0; index < 3; index++) {
        let randomPossibleArea = Math.floor((Math.random() * possibleAreas));

        while (displayAreas.includes(randomPossibleArea) == true) {
            randomPossibleArea = Math.floor((Math.random() * possibleAreas));
        }

        displayAreas[index] = randomPossibleArea;
    }

    // itteration index for the for loop
    let addId = 0;

    // get all the choices and divs
    let choiceContent = document.querySelectorAll(".choiceDIV");
    let choiceIMG = document.querySelectorAll(".choiceMedia");
    let choiceButton = document.querySelectorAll(".choiceButton");

    // change the slection heading
    document.querySelector("#functionHeading").innerHTML = "<h2>Pokémon are in these areas!</h2>";

    // for each saved area assign data about them in the Search and catch div, also save an index to those area for encounters
    displayAreas.forEach(area => {

        let areaName = obj.results[area].name;
        let capsName = capFirstLetter(areaName);

        choiceContent[addId].innerHTML = "<p><b>" + capsName + "</b></p>";

        choiceIMG[addId].innerHTML = "<img src='images/" + areaName + ".png' alt='" + capsName + " Image'>";
        //project2\images\pond.png
        choiceButton[addId].innerHTML = "<button>Explore Here!</button>";

        areaNums.push((area + 1));

        addId += 1;
    });

    // Add the get encouter event lisnter for users to encount pokemon in a slected area
    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', getAreas);
        button.removeEventListener('click', addPokemonToTeam);
        button.addEventListener('click', getEncounters);
    });

}

// Load three encounts the user can click on to add to their team (team adding to be implemented) 
function encounterLoad(e) {
    clearChoices();
    let obj = JSON.parse(e.target.responseText);

    // Get the name of the area
    let objName = obj.name;
    let capsName = capFirstLetter(objName);

    // Change function heading to show the selected area
    let encounteredHeading = "<h2>Wild Pokémon appeared in the " + capsName + "!</h2>";
    document.querySelector("#functionHeading").innerHTML = encounteredHeading;

    // Get all the possible encounts
    let possiblePokemon = obj.pokemon_encounters.length;
    let displayPokemon = [];

    // Randomly select 3 pokemon that can be encountered form this area and save a refrence to them
    for (let index = 0; index < 3; index++) {
        let randomPossiblePokemon = Math.floor((Math.random() * possiblePokemon));

        while (displayPokemon.includes(randomPossiblePokemon) == true) {
            randomPossiblePokemon = Math.floor((Math.random() * possiblePokemon));
        }

        displayPokemon[index] = randomPossiblePokemon;
    }

    // Index itteration for the for each loop
    let addId = 0;

    // Getting all the content divs to add information to each of them 
    let choiceSprite = document.querySelectorAll(".choiceMedia");
    let choiceContent = document.querySelectorAll(".choiceDIV");
    let choiceButton = document.querySelectorAll(".choiceButton");

    // For each encountered pokemon who's encounter index was saved, use that index to display there name and a sprite
    displayPokemon.forEach(area => {

        let pokemonName = obj.pokemon_encounters[area].pokemon_species.name;
        let capsName = capFirstLetter(pokemonName);


        let dexIndex = getLastOfUrl(obj.pokemon_encounters[area].pokemon_species.url);
        let spriteUrl = encounterSprite_URL + dexIndex + ".gif";

        choiceSprite[addId].innerHTML = "<img src='" + spriteUrl + "' alt='" + capsName + " spirte'>";
        choiceContent[addId].innerHTML = "<span><p><b>" + capsName + "</b></p></span>";
        choiceButton[addId].setAttribute("value", dexIndex);
        choiceButton[addId].innerHTML = "<button>Catch!</button>";

        addId += 1;
    });

    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', getEncounters);
        button.addEventListener('click', getAreas);
        button.addEventListener('click', addPokemonToTeam);
    });
}

// Get the end pf a url, used tp get sprite gif
function getLastOfUrl(url) {
    url = url.split('/');
    url.pop();
    url = url.pop();
    return url;
}

// Add the pokemon to the current team
function addPokemonToTeam(e) {
    let pokeIndex = ""
    if (!e.currentTarget) {
        pokeIndex = e.attributes[2].value;
    }
    else {
        pokeIndex = e.currentTarget.attributes[2].value;
    }

    if (currentTeam.length < 6) {

        currentTeam.push(pokeIndex);
        getTeamMember(currentTeam[currentTeam.length - 1]);

    }
    else {
        document.querySelector("#teamStatus").innerHTML = "<p>Your team is already full!</p>";
    }
}



// Helper method for clearing div content so new stuff can load
function clearChoices() {
    let clearMedia = document.querySelectorAll(".choiceMedia");
    let clearContent = document.querySelectorAll(".choiceDIV");
    let clearButton = document.querySelectorAll(".choiceButton");

    document.querySelector("#functionHeading").innerHTML = "";

    clearButton.forEach(button => {
        button.innerHTML = "";
    });
    clearContent.forEach(content => {
        content.innerHTML = "";
    });
    clearMedia.forEach(media => {
        media.innerHTML = "";
    });
}

// Clear infomation of the search section
function clearSearch() {
    document.querySelector("#searchMedia").innerHTML = "";
    document.querySelector("#searchDIV").innerHTML = "";
    document.querySelector("#catchButton").innerHTML = "";
}

// Get a pokemons name, dex mumber, weight, animated sprite, and an ability
// This infomation is parsed so that it's displayed in a neat mannor 
function loadTeamPokemon(e) {
    let obj = JSON.parse(e.target.responseText);
    let objName = obj.name;
    let pokemonName = capFirstLetter(objName);
    let pokemonWeight = (obj.weight / 10);
    let pokemonHeight = (obj.height * 10);
    let randomAbility = Math.floor((Math.random() * obj.abilities.length));
    let pokemonID = obj.id;
    let spriteDisplay = "";
    if (pokemonID > 649) {
        spriteDisplay = obj.sprites.front_default;
    }
    else {
        spriteDisplay = obj.sprites.versions['generation-v']['black-white'].animated.front_default;
    }


    // Get the pokemon id and diplay it how it is displayed in the offical pokedex

    if (pokemonID < 100) {
        pokemonID = "0" + pokemonID;
        if (pokemonID < 10) {
            pokemonID = "0" + pokemonID;
        }
    }


    pokemonID = "#" + pokemonID;
    let nameID = pokemonID + " " + pokemonName;

    // Get the ability of a pokemon and display it neatly
    let pokemonAbility = "Not Yet Discovered!";
    if (pokemonID < 808) {
        pokemonAbility = obj.abilities[randomAbility].ability.name;
        pokemonAbility = pokemonAbility.split('-');
        if (pokemonAbility.length == 2) {
            pokemonAbility = capFirstLetter(pokemonAbility[0]) + " " + capFirstLetter(pokemonAbility[1]);
        }
        else {
            pokemonAbility = capFirstLetter(pokemonAbility[0]);
        }
    }

    // Get the typing of pokemon (some have more than one type)
    let pokemonTypes = "";
    pokemonTypes = capFirstLetter(obj.types[0].type.name);
    if (obj.types.length == 2) {
        pokemonTypes = pokemonTypes + " - " + capFirstLetter(obj.types[1].type.name);
    }

    // Part of Sting that will be saved 
    let contentToAdd = "";
    contentToAdd += "<div class = 'teamMember' id='" + pokemonName + "'>";
    contentToAdd += "<div class = 'teamIMG'>"
    contentToAdd += "<img src='" + spriteDisplay + "' alt='" + pokemonName + " spirte'></div>";
    contentToAdd += "<span><p>";
    contentToAdd += "<b>" + nameID + "</b><br>" + "Type: " + pokemonTypes + "<br>Ability: " + pokemonAbility + "<br>Weight: " + pokemonWeight + " kg Height: " + pokemonHeight + " cm";
    contentToAdd += "</p><a href='https://bulbapedia.bulbagarden.net/wiki/" + pokemonName + "_(Pokémon)' target='_blank'>Visit Bulbapedia for More Info!</a>"
    contentToAdd += "</span></div>";
    currentTeamHTML.push(contentToAdd);
    loadAllMembers();
}

// Load all the saved team members
function loadAllMembers() {
    let allTeamContent = "";
    document.querySelector("#teamStatus").innerHTML = "<p>Team Status: " + (6 - currentTeam.length) + " slot(s) left on your team</p>";
    currentTeamHTML.forEach(teamMember => {
        allTeamContent += teamMember;
    });
    document.querySelector("#teamInfo").innerHTML = allTeamContent;
}

// Help method that capitalizes
function capFirstLetter(e) {
    let capWord = e.charAt(0).toUpperCase() + e.slice(1);
    return capWord;
}

// Release all the team pokemon, reseting the team display and arrays
function releaseTeam(e) {
    document.querySelector("#teamStatus").innerHTML = "<p>Team Status: Catch a Pokémon!</p>";
    currentTeam.length = 0;
    currentTeamHTML.length = 0;
    document.querySelector("#teamInfo").innerHTML = "";
}