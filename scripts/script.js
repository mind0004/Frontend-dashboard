"use strict";
/* ==========================================================================
   General
   ========================================================================== */

//*** Nav
const timeNav = document.querySelector("#timeNav p");

//*** Top-box
const queueP = document.querySelector("#top-box .queue p");
const servingP = document.querySelector("#top-box .serving p");
const servingNumber = document.querySelector("#top-box .serving p");
const perfNumber = document.querySelector("#top-box .performance p");
const perfChartDOM = document.querySelector("#perf-chart").getContext("2d");

const updateInterval = 1000; //update data every 1s;
const updatePerformanceInterval = 15000; //update performance every 15s

let data, update, updatePerformance, perfChart;
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

  // Calculate, update and display performance every x seconds
  updatePerformance = setInterval(() => {
    displayPerf();
  }, updatePerformanceInterval);

  displayData();
  displayPerfChart();
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

  /*
  Use these console logs to understand this function

  console.log("Current:" + JSON.stringify(perf.currentS));
  console.log("Previous:" + JSON.stringify(perf.previousS));
  console.log("Difference 1: " + JSON.stringify(newClient));
  console.log("Difference 2: " + JSON.stringify(servedClient));
  console.log("AVG Time: " + JSON.stringify(perf.timePerClient));
  console.log("======");

  */
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
  console.log(perf.avgPerf);
  if (isNaN(perf.avgPerf)) {
    //no performance data available display N/A
    perfNumber.textContent = "N/A";
  } else {
    //display performance
    perfNumber.textContent = perf.avgPerf + "%";
  }
  updatePerfChart();
}

function displayPerfChart() {
  perfChart = new Chart(perfChartDOM, {
    // The type of chart we want to create
    type: "doughnut",

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
      circumference: Math.PI
    }
  });
}

function updatePerfChart() {
  if (isNaN(perf.avgPerf)) {
    //keep previous chart
  } else {
    //update chart
    let status;
    if (perf.avgPerf > 60) {
      status = "good";
    } else if (perf.avgPerf < 30) {
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
