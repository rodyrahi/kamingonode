window.onload = function() {
const myDiv = document.querySelectorAll('.image-box');
myDiv.forEach(element => {
   w= element.clientWidth;
  element.style.height = w.toString() + "px";
   console.log(w , element.clientHeight);
});
}