"use strict";
/* ==========================================================================
   General
   ========================================================================== */
const queueP = document.querySelector("#top-box .queue p");
const servingP = document.querySelector("#top-box .serving p");
const servingNumber = document.querySelector("#top-box .serving p");

const updateInterval = 1000; //update every 1s;
let data, update, defTimeStamp;
//perf is used to calculate performance
let perf = {
  avgT: [],
  currentS: [],
  allS: [],
  previousS: [1]
};

/* ==========================================================================
   Initilaize
   ========================================================================== */
document.addEventListener("DOMContentLoaded", init);
function init() {
  updateData();
  console.log(data);
  defTimeStamp = data.timestamp;
  update = setInterval(() => {
    updateData();
    displayData();
  }, updateInterval);
  displayData();
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

//Calculate Performance
function calcPerf() {
  perf.currentS = [];

  data.serving.forEach(serving => {
    let id = serving.id;
    perf.currentS.push(id); // add to current

    let servedID = perf.previousS.filter(function() {
      //check difference between filter
      return perf.currentS.indexOf(id) < 0;
    });
    console.log(servedID);
    /*
    //All current served IDs
    perf.currentS.push(serving.id);
    console.log(perf.previousS.includes(serving.id));
    if (perf.previousS.includes(serving.id)) {
      // do nothing - id still beeing served
    } else {
      console.log(perf.allS.includes(serving.id));
      if (perf.allS.includes(serving.id)) {
        let neededTime = Date.now() - perf[serving.id];
        perf.avgT.push(neededTime); // add latest performance time
        perf.previousS.splice(perf.previousS.indexOf(serving.id), 1); // remove id from previous
        console.log("ID has been served, stop time");
        //ID has been served, stop time
      } else {
        perf.allS.push(serving.id);
        perf.previousS.push(serving.id);
        perf[serving.id] = Date.now();
        console.log("New ID to be served, start time");
        //New ID to be served, start time
      }
    }
    console.log("====");
    */
  });
}
