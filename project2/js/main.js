"use strict";
// 1
window.onload = SetUPStuff;

const PokiAPI_URL = "https://pokeapi.co/api/v2/";
const PokiParkArea_URL = PokiAPI_URL + "pal-park-area/";
const PokiTeam_URL = PokiAPI_URL + "pokemon/";
const PokiSpecies_URL = PokiAPI_URL + "pokemon-species/";
const encounterSprite_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/";
let currentTeam = [];
let areaNums = []
let encounterNums = []
let buttons = [];

let loadedSprite = "";

function SetUPStuff() {
    GetAreas();
}

// Get the areas the user can choose from using the pal park area endpoint
function GetAreas(e) {
    let xhr = new XMLHttpRequest();
    let url = PokiParkArea_URL;
    xhr.onload = AreasLoaded;
    xhr.open("GET", url);
    xhr.send();
}

function GetTeam(e) {

}

// Get the areas the user can choose from using an area form pal park area endpoint
function GetEncounters(e) {
    let xhr = new XMLHttpRequest();
    let buttonId = parseInt(e.path[1].id);
    let correctArea = areaNums[buttonId]

    let url = PokiParkArea_URL + correctArea + "/";

    xhr.onload = EncounterLoad;
    xhr.open("GET", url);
    xhr.send();
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
    document.querySelector("#functionHeading").innerHTML = "<h2>Pokemon are in these areas!</h2>";
    // for each saved area assign data about them in the Search and catch div, also save an index to those area for encounters
    displayAreas.forEach(area => {

        let areaName = obj.results[area].name;
        let capsName = areaName.charAt(0).toUpperCase() + areaName.slice(1);

        choiceContent[addId].innerHTML = "<p>" + capsName + "</p>";

        choiceButton[addId].innerHTML = "<button>Explore Here!</button>";

        areaNums.push((area + 1));

        addId+=1;
    });
    // 4
    // Add the get encouter event lisnter for users to encount pokemon in a slected area
    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', GetAreas);
        button.addEventListener('click', GetEncounters);
    });

}

// Load three encounts the user can click on to add to their team (team adding to be implemented) 
function EncounterLoad(e) {
    clearChoices();
    let obj = JSON.parse(e.target.responseText);

    // Get the name of the area
    let objName = obj.name;
    let capsName = objName.charAt(0).toUpperCase() + objName.slice(1);

    // Change function heading to show the selected area
    let encounteredHeading = "<h2>Wild Pokemon appeared in the " + capsName + "!</h2>";
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
        let capsName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
        let allContent = "<span><p>" + capsName + "</p></span>";

        choiceContent[addId].innerHTML = allContent;
        let dexIndex = GetLastOfUrl(obj.pokemon_encounters[area].pokemon_species.url);
        let spriteUrl = encounterSprite_URL + dexIndex + ".gif";

        console.log(spriteUrl);
        choiceSprite[addId].innerHTML = "<img src='" + spriteUrl + "' alt='" + capsName +" spirte'>";
        choiceButton[addId].innerHTML = "<button>Catch!</button>";

        addId+=1;
    });

    document.querySelectorAll(".choiceButton").forEach(button => {
        button.removeEventListener('click', GetEncounters);
        button.addEventListener('click', GetAreas);
    });
}

function GetLastOfUrl(url)
{
    url = url.split('/');
    url.pop();
    url = url.pop();
    return url;
}

// Helper method for clearing div content so new stuff can load
function clearChoices()
{
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
