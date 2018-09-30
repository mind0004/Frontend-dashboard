"use strict";

const name = document.querySelectorAll(".name");
const status = document.querySelectorAll(".status");

const updateInterval = 1000;

let data, update;

/* ==========================================================================
   Initilaize
   ========================================================================== */
document.addEventListener("DOMContentLoaded", init);
function init() {
  //Update the time in the navbar every 1s
  setInterval(() => {
    const date = new Date();
    timeNav.textContent =
      date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }, 1000);

  //Get data and console log it
  updateData();
  console.log(data);

  //Update and display data ever x seconds
  update = setInterval(() => {
    updateData();
    displayData();
  }, updateInterval);
  displayData();
}

function updateData() {
  data = JSON.parse(FooBar.getData());
  //console.log(data);
}

/* ==========================================================================
   Display data
   ========================================================================== */
function displayData() {
  name.forEach((nameA, i) => {
    nameA.textContent = data.bartenders[i].name;
  });

  status.forEach((statusA, i) => {
    statusA.textContent = data.bartenders[i].status;
  });
}
