/* Table of Contents
    1) Particle Type Obj - Sets atributes for all the particles used in the plugin

    2) Particle Creation- Creates all of the particles, sets their attributes and moves them to starting location
    
    3) Particle Movement- Controls the dynamic movement of the particles in response to users
    
    4) Utility Functions- used throughout the file
*/

////////// 1) Particle Type Obj - Sets atributes for all the particles used in the plugin

/* Key for each particle type:

    count : Sets the total number of particles of this type created by the createParticle function
    
    startingPoint : Sets the class or id of the element the particles will frame when page loads. First value must be "id" or "class".
                    If "class" is assigned the starting point will be the first instance of that class.

    hoverClass : This is the class assigned to any element in the DOM to trigger hover effect by this particle type on mouseover

    speed : Average time in ms each particle will take to move to a new location. 
            The speed of each particle is set randomly by the newParticle function, plus or minus 1.25X this value
            
    cssClass : Sets a css class for styling the particle. All particles are also assigned the class "particle" for general styling.
    
    

    
    containerClass : Optional- Sets the element that conatins the "mouseover" targets for this particle type.
                     Particles return to "startingPoint" when the cursor leaves this container
                     If not set, the particles will remain framing the last valid element that was hovered.

    height : Sets the height for the particle div

    width : Sets the width for the particle div

    zIndex : Sets the z-index for the particle div. Default is -1000. Note: setting the z-index for the particles higher than the element they
             are framing can cause a unstable hover effect as the particles travel between the cursor and the target element. This is especially
             true for small target elements with lots of particles framing them.
    
    colors : Array of possible particle colors- chosen randomly by newParticle function. Can be any valid color- named, hex, rgb ect.
    
    paths : The path a particle div follows is set by a Css transition property assigned to that div
            This contains an array of possible timing functions for the Css transition- chosen randomly by newParticle function.
    
    movement :  Determines whether each particle moves to an identical location on a new element or is assigned to a random position
                "linear"- each particle will move only horizontaly or vertically if the element they are moving to is on the same y or x axis
                "random"- each particle will be move in a random curve to the new element

    marginLeft : Adjust the left margin of the particle frame.

    marginTop : Adjust the top margin of the particle frame.

    currentLocation : Used to track the particles location and prevent them from re-shuffling themselves around the same element. Do not alter
*/
var particleType = {
    /*Use the default particle types below or add your own.
    New particle types must have a unique "hoverClass" assigned. All other variables are optional and will be assigned default values if
    skipped or left blank */

    menuParticle : {
        hoverClass : "menu-particle-hover",
        count : 400,
        startingPoint : ["class","current-page"],
        speed : 600,
        cssClass : "menu-particle",
        containerClass : "menu-particle-container",
        height : 2,
        width : 2,
        zIndex : -1000,
        colors : ['#FDDBC8','#FCC0A1'],
        paths : ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(.11,1.3,.72,1.3)'],
        movement : "random",
        leftMargin : -2,
        topMargin : 0,
        currentLocation : {},
    },
};

////////// 2) Particle Creation- Creates all of the particles, sets their attributes and moves them to starting location

// Checks DOM to make sure given particle type is present, has hover-class assigned to at least one element and has a valid startingPoint.
function validateParticle(type){
    
    var particleCount = type.count;
    var hoverCount = document.getElementsByClassName(type.hoverClass).length;
    var startingPoint = getStartPoint(type);
    
    if (particleCount > 0 && hoverCount > 0 && startingPoint !== null){
        return true;
    }
    else if(particleCount <= 0){
        console.warn("Particle type " + type.cssClass + " has a count of zero");
        return false;
    }
    else if(!hoverCount){
        console.warn("No elements have been assigned a hover class for particle type " + type.cssClass);
        return false;
    }
    else if(startingPoint == null){
        console.warn("Particle type " + type.cssClass + " does not have a valid starting point");
        return false;
    }
}

// Used onload to adjust the particle starting point to account for document body margins
function adjustForBodyMargin(type) {
    type.leftMargin -= getElementXCoord(document.body);
    type.topMargin -= getElementYCoord(document.body);
}

//Determines if the starting point is defined by class or id and finds the starting point
function getStartPoint(type) {
    var startPoint;
        
    if (type.startingPoint[0] == "class"){
        startPoint = document.getElementsByClassName(type.startingPoint[1])[0];
        return startPoint;
    }
    else if(type.startingPoint[0] == "id"){
        startPoint = document.getElementById(type.startingPoint[1]); 
        return startPoint;
    }
    else{
        console.warn("Particle type " + type.cssClass + "has an invalid starting point");
    }
}

