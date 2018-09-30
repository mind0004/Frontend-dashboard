"use strict";

/* ==========================================================================
   General
   ========================================================================== */
const name = document.querySelectorAll(".name");
const status = document.querySelectorAll(".status");
const nav = document.querySelector("nav");

const updateInterval = 1000;

let data, update;

//*** Mobile Menu (Burger Menu)
const burgerMenu = document.querySelector("#burger-menu");
let mobileMenuVisible = false;

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

  burgerMenu.addEventListener("click", toggleMobileMenu);
}

/* ==========================================================================
   Update Data
   ========================================================================== */
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

/* ==========================================================================
   Toggle Mobile Menu
   ========================================================================== */
function toggleMobileMenu() {
  if (mobileMenuVisible) {
    //close menu
    nav.style.removeProperty("top");
  } else {
    //open menu
    nav.style.top = "0px";
  }
  mobileMenuVisible = !mobileMenuVisible;
}
