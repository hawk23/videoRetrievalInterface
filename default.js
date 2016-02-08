var MainApplication = function()
{
  this.canvas = document.getElementById("gridView");
  this.context = this.canvas.getContext("2d");

  document.body.style.height = "10000px";

  this.fps = 30;
  this.now = Date.now();
  this.then = Date.now();
  this.interval = 1000 / this.fps;
  this.delta = 0;

  // set canvas size
  this.canvas.width  = window.innerWidth - 40;
  this.canvas.height = window.innerHeight - 20;

  this.addListener();
  this.loadJSON(this.loaded.bind(this), './keyFrames.json');
}

MainApplication.prototype.addListener = function()
{
  window.onscroll = this.onScroll.bind(this);
}

MainApplication.prototype.onScroll = function(event)
{
  
}

MainApplication.prototype.loaded =  function(keyFramesString)
{
  this.images = JSON.parse(keyFramesString);
  this.draw();
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
  for (var i=scrolledImages; i < this.images.length; i++)
  {
    var imageObj = new Image();
    imageObj.src = this.images[i].src;

    var row = Math.floor(counter / cols);
    var col = counter % cols;

    this.context.drawImage(imageObj, col*imgWidth, row*imgHeight - cutOff, imgWidth, imgHeight);

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