// Creates all of the particles used on the page and moves them to their start position
window.addEventListener('load', function(){
    //Creates an anchor element that all particles are children of.
    //Ensures that the anchor element is created as the first child inside the body
    var anchor = document.createElement("div");
    var firstChild = document.body.firstChild;
    anchor.setAttribute("id", "particle-anchor");
    document.body.insertBefore(anchor, firstChild);
    
    //Creates particles and moves them to starting location
    for (var key in particleType){
        validateParticle(particleType[key]);
        var startPoint = getStartPoint(particleType[key]);
        if ( validateParticle(particleType[key])){
            
            adjustForBodyMargin(particleType[key]);
            
            createParticles(particleType[key]);
            
            particleType[key].currentLocation = startPoint;

            moveToTarget(particleType[key], startPoint); 
        }
    }
    //Delays setting speed and path information long enough for particles to move to first location
    setTimeout(function(){
        for (var key in particleType){
            setPath(particleType[key]);
        }
    }, 10);
});

// Creates particles of each type and assigns values
function createParticles(type){
    var i;
    for (i = 0; i < type.count; i++){
        var newDiv = document.createElement("div");
        newDiv.setAttribute("class", "particle " + type.cssClass);
        newDiv.style.position = "absolute";
        newDiv.style.zIndex = type.zIndex;
        newDiv.style.height = type.height + "px";
        newDiv.style.width = type.width + "px";
        newDiv.style.backgroundColor = randArray(type.colors);
        document.getElementById("particle-anchor").appendChild(newDiv);
    }
}

/*sets random values for the margin-left and margin-top transition timing function: 
randomizes the way each particle div moves across the page.*/
function setPath(type){
    var particle = document.getElementsByClassName(type.cssClass);
    var i;
    for (i=0; i<particle.length; i++){
        //Set random particle speed within a range based on the "speed" value defined in the particleType Obj
        var speed1 = randMinMax(type.speed / 1.25, type.speed * 1.25);
        var speed2 = randMinMax(type.speed / 1.25, type.speed * 1.25);
        //Set random timing function property from array of possible properties defined in the particleType Obj
        var path1 = randArray(type.paths);
        var path2 = randArray(type.paths);
        //combine variables into strings with css syntax
        var marginLeft = "margin-left " + speed1 +"ms " + path1 + ",";
        var marginTop = "margin-top " + speed2 +"ms " + path2;
        //Apply transition style to particle div
        particle[i].style.transition =  marginLeft + marginTop;
    }
}



//Checks the DOM for classes that match particle type's "hoverClass" property,
//Adds "mouseover" and "touchstart" event-listeners to those elements
window.addEventListener('load', function(){

    for (var key in particleType){
        if ( validateParticle(particleType[key])){
            var menuHover = document.getElementsByClassName(particleType[key].hoverClass);
            var i;
            for (i=0; i<menuHover.length; i++){
                menuHover[i].addEventListener('mouseover', function(){
                    //Finds top-left courner of bounding box around targeted element
                    var xCoord = getElementXCoord(this);
                    var yCoord = getElementYCoord(this);
                    
                    //Finds length and width of bounding box around targeted element
                    var xLength = this.offsetWidth;
                    var yLength = this.offsetHeight;
                    
                    for(var key in particleType){
                        //Finds particle type with hoverClass that matches targeted element's class
                        if (this.className.includes(particleType[key].hoverClass)){
                            //Moves particles to target element and updates the currentLocation in the particleType Obj
                            particleType[key].currentLocation = this;
                            moveParticles(particleType[key], xCoord, yCoord, xLength, yLength);
                        }
                    }
                });
                menuHover[i].addEventListener('touchstart', function(){
                    //Finds top-left courner of bounding box around targeted element
                    var xCoord = getElementXCoord(this);
                    var yCoord = getElementYCoord(this);
                    
                    //Finds length and width of bounding box around targeted element
                    var xLength = this.offsetWidth;
                    var yLength = this.offsetHeight;
                    
                    for(var key in particleType){
                        //Finds particle type with hoverClass that matches targeted element's class
                        if (this.className == particleType[key].hoverClass){
                            //Moves particles to target element and updates the currentLocation in the particleType Obj
                            particleType[key].currentLocation = this;
                            moveParticles(particleType[key], xCoord, yCoord, xLength, yLength);
                        }
                    }
                });
            }
        }
    }
});

