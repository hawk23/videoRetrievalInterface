var MainApplication = function()
{
  this.searchPnl = document.getElementById("searchPnl");
  this.canvas = document.getElementById("gridView");
  this.context = this.canvas.getContext("2d");

  document.body.style.height = "10000px";

  this.fps = 30;
  this.now = Date.now();
  this.then = Date.now();
  this.interval = 1000 / this.fps;
  this.delta = 0;

  this.addListener();
  this.setDimensions();

  this.loadJSON(this.loaded.bind(this), './classifiedShots.json');
}

MainApplication.prototype.addListener = function()
{
  window.onscroll = this.onScroll.bind(this);
  window.onresize = this.onResize.bind(this);
}

MainApplication.prototype.setDimensions = function()
{
  // set canvas size
  this.canvas.width  = window.innerWidth - 460;
  this.canvas.height = window.innerHeight - 20;
}

MainApplication.prototype.onScroll = function(event)
{

}

MainApplication.prototype.onResize = function(event)
{
  this.setDimensions();
}

MainApplication.prototype.loaded =  function(keyFramesString)
{
  this.images = JSON.parse(keyFramesString);
  this.filteredImages = this.images; // show all images at start
  this.draw();
  this.fillAutoComplete();
}

MainApplication.prototype.fillAutoComplete = function()
{
  var concepts = this.getConcepts();
  $("#search").autocomplete({
    source: concepts,
    focus: this.onAutoCompleteFocus.bind(this),
    select: this.onAutoCompleteSelect.bind(this)
  });
  $("#search").keydown(this.onAutoCompleteKeyDown.bind(this));
}
MainApplication.prototype.onAutoCompleteKeyDown = function(event) {
  // enter
  if(event.keyCode == 13) {
    this.searchConcept($("#search").val());
    event.preventDefault();
    return false;
  }
}

MainApplication.prototype.onAutoCompleteFocus = function(event, ui) {
  $( "#search" ).val( ui.item.label);
  return false;
}

MainApplication.prototype.onAutoCompleteSelect = function(event, ui) {
  $( "#search" ).val( ui.item.label);
  this.searchConcept($("#search").val());
  return false;
}

MainApplication.prototype.getConcepts = function()
{
  var concepts = [];
  for (i=0; i<this.images.length; i++)
  {
    for (j=0; j<this.images[i].concepts.length; j++)
    {
      var concept = this.images[i].concepts[j];

      // concept not yet known
      if ($.inArray(concept, concepts) == -1)
      {
          concepts.push(concept);
      }
    }
  }
  return concepts;
}

MainApplication.prototype.searchConcept = function(concept)
{
  if (concept.length == 0) {
    // show all images
    this.filteredImages = this.images;
      return;
  }

  this.filteredImages = [];
  for (i=0; i<this.images.length; i++)
  {
    if ($.inArray(concept, this.images[i].concepts) >= 0)
    {
        this.filteredImages.push(this.images[i]);
    }
  }
}

MainApplication.prototype.draw = function ()
{
  requestAnimationFrame(this.draw.bind(this));

  this.now = Date.now();
  this.delta = this.now - this.then;

  if (this.delta > this.interval)
  {
    this.then = this.now - (this.delta % this.interval);

    this.render();
  }
}

MainApplication.prototype.render = function()
{
  var xPos;
  var yPos;
  var displayWidth;
  var imgWidth = 480 / 4;
  var imgHeight = 300 / 4;

  // calculate the range of images to render based on the current scroll position
  var pos = document.body.scrollTop;
  var vpHeight = this.canvas.height;
  var vpWidth = this.canvas.width;

  var cols = Math.floor(vpWidth/imgWidth);
  var rows = Math.floor(vpHeight/imgHeight);
  var scrolledRows = Math.floor(pos / imgHeight);
  var scrolledImages = scrolledRows * cols;
  var cutOff = pos - (scrolledRows*imgHeight);

  var counter = 0;

  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  for (var i=scrolledImages; i < this.filteredImages.length; i++)
  {
    // only load images if not loaded previously
    if (this.filteredImages[i].imageObj == null)
    {
      var imageObj = new Image();
      imageObj.src = "keyFrames/" + this.filteredImages[i].src;
      this.filteredImages[i].imageObj = imageObj;
    }

    var row = Math.floor(counter / cols);
    var col = counter % cols;

    this.context.drawImage(this.filteredImages[i].imageObj, col*imgWidth, row*imgHeight - cutOff, imgWidth, imgHeight);

    counter++;
    if (counter >= cols*(rows+1))
    {
      break;
    }
  }
}

MainApplication.prototype.loadJSON = function(callback, file)
{
  var xobj = new XMLHttpRequest();

  xobj.overrideMimeType("application/json");
  xobj.open('GET', file, true);

  xobj.onreadystatechange = function ()
  {
    if (xobj.readyState == 4 && xobj.status == "200")
    {
      callback(xobj.responseText);
    }
  };

  xobj.send(null);
}

window.onload = function()
{
  // start main application
  var app = new MainApplication();
};
