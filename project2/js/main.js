"use strict";
// 

// Constant URLS
const PokiAPI_URL = "https://pokeapi.co/api/v2/";
const PokiParkArea_URL = PokiAPI_URL + "pal-park-area/";
const Pokemon_URL = PokiAPI_URL + "pokemon/";
const PokiSpecies_URL = PokiAPI_URL + "pokemon-species/";
const encounterSprite_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";
const teamKey = "msm6982-team";

let currentTeam = [];
let teamDIV = [];
let areaNums = []
let encounterNums = []
let buttons = [];

let loadedSprite = "";

// Load areas and add event listeners
function SetupFunctions() {
    GetAreas();
    document.querySelector("#searchButton button").addEventListener('click', ManualSearch);
    LoadSavedData();

}

window.onload = SetupFunctions;


function LoadSavedData() {
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

    if (savedTeam) {
        currentTeam = savedTeam;
    }
    else {
        document.querySelector("#teamInfo").innerHTML = "<p>Catch a Pokémon!<p/>"
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
function GetAreas(e) {
    let xhr = new XMLHttpRequest();
    let url = PokiParkArea_URL;
    xhr.onload = AreasLoaded;
    xhr.open("GET", url);
    xhr.send();
}

// Get the current team based on the 
function GetTeamMember(e) {
    let xhr = new XMLHttpRequest();
    let url = Pokemon_URL + e + "/";
    xhr.onload = LoadTeamPokemon;
    xhr.open("GET", url);
    xhr.send()
}

// Get the pokemons the user can choose from using an area form pal park area endpoint
function GetEncounters(e) {
    let xhr = new XMLHttpRequest();
    let buttonId = parseInt(this.attributes[1].nodeValue);
    let correctArea = areaNums[buttonId]

    let url = PokiParkArea_URL + correctArea + "/";

    xhr.onload = EncounterLoad;
    xhr.open("GET", url);
    xhr.send();
}

function ManualSearch(e) {


}

function ManualSearchData(e) {

}


// Load three areas the user can click to encounter pokemon from that area
function AreasLoaded(e) {
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
    let choiceButton = document.querySelectorAll(".choiceButton");
    // change the slection heading
    document.querySelector("#functionHeading").innerHTML = "<h2>Pokémon are in these areas!</h2>";
    // for each saved area assign data about them in the Search and catch div, also save an index to those area for encounters
    displayAreas.forEach(area => {

        let areaName = obj.results[area].name;
        let capsName = CapFirstLetter(areaName);

        choiceContent[addId].innerHTML = "<p>" + capsName + "</p>";

        choiceButton[addId].innerHTML = "<button>Explore Here!</button>";

        areaNums.push((area + 1));

        addId += 1;
    });
    // 4
    // Add the get encouter event lisnter for users to encount pokemon in a slected area
    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', GetAreas);
        button.removeEventListener('click', AddPokemonToTeam);
        button.addEventListener('click', GetEncounters);
    });

}

// Load three encounts the user can click on to add to their team (team adding to be implemented) 
function EncounterLoad(e) {
    clearChoices();
    let obj = JSON.parse(e.target.responseText);

    // Get the name of the area
    let objName = obj.name;
    let capsName = CapFirstLetter(objName);

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
        let capsName = CapFirstLetter(pokemonName);
        let allContent = "<span><p>" + capsName + "</p></span>";

        choiceContent[addId].innerHTML = allContent;
        let dexIndex = GetLastOfUrl(obj.pokemon_encounters[area].pokemon_species.url);
        let spriteUrl = encounterSprite_URL + dexIndex + ".gif";

        choiceSprite[addId].innerHTML = "<img src='" + spriteUrl + "' alt='" + capsName + " spirte'>";
        choiceButton[addId].setAttribute("value", dexIndex);
        choiceButton[addId].innerHTML = "<button>Catch!</button>";

        addId += 1;
    });

    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', GetEncounters);
        button.addEventListener('click', GetAreas);
        button.addEventListener('click', AddPokemonToTeam);
    });
}

function GetLastOfUrl(url) {
    url = url.split('/');
    url.pop();
    url = url.pop();
    return url;
}

function AddPokemonToTeam(e) {
    let pokeIndex = e.currentTarget.attributes[2].value;
    currentTeam.push(pokeIndex);
    GetTeamMember(currentTeam[currentTeam.length - 1]);
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

// Get a pokemons name, dex mumber, weight, animated sprite, and an ability
// This infomation is parsed so that it's displayed in a neat presentable mannor 
function LoadTeamPokemon(e) {
    let obj = JSON.parse(e.target.responseText);
    let objName = obj.name;
    let pokemonName = CapFirstLetter(objName);
    let pokemonWeight = obj.weight;
    let  randomAbility = Math.floor((Math.random() * obj.abilities.length));
    let pokemonID = obj.id;
    let spriteDisplay = obj.sprites.versions['generation-v']['black-white'].animated.front_default;
    console.log(spriteDisplay);
    if(pokemonID < 100){
        pokemonID = "0" + pokemonID; 
        if(pokemonID < 10)
        {
            pokemonID = "0" + pokemonID;
        }
    }
    pokemonID = "#" + pokemonID;
    let nameID = pokemonID + " " + pokemonName;
    
    let pokemonAbility = obj.abilities[randomAbility].ability.name;
    pokemonAbility = pokemonAbility.split('-');
    if(pokemonAbility.length == 2)
    {
        pokemonAbility = CapFirstLetter(pokemonAbility[0]) + " " + CapFirstLetter(pokemonAbility[1]);
    }
    else
    {
        pokemonAbility = CapFirstLetter(pokemonAbility[0]);
    }
    let pokemonTypes = "";
    if(obj.types.length == 2)
    {
        let type1 = CapFirstLetter(obj.types[0].type.name);
        let type2 = CapFirstLetter(obj.types[1].type.name);
        pokemonTypes = type1 + " - " + type2;
        
    }
    else
    {
        pokemonTypes = CapFirstLetter(obj.types[0].type.name);
    }
    
    console.log(nameID);
    console.log(pokemonTypes);
    console.log(pokemonAbility);
    console.log(pokemonWeight);
    
}

// Help method that capitalizes
function CapFirstLetter(e)
{
    let capWord = e.charAt(0).toUpperCase() + e.slice(1);
    return capWord;
}