//Checks the DOM for classes that match particle type's "containerClass" property,
//Adds "mouseout" event-listeners to those elements to retrun the particles to their starting location
window.addEventListener('load', function(){
    
    for(var key in particleType){
        var container = document.getElementsByClassName(particleType[key].containerClass);
        if (container[0] !== undefined){
            container[0].addEventListener('mouseleave', function(){
                
                for (var key in particleType){
                    /*Checks to make sure the particles are not already at their starting location- 
                    otherwise particles with movement set to random will still re-shuffle around their start point */
                    if (this.className.includes(particleType[key].containerClass) && particleType[key].currentLocation !== getStartPoint(particleType[key])){
                        particleType[key].currentLocation = getStartPoint(particleType[key]);
                        moveToTarget(particleType[key], getStartPoint(particleType[key]));
                    }
                }
            });
        }
    }
});

//Moves particles to startpoint on page load
function moveToTarget(type, target){
    var targetElement = target;
    var xCoord = getElementXCoord(targetElement);
    var yCoord = getElementYCoord(targetElement);
    var xLength = targetElement.offsetWidth;
    var yLength = targetElement.offsetHeight;
    moveParticles(type, xCoord, yCoord, xLength, yLength);
}


////////// 3) Particle Movement- Controls the dynamic movement of the particles in response to users

//Moves particles of a given type to frame an element starting at the top-left corner
function moveParticles(type, xCrd, yCrd, xLen, yLen){
    var i;
    var r;

    var particleDist = (xLen * 2 + yLen * 2) / type.count;
    var xCoord = xCrd + type.leftMargin;
    var yCoord = yCrd + type.topMargin;
    var randParticleArray = numArray(type.count).sort(function() { return 0.5 - Math.random() });
    var particle = document.getElementsByClassName(type.cssClass);
    
    for (i=0; i < type.count; i++){
        if (type.movement == 'random'){
            r = randParticleArray[i];    
        }
        else {
            r = i;
        }
        
        particle[r].style.marginLeft = xCoord + "px";
        particle[r].style.marginTop = yCoord + "px";
        
        if(i < xLen/particleDist){
            xCoord += particleDist;
        }
        else if(i < yLen/particleDist + xLen/particleDist){
            yCoord += particleDist;
        }
        else if(i < yLen/particleDist + (xLen/particleDist) * 2){
            xCoord -= particleDist;
        }
        else if(i <= (yLen/particleDist) * 2 + (xLen/particleDist) * 2){
            yCoord -= particleDist;
        }
        else{
        }
    }
}

//Function hides the particles, on window resize and shows them again at their new location
window.onresize = function(){
    for (var key in particleType){
        hideParticles(particleType[key]);
    }
    //clears the move an show functions ensuring that the do not trigger until resizing is done
    clearTimeout("moveOnResize");
    clearTimeout("showOnResize")
    var moveOnResize = setTimeout(function(){
        for (var key in particleType){
        particleType[key].currentLocation = getStartPoint(particleType[key]);
        moveToTarget(particleType[key], getStartPoint(particleType[key]));
        }
    }, 10);
    var showOnResize = setTimeout(function(){
        for (var key in particleType){
        showParticles(particleType[key]);
        }
    }, 1000);
};

//Hide all particles of a given type
function hideParticles(type){
    var particle = document.getElementsByClassName(type.cssClass);
    var i;
    for(i=0; i<type.count; i++){
        particle[i].style.opacity = 0;
    }
}

//Show all particles of a given type
function showParticles(type){
    var particle = document.getElementsByClassName(type.cssClass);
    var i;
    for(i=0; i<type.count; i++){
        particle[i].style.opacity = 1;
    }
}


////////// 4) Utility Functions- used throughout the file

//Returns random round integer
function randMinMax(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Returns a random value from within an array
function randArray(array){
    return array[randMinMax(0, array.length-1)];
}

//Creates an array of sequential numbers equal to the "count" argument
function numArray(count){
    var array1 = [];
    var i;
    for(i = 0; i < count; i++){
        array1.push(i);
    }
    return array1;
}

//Returns left coordinate for the DOM element in the argument. 
//Some code copied from http://javascript.info/tutorial/coordinates
function getElementXCoord(elem){
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var left = Math.round(box.left + scrollLeft - clientLeft);
    return left;
}

//Returns top coordinate for the DOM element in the argument. 
//Some code copied from http://javascript.info/tutorial/coordinates
function getElementYCoord(elem){
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var top  = Math.round(box.top +  scrollTop - clientTop);
    return top;
}