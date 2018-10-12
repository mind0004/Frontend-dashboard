"use strict";
/* ==========================================================================
   General
   ========================================================================== */

//*** Nav
const timeNav = document.querySelector("#timeNav p");
const nav = document.querySelector("nav");

//*** Top-box
const queueP = document.querySelector("#top-box .queue p");
const servingP = document.querySelector("#top-box .serving p");
const servingNumber = document.querySelector("#top-box .serving p");
const perfNumber = document.querySelector("#top-box .performance .perf-value");
const perfChartDOM = document.querySelector("#perf-chart").getContext("2d");

//*** Storage and Keg level canvas
const kegLevelChartDOM = document
  .querySelector("#keg-level-chart")
  .getContext("2d");
const storageLevelChartDOM = document
  .querySelector("#storage-level-chart")
  .getContext("2d");

//*** Modal Window
const modalButton = document.querySelectorAll(".display-modal-button");
const modalWindow = document.querySelector("#modal");
const modalH2 = document.querySelector("#modal h2");
const modalP = document.querySelector("#modal p");
const modalCloseButton = document.querySelector("#modal button");
let modalVisible = false;

//*** Mobile Menu (Burger Menu)
const burgerMenu = document.querySelector("#burger-menu");
const burgerMenuSpan = document.querySelectorAll("#burger-menu span");
let mobileMenuVisible = false;

//*** Variables
const updateInterval = 1000; //update data every 1s;
const updatePerformanceInterval = 15000; //update performance every 15s
const updateKegLevelInterval = 1000; //update keg level every 1s
const updateStorageLevelInterval = 1000; //update storage level every 1s

let data,
  update,
  updatePerformance,
  perfChart,
  kegLevelChart,
  updateKegLevel,
  storageLevelChart,
  updateStorageLevel;

let kegLevel = [];
let storageLevel = [];

//perf is used to calculate performance
let perf = {
  avgT: 10000,
  avgPerf: 15000,
  timePerClient: [15000],
  currentS: [],
  previousS: [],
  order: {}
};

/* ==========================================================================
   Initilaize
   ========================================================================== */
document.addEventListener("DOMContentLoaded", init);
function init() {
  //Update the time in the navbar every 1s
  setInterval(() => {
    updateTime();
  }, 1000);

  //Get data and console log it
  updateData();
  console.log(data);

  //Update and display data ever x seconds
  update = setInterval(() => {
    updateData();
    displayData();
  }, updateInterval);

  // Calculate, update and display performance every x seconds
  updatePerformance = setInterval(() => {
    displayPerf();
  }, updatePerformanceInterval);

  //Update Keg level data and update chart every x seconds
  updateKegLevel = setInterval(() => {
    updateKegLevelData();
  }, updateKegLevelInterval);

  //Update Storage level data and update chart every x seconds
  updateStorageLevel = setInterval(() => {
    updateStorageLevelData();
  }, updateStorageLevelInterval);

  //Run functions on page load
  displayData();
  displayPerfChart();
  displayKegLevelChart();
  updateKegLevelData();
  updateKegLevelChart();
  displayStorageLevelChart();
  updateStorageLevelData();
  updateStorageLevelChart();
  updateTime();

  //Add event listener to Modal Window
  modalButton.forEach(btn => {
    btn.addEventListener("click", toggleModalWindow);
  });
  modalCloseButton.addEventListener("click", toggleModalWindow);

  //Add event listener burger menu
  burgerMenu.addEventListener("click", toggleMobileMenu);
}

/* ==========================================================================
   Update data
   ========================================================================== */
function updateData() {
  data = JSON.parse(FooBar.getData());
  //console.log(data);
}

/* ==========================================================================
   Display data
   ========================================================================== */
function displayData() {
  //Queue text number update
  let queueNumber = data.queue.length;
  if (queueNumber < 10) {
    queueNumber = "0" + queueNumber;
  }
  queueP.textContent = queueNumber;

  //Serving text number update
  let servingNumber = data.serving.length;
  if (servingNumber < 10) {
    servingNumber = "0" + servingNumber;
  }
  servingP.textContent = servingNumber;

  //Performance text and graph update
  calcPerf();
}

