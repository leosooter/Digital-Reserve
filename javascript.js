/*global localStorage */

//Toggle mobile menu open and closed
document.getElementById("mobile-menu-trigger").addEventListener('touchleave', toggleMenu);
document.getElementById("mobile-menu-trigger").addEventListener('click', toggleMenu);

function toggleMenu() {
    var trigger = document.getElementById("mobile-menu-trigger");
    var menu = document.getElementById("mobile-menu");
    if (trigger.className == "open-icon"){
        trigger.className = "close-icon";
        menu.className = "menu-visible";
    }
    else{
        trigger.className = "open-icon";
        menu.className = "menu-hidden";
    }
}

// Utility function to toggle class on any element
function toggleClass(target, class1, class2){
    if(target.className == class1){
        target.className = class2;
    }
    else{
        target.className = class1;
    }
}




var animals = ['Impala', 'Kudu', 'Duiker', 'Eland', 'Elephant', 'Hippopotomus', 'Giraffe', 'Zebra', 'Crested Porcupine', 'Warthog', 'Bush Pig', 'Vervet Monkey', 'Olive Baboon', 'White-Tailed Mongoose', 'Genet', 'Civit', 'Spotted Hyena', 'Black Backed Jackal', 'Lion', 'Leopard', 'African Wild Cat', 'Crested Guinea Fowl', 'Helmeted Guinea Fowl', 'Red-footed Francolin', 'Collared Dove', 'Southern Ground Hornbill', 'Red-Billed Hornbill', 'Tawney Eagle', 'Secretary Bird', 'Kori Bustard', 'Ostrich'];

document.getElementById("new-list").addEventListener('click', function() {
    var listName = document.getElementById("list-name-input").value;
    if(listName){
        localStorage.listName = listName;
        showList();
    }
});

function showList() {
    if(localStorage.listName){
        document.getElementById("list-name").innerHTML = localStorage.listName;
        toggleClass(document.getElementById("list"), "show", "hide");
        toggleClass(document.getElementById("manage-list"), "show", "hide");
    }
}

//Checks if user has visited page before- Creates a new list on first visit
window.addEventListener('load', function() {
    if(!localStorage.visited){
        newList();
        createList();
    }
    else{
        createList();
        showList();
    }
});

//Populates new animal list with species from "animal" array
//Creates a new user checklist to track which species have been checked off
function newList() {
    var checkList = [];
    localStorage.checkList = JSON.stringify(checkList);
    localStorage.animalList = JSON.stringify(animals);
}

//Loops through array and creates new list item in DOM for each string
function createList() {
    var animalList = JSON.parse(localStorage.animalList);
    var i;
    var anchor = document.getElementById("animals");
    for (i=0; i<animalList.length; i++){
        newListItem(animalList[i], anchor);
    }
}

//Creates new list item
function newListItem(text, anchor) {
    var checkList = JSON.parse(localStorage.checkList);
    var newLi = document.createElement("li");
    var newAnimal = document.createTextNode(text);
    newLi.appendChild(newAnimal);
    //newLi.className = "un-checked";
    if(checkList.indexOf(text) == -1){
        newLi.className = "un-checked";
    }
    else{
        newLi.className = "checked";
    }
    //Using childNode.length rather than lastChild allows easy adjustment for changes to the html
    anchor.insertBefore(newLi, anchor.childNodes[anchor.childNodes.length-4]);
    newLi.addEventListener('click', function() {
        addRemoveCheck(this);
        toggleClass(this, "un-checked", "checked");
    });
}

//Allows users to add new species to the list

//Add animal event
document.getElementById("add-animal").addEventListener('click', function() {
    var target= document.getElementById("animal-input");
    var input = document.getElementsByName("new-animal")[0];
    toggleClass(target, "show", "hide");
    input.focus();
});

//Creates new animal list item from input
document.getElementsByName("new-animal")[0].addEventListener("keyup", function(e){
    if(e.keyCode == 13){
        addAnimal();
    }
});

document.getElementById("add-animal-button").addEventListener("click", function(){
    addAnimal();
});

function addAnimal() {
    var value = document.getElementsByName("new-animal")[0].value;
    var anchor = document.getElementById("animals");
    if(value.length > 0){
        newListItem(value, anchor);
        storeAnimal(value);
        document.getElementsByName("new-animal")[0].value = "";
        document.getElementById("animal-input").className = "hide";
        
    }
}


function storeAnimal(value) {
    var listAdd = JSON.parse(localStorage.animalList);
    listAdd.push(value);
    localStorage.animalList = JSON.stringify(listAdd);
}
    
function addRemoveCheck(li) {
    var text = li.innerHTML;
    var checkList = JSON.parse(localStorage.checkList);
    if(checkList.indexOf(text) == -1){
        checkList.push(text);
    }
    else{
        checkList.splice(checkList.indexOf(text), 1);
    }
    localStorage.checkList = JSON.stringify(checkList);
}

var imgPath = "images/gallery/";
var gallery1 =['/IMAG0015','/IMAG0035','/IMAG0038','/IMAG0049','/IMAG0054','/IMAG0061','/IMAG0073','/IMAG0096','/IMAG0102','/IMAG0119','/IMAG0127'];
var gallery2 =['/IMAG0074','/IMAG0081','/IMAG0088','/IMAG0104','/IMAG0109','/IMAG0134','/IMAG0141','/IMAG0146','/IMAG0152','/IMAG0159','/IMAG0279','/IMAG0334','/IMAG0580','/IMAG0677'];
var gallery3 =['/IMAG0023','/IMAG0068','/IMAG0134','/IMAG0192','/IMAG0228','/IMAG0233','/IMAG0259','/IMAG0328','/IMAG0392','/IMAG0396','/IMAG0507','/IMAG0526','/IMAG0644','/IMAG0658'];

//Loads image gallery (preloads galleries 2 and 3)
window.addEventListener('load', function() {
    displayGallery(gallery3, "gallery3");
    displayGallery(gallery2, "gallery2");
    displayGallery(gallery1, "gallery1");
});

document.getElementById("cam1").addEventListener('click', function() {
    displayGallery(gallery1, "gallery1");
});

document.getElementById("cam2").addEventListener('click', function() {
    displayGallery(gallery2, "gallery2");
});

document.getElementById("cam3").addEventListener('click', function() {
    displayGallery(gallery3, "gallery3");
});

//Creates a new image gallery
function displayGallery(gallery, name) {
    var anchor = document.getElementById("gallery-wrapper");
    if(anchor.firstChild.id !== name){
        anchor.removeChild(anchor.firstChild);
        var newGallery = document.createElement('div');
        newGallery.id = name;
        newGallery.className = "gallery";
        anchor.appendChild(newGallery);
        var i;
        for(i=0; i<gallery.length; i++){
            var newDiv = document.createElement('div');
            newDiv.className = "image-box";
            var newImg = document.createElement('img');
            newImg.src = imgPath + name + gallery[i] + '.JPG';
            newDiv.appendChild(newImg);
            newGallery.appendChild(newDiv);
        } 
    }
}