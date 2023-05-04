const myDiv = document.querySelectorAll('.image-box');
// Set the height and width of the div
// myDiv.style.height = '200px';
// myDiv.style.width = '200px';
myDiv.forEach(element => {
   w= element.clientWidth;
  element.style.height = w.toString() + "px";
   console.log(w , element.clientHeight);
});