/* ==========================================================================
   Calculate Performance
   ========================================================================== */
function calcPerf() {
  // Return the difference between two arrays
  // Credits: https://stackoverflow.com/a/4026828
  Array.prototype.diff = function(a) {
    return this.filter(function(i) {
      return a.indexOf(i) < 0;
    });
  };

  //Empty current served array
  perf.currentS = [];

  // Add all current IDS to currentS array and the amount of orders
  data.serving.forEach(serving => {
    let id = serving.id;
    perf.currentS.push(id);
    perf.order[id] = serving.order.length;
  });

  // Get difference of currentS and previouS arrays
  // If there's a difference, it either means there's a new client served or a client has been served
  const newClient = perf.currentS.diff(perf.previousS); // new client
  const servedClient = perf.previousS.diff(perf.currentS); // this client has been served now

  //if new client or more than one, start time
  if (newClient.length > 0) {
    newClient.forEach(id => {
      perf[id] = Date.now();
    });
  }

  //if client or more than one have been served, stop time and get average time
  if (servedClient.length > 0) {
    servedClient.forEach(id => {
      /*  Get current time and subtract the previous time of it.
          The result is the needed time to serve this client.
          Divide it by the amount of beers needed to serve
          Get the average time per beer.
          Add the average time to the timePerClient array
      */
      let neededTime = (Date.now() - perf[id]) / perf.order[id];
      perf.timePerClient.push(neededTime);
    });
  }

  //Use these console logs to understand this function

  /*  console.log("Current:" + JSON.stringify(perf.currentS));
  console.log("Previous:" + JSON.stringify(perf.previousS));
  console.log("Difference 1: " + JSON.stringify(newClient));
  console.log("Difference 2: " + JSON.stringify(servedClient));
  console.log("AVG Time: " + JSON.stringify(perf.timePerClient));
  console.log("======"); */

  //Add this update rounds clients to be used for next round
  perf.previousS = perf.currentS.slice();

  //If there are more than 20 elements in the timePerClient array, remove the first ones until true
  if (perf.timePerClient.length > 20) {
    for (let i = 0; i > perf.timePerClient.length - 20; i++) {
      perf.timePerClient.shift();
    }
  }
}

/* ==========================================================================
   Display Performance
   ========================================================================== */
function displayPerf() {
  //Get all times combined
  let timeCombined = 0;
  perf.timePerClient.forEach(elem => {
    timeCombined += elem;
  });

  // Get the average time of all the combined times
  const averageTime = timeCombined / perf.timePerClient.length;

  //Calculcate percentage in relation to very fast serving of x seconds.
  perf.avgPerf = Math.floor((perf.avgT / averageTime) * 100);
  //console.log(perf.avgPerf);
  if (isNaN(perf.avgPerf)) {
    //no performance data available display N/A
    perfNumber.textContent = "N/A";
  } else {
    //display performance
    perfNumber.textContent = perf.avgPerf + "%";
  }
  updatePerfChart();
}

/* ==========================================================================
   Display Performance Chart
   ========================================================================== */
function displayPerfChart() {
  perfChart = new Chart(perfChartDOM, {
    // The type of chart we want to create
    type: "doughnut",
    responsive: true,
    maintainAspectRatio: false,

    // The data for our dataset
    data: {
      datasets: [
        {
          data: [50, 50],
          backgroundColor: ["#39B54A"],
          borderWidth: [0, 0]
        }
      ]
    },

    // Configuration options go here
    options: {
      legend: false,
      rotation: Math.PI,
      circumference: Math.PI,
      events: []
    }
  });
}

/* ==========================================================================
   Update Performance Chart
   ========================================================================== */
function updatePerfChart() {
  if (isNaN(perf.avgPerf)) {
    //keep previous chart
  } else {
    //update chart
    let status;
    if (perf.avgPerf >= 60) {
      status = "good";
    } else if (perf.avgPerf <= 30) {
      status = "bad";
    } else if (perf.avgPerf > 30 && perf.avgPerf < 60) {
      status = "okay";
    }
    const color = {
      bad: "#ED1C24",
      okay: "#F7931E",
      good: "#39B54A"
    }[status];
    perfChart.data.datasets[0].data = [perf.avgPerf, 100 - perf.avgPerf];
    perfChart.data.datasets[0].backgroundColor = [color];
    perfChart.update();
  }
}

