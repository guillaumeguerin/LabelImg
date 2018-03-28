/** Useful links **/
//http://bitbionic.com/2017/08/02/how-to-deploy-pyqt-keras-tensorflow-apps-with-pyinstaller/

/** Global variables **/
var canvas = document.getElementById("canvas");
var ctx= canvas.getContext("2d");
var isDrawing = false;
var isUpdatingShape = false;
var rectangleStart = null;
var rectanglesDrew = [];
var currentPicture = 1;
var labeledImages = [];
var updatingShapeIndex = null;

/** Listeners **/
canvas.addEventListener("mousedown", getClickPosition, false);
canvas.addEventListener("mousemove", updateRectangle, false);
canvas.addEventListener('mouseenter', updateRectangle, false);

/**
 * Handles mouse click and draws bounding box
 */
function getClickPosition(event)
{
  var x = event.x;
  var y = event.y;
  
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  
  if(isUpdatingShape) { 
    isUpdatingShape = !isUpdatingShape;
    return;
  }
  
  if(isDrawing) {
    var rectangleEnd = [x,y];
    
    var rectangleEnd = [x,y];
    var currentRectangle = [rectangleStart, rectangleEnd];
    rectanglesDrew.push(currentRectangle);

    drawShapes();
    addTextEntry();
  }
  else {
    for(var i=0; i<rectanglesDrew.length; i++) {
      var currentRectangle = rectanglesDrew[i];
      var circleIndex = -1;
      if(currentRectangle[0][0] - 20 < x && currentRectangle[0][0] + 20 > x
        && currentRectangle[0][1] - 20 < y && currentRectangle[0][1] + 20 > y) {
        isUpdatingShape = true;
        circleIndex = 0;
        updatingShapeIndex = [i,circleIndex];
        break;
      }
      else if(currentRectangle[1][0] - 20 < x && currentRectangle[1][0] + 20 > x
        && currentRectangle[1][1] - 20 < y && currentRectangle[1][1] + 20 > y) {
        isUpdatingShape = true;
        circleIndex = 1;
        updatingShapeIndex = [i,circleIndex];
        break;
      }
      
    }

    rectangleStart = [x,y];
  }
  
  if(!isUpdatingShape) {
    isDrawing = !isDrawing;
  }
}

/**
 * Basic function to draw rectangle
 */
function drawRectangle(rectangleStart, rectangleEnd, text) {
    ctx.rect(rectangleStart[0],rectangleStart[1], rectangleEnd[0] - rectangleStart[0], rectangleEnd[1] - rectangleStart[1]);
    var color = textToColor(text);
    ctx.strokeStyle="rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    ctx.stroke();
    ctx.beginPath();
  
    ctx.arc(rectangleStart[0],rectangleStart[1],5,0,2*Math.PI);
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("0",rectangleStart[0]-3,rectangleStart[1]+3);
    ctx.beginPath();
  
    ctx.arc(rectangleEnd[0],rectangleEnd[1],5,0,2*Math.PI);
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("1",rectangleEnd[0]-3,rectangleEnd[1]+3);
    ctx.beginPath();
}

/**
 * Updates rectangle position when the mouse is moving
 */
function updateRectangle(event) {
   var x = event.x;
   var y = event.y;
   x -= canvas.offsetLeft;
   y -= canvas.offsetTop;
 
   if(isDrawing) {
     clearCanvas();
     var rectangleEnd = [x,y];
     drawShapes();
     drawRectangle(rectangleStart, rectangleEnd, "initSample");
   }
   else if(isUpdatingShape) {
     clearCanvas();
     var circleIndex = updatingShapeIndex[1];
     var shapeIndex = updatingShapeIndex[0];
     rectanglesDrew[shapeIndex][circleIndex] = [x,y];
     drawShapes();
   }
}

/**
 * Clear the whole canvas. Called before refreshing the view.
 */
function clearCanvas() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.beginPath();
}

/**
 * Remove last rectangle from the saved list
 */
function removeRectangle() {
  if(rectanglesDrew.length > 0) {
    rectanglesDrew.splice(rectanglesDrew.length -1, 1);
  }
  
  if(labeledImages[currentPicture] != null) {
    labeledImages[currentPicture].setBoundingBoxes(rectanglesDrew);
    labeledImages[currentPicture].setLabels(getEntriesValues());
  }

  clearCanvas();
  drawShapes();
  removeTextEntry();

}

/**
 * Redraw saved bounding boxes
 */
function drawShapes() {
  drawPicture(0, "pic" + currentPicture);
  var textEntries = getTextEntries();
  for (var i = 0; i < rectanglesDrew.length; i++) {
    var text = "initSample" ;
    if(textEntries[i] != undefined) {
      text = textEntries[i].value;
    }
    else {
      text = "";
    }
    drawRectangle(rectanglesDrew[i][0], rectanglesDrew[i][1], text);
  }
}

/**
 * Adds a text entry for the bounding box
 */