/* ==========================================================================
   Display keg level chart
   ========================================================================== */
function displayKegLevelChart() {
  kegLevelChart = new Chart(kegLevelChartDOM, {
    type: "bar",
    height: 400,
    // The data for our dataset
    data: {
      labels: [
        "ELH",
        "FTA",
        "HBL",
        "GTH",
        "HEA",
        "MIT",
        "R26",
        "RCH",
        "SLR",
        "SMP"
      ],
      datasets: [
        {
          label: "Keg level in cl",
          backgroundColor: ["#39B54A"],

          data: [0, 10, 5, 2, 20, 30, 45]
        }
      ]
    },

    // Configuration options go here
    options: {
      legend: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              suggestedMin: 0,
              suggestedMax: 2500,
              beginAtZero: true,
              min: 0,
              max: 2500,
              stepSize: 500
            }
          }
        ]
      }
    }
  });
}

/* ==========================================================================
   Update Keg Level Data
   ========================================================================== */
function updateKegLevelData() {
  kegLevel = [];
  data.taps.forEach(keg => {
    let beerVar = keg.beer.toLowerCase().replace(/ /g, "");
    //console.log(beerVar);
    let short = {
      elhefe: "ELH",
      fairytaleale: "FTA",
      hollabacklager: "HBL",
      githop: "GTH",
      hoppilyeverafter: "HEA",
      mowintime: "MIT",
      row26: "R26",
      ruinedchildhood: "RCH",
      sleighride: "SLR",
      steampunk: "SMP"
    }[beerVar];
    //console.log(short);

    let beer = {
      name: keg.beer,
      short: short,
      level: keg.level
    };

    kegLevel.push(beer);
  });

  //console.log(kegLevel);
  updateKegLevelChart();
}

/* ==========================================================================
   Update Keg Level Chart
   ========================================================================== */
function updateKegLevelChart() {
  kegLevelChart.data.labels = [];
  kegLevelChart.data.datasets[0].data = [];
  kegLevelChart.data.datasets[0].backgroundColor = [];

  let status;

  kegLevel.forEach(keg => {
    if (keg.level >= 1500) {
      status = "good";
    } else if (keg.level <= 500) {
      status = "bad";
    } else if (keg.level > 500 && keg.level < 1500) {
      status = "okay";
    }

    const color = {
      bad: "#ED1C24",
      okay: "#F7931E",
      good: "#39B54A"
    }[status];

    kegLevelChart.data.labels.push(keg.short);
    kegLevelChart.data.datasets[0].data.push(keg.level);
    kegLevelChart.data.datasets[0].backgroundColor.push(color);
  });

  kegLevelChart.update();
}

/* ==========================================================================
   Display storage level chart
   ========================================================================== */
function displayStorageLevelChart() {
  storageLevelChart = new Chart(storageLevelChartDOM, {
    type: "bar",
    // The data for our dataset
    data: {
      labels: [
        "ELH",
        "FTA",
        "HBL",
        "GTH",
        "HEA",
        "MIT",
        "R26",
        "RCH",
        "SLR",
        "SMP"
      ],
      datasets: [
        {
          label: "Amount of kegs in storage",
          backgroundColor: ["#39B54A"],

          data: [0, 10, 5, 2, 20, 30, 45]
        }
      ]
    },

    // Configuration options go here
    options: {
      legend: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              suggestedMin: 0,
              suggestedMax: 20,
              beginAtZero: true,
              min: 0,
              max: 10,
              stepSize: 1
            }
          }
        ]
      }
    }
  });
}

/* ==========================================================================
   Update Storage Level Data
   ========================================================================== */
function updateStorageLevelData() {
  storageLevel = [];
  data.storage.forEach(storage => {
    let beerVar = storage.name.toLowerCase().replace(/ /g, "");
    //console.log(beerVar);
    let short = {
      elhefe: "ELH",
      fairytaleale: "FTA",
      hollabacklager: "HBL",
      githop: "GTH",
      hoppilyeverafter: "HEA",
      mowintime: "MIT",
      row26: "R26",
      ruinedchildhood: "RCH",
      sleighride: "SLR",
      steampunk: "SMP"
    }[beerVar];
    //console.log(short);

    let beer = {
      name: storage.name,
      short: short,
      level: storage.amount
    };

    storageLevel.push(beer);
  });

  //console.log(kegLevel);
  updateStorageLevelChart();
}

/* ==========================================================================
   Update Storage Level Chart
   ========================================================================== */
function updateStorageLevelChart() {
  storageLevelChart.data.labels = [];
  storageLevelChart.data.datasets[0].data = [];
  storageLevelChart.data.datasets[0].backgroundColor = [];

  let status;

  storageLevel.forEach(storage => {
    if (storage.level >= 6) {
      status = "good";
    } else if (storage.level <= 2) {
      status = "bad";
    } else if (storage.level > 2 && storage.level < 6) {
      status = "okay";
    }

    const color = {
      bad: "#ED1C24",
      okay: "#F7931E",
      good: "#39B54A"
    }[status];

    storageLevelChart.data.labels.push(storage.short);
    storageLevelChart.data.datasets[0].data.push(storage.level);
    storageLevelChart.data.datasets[0].backgroundColor.push(color);
  });

  storageLevelChart.update();
}

/* ==========================================================================
   Toggle Modal Window
   ========================================================================== */
function toggleModalWindow(e) {
  if (modalVisible) {
    //Close Modal Window
    modalWindow.style.removeProperty("top");
    console.log("Close modal");
  } else {
    //Open Modal Window
    const type = e.target.dataset.type;
    const text = {
      keg: {
        header: "KEG LEVEL",
        body:
          "Keg level displays the amount of beer left in a keg. The unit is in cl.<br /><br />Abbreviations:<br />ELH : El Hefe<br />FTA : Fairy Tale Ale<br />HBL : Hollaback Lager<br />GTH : GitHop<br />HEA : Hoppily Ever After<br />MIT : Mowintime<br />R26 : Row 26<br />RCH : Ruined Childhood<br />SLR : Sleighride<br />SMP : Steampunk"
      },
      storage: {
        header: "STORAGE LEVEL",
        body:
          "Storage level displays the amount of kegs in the storage room.<br /><br />Abbreviations:<br />ELH : El Hefe<br />FTA : Fairy Tale Ale<br />HBL : Hollaback Lager<br />GTH : GitHop<br />HEA : Hoppily Ever After<br />MIT : Mowintime<br />R26 : Row 26<br />RCH : Ruined Childhood<br />SLR : Sleighride<br />SMP : Steampunk"
      },
      topBox: {
        header: "OVERVIEW",
        body:
          "QUEUE displays the amount of clients waiting in line.<br /><br />SERVING displays the amount of clients currently beeing served<br /><br />PERFORMANCE displays the all around performance which is calculated based on the needed time to serve the last 20 beers. An average time is calculated and compared to 10s/beer which would be considered 100%. All performance over 60% is considered as very good!"
      }
    }[type];

    modalWindow.style.top = "0px";
    modalH2.textContent = text.header;
    modalP.innerHTML = text.body;
    console.log("Open Modal");
  }
  modalVisible = !modalVisible;
}

/* ==========================================================================
   Toggle Mobile Menu on click Burger Menu
   ========================================================================== */
function toggleMobileMenu() {
  if (mobileMenuVisible) {
    //close menu
    nav.style.removeProperty("top");
    burgerMenuSpan.forEach(span => {
      span.style.removeProperty("background");
    });
  } else {
    //open menu
    nav.style.top = "0px";
    burgerMenuSpan.forEach(span => {
      span.style.background = "#e9e9e9";
    });
  }
  mobileMenuVisible = !mobileMenuVisible;
}

/* ==========================================================================
   Update the time clock in the nav
   ========================================================================== */
function updateTime() {
  const date = new Date();
  const hours = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours();
  const min =
    date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();
  const sec =
    date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds();
  timeNav.textContent = hours + ":" + min + ":" + sec;
}