function addTextEntry() {
  var e = document.getElementsByTagName("aside");
  if (e != null && e.length > 0) {
    var div = document.createElement("div");
    var input = document.createElement("input");
    input.setAttribute("oninput", "updateShapeWithInput()");
    input.setAttribute("onblur", "updateOutput()");
    input.setAttribute("class", "form-control");
    div.appendChild(input);
    e[0].appendChild(div);
  }
}

/**
 * Gets text entries matching drawn bounding box
 */
function getTextEntries() {
  var aside = document.getElementsByTagName("aside");
  return aside[0].getElementsByTagName("input");
}

/**
 * Removes last text entry when the Back button is pressed
 */
function removeTextEntry() {
   var asideList = document.getElementsByTagName("aside");
   if(asideList != null && asideList.length > 0) {
     var aside = asideList[0];
     var length = aside.childNodes.length;
     if(length > 0) {
       aside.removeChild(aside.childNodes[length -1]);
     }
   }
}

/**
 * Creates unique color from text
 */
function textToColor(text) {
  var baseColor = [0,0,0];
  for(var i=0; i<text.length; i++) {
    if(i % 3 == 0) {
      baseColor[2] += text.charCodeAt(i) * 2;
    }
    else if(i % 2 == 0) {
      baseColor[1] += text.charCodeAt(i) * 2;
    }
    else {
      baseColor[0] += text.charCodeAt(i) * 2;
    }
  }
  baseColor[0] = baseColor[0] % 255;
  baseColor[1] = baseColor[1] % 255;
  baseColor[2] = baseColor[2] % 255;
  
  if(baseColor[0] > 128 && baseColor[1] > 128 && baseColor[2] > 128) {
     if(text.length > 2) {
       baseColor[0] -= text.charCodeAt(0);
       baseColor[0] = Math.abs(baseColor[0]);
     }
  }
  
  return baseColor;
}

function updateShapeWithInput() {
  drawShapes();
}

function drawPicture(x, id) {
  var img=document.getElementById(id);
  ctx.drawImage(img, x, 0, canvas.width, canvas.height);
}

function updateOutput() {
  debugger;
  var output = "";
  var images = document.getElementsByTagName("img");
  if(labeledImages.length < images.length) {
     //var labeledImage = buildLabeledImage();
     /*var labeledImage = new LabeledImage();
     labeledImages.push(labeledImage);*/
     output += images[currentPicture].getAttribute("src") + ";";
     output += rectanglesDrew + ";";
     output += getEntriesValues() + ";\n";
     document.getElementById("output").innerText = output;
     return;
  }
  for(var i=0; i<labeledImages.length; i++) {
    if(labeledImages[i] != null && images[i] != null) {
      output += images[i].getAttribute("src") + ";";
      output += labeledImages[i].getBoundingBoxes() + ";";
      output += labeledImages[i].getLabels() + ";\n";
    }
  }
  document.getElementById("output").innerText = output;
}

/**
 * Changes view and updates matching variables
 */
function changePicture(i) {
  // save input data
  if(i==-1 && currentPicture == 1) {
    return;
  }
  if(document.getElementsByTagName("img").length < currentPicture + i) {
    return;
  }

  var labeledImage = buildLabeledImage();

  if(labeledImages.length > currentPicture) {
     labeledImages.push(labeledImage);
  }
  else {
    labeledImages[currentPicture] = labeledImage;
  }

  currentPicture += i;
  
  // reset inputs
  rectanglesDrew = [];
  var node = document.getElementsByTagName("aside")[0];
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
  
  // retrieve if previous data exists
  if(labeledImages.length > currentPicture) {
    rectanglesDrew = labeledImages[currentPicture].getBoundingBoxes();
    var labels = labeledImages[currentPicture].getLabels();
    var e = document.getElementsByTagName("aside");
    for(var i=0; i<labels.length; i++) {
      var div = document.createElement("div");
      var input = document.createElement("input");
      input.setAttribute("oninput", "updateShapeWithInput()");
      input.setAttribute("onblur", "updateOutput()");
      input.value = labels[i];
      div.appendChild(input);
      e[0].appendChild(div);
    }
  }

  // redraw
  drawShapes();
  updateOutput();
}

/**
 * Retrieves a list of all inputs
 */
function getEntriesValues() {
  var entries = getTextEntries();
  var labels = [];
  if(entries.length > 0) {
    for(var j=0; j<entries.length; j++) {
      labels.push(entries[j].value);
    }
  }
  return labels;
}

/**
 * Builds a LabeledImage for the current view
 */
function buildLabeledImage() {
  var labeledImage = new LabeledImage();
  labeledImage.setBoundingBoxes(rectanglesDrew);
  labeledImage.setLabels(getEntriesValues());
  return labeledImage;
}

drawShapes();

/* Classes definition */
function LabeledImage () {
    this.boundingBoxes = [];
    this.labels = [];
}
 
LabeledImage.prototype.getBoundingBoxes = function() {
    return this.boundingBoxes;
};

LabeledImage.prototype.getLabels = function() {
    return this.labels;
};

LabeledImage.prototype.setBoundingBoxes = function(boundingBoxes) {
    this.boundingBoxes = boundingBoxes;
};

LabeledImage.prototype.setLabels = function(labels) {
    this.labels = labels;
};
