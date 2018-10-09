// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"scripts\\script.js":[function(require,module,exports) {
"use strict";
/* ==========================================================================
   General
   ========================================================================== */

//*** Nav

var timeNav = document.querySelector("#timeNav p");
var nav = document.querySelector("nav");

//*** Top-box
var queueP = document.querySelector("#top-box .queue p");
var servingP = document.querySelector("#top-box .serving p");
var servingNumber = document.querySelector("#top-box .serving p");
var perfNumber = document.querySelector("#top-box .performance .perf-value");
var perfChartDOM = document.querySelector("#perf-chart").getContext("2d");

//*** Storage and Keg level canvas
var kegLevelChartDOM = document.querySelector("#keg-level-chart").getContext("2d");
var storageLevelChartDOM = document.querySelector("#storage-level-chart").getContext("2d");

//*** Modal Window
var modalButton = document.querySelectorAll(".display-modal-button");
var modalWindow = document.querySelector("#modal");
var modalH2 = document.querySelector("#modal h2");
var modalP = document.querySelector("#modal p");
var modalCloseButton = document.querySelector("#modal button");
var modalVisible = false;

//*** Mobile Menu (Burger Menu)
var burgerMenu = document.querySelector("#burger-menu");
var mobileMenuVisible = false;

//*** Variables
var updateInterval = 1000; //update data every 1s;
var updatePerformanceInterval = 15000; //update performance every 15s
var updateKegLevelInterval = 1000; //update keg level every 1s
var updateStorageLevelInterval = 1000; //update storage level every 1s

var data = void 0,
    update = void 0,
    updatePerformance = void 0,
    perfChart = void 0,
    kegLevelChart = void 0,
    updateKegLevel = void 0,
    storageLevelChart = void 0,
    updateStorageLevel = void 0;

var kegLevel = [];
var storageLevel = [];

//perf is used to calculate performance
var perf = {
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
  setInterval(function () {
    updateTime();
  }, 1000);

  //Get data and console log it
  updateData();
  console.log(data);

  //Update and display data ever x seconds
  update = setInterval(function () {
    updateData();
    displayData();
  }, updateInterval);

  // Calculate, update and display performance every x seconds
  updatePerformance = setInterval(function () {
    displayPerf();
  }, updatePerformanceInterval);

  //Update Keg level data and update chart every x seconds
  updateKegLevel = setInterval(function () {
    updateKegLevelData();
  }, updateKegLevelInterval);

  //Update Storage level data and update chart every x seconds
  updateStorageLevel = setInterval(function () {
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
  modalButton.forEach(function (btn) {
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
  var queueNumber = data.queue.length;
  if (queueNumber < 10) {
    queueNumber = "0" + queueNumber;
  }
  queueP.textContent = queueNumber;

  //Serving text number update
  var servingNumber = data.serving.length;
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
  Array.prototype.diff = function (a) {
    return this.filter(function (i) {
      return a.indexOf(i) < 0;
    });
  };

  //Empty current served array
  perf.currentS = [];

  // Add all current IDS to currentS array and the amount of orders
  data.serving.forEach(function (serving) {
    var id = serving.id;
    perf.currentS.push(id);
    perf.order[id] = serving.order.length;
  });

  // Get difference of currentS and previouS arrays
  // If there's a difference, it either means there's a new client served or a client has been served
  var newClient = perf.currentS.diff(perf.previousS); // new client
  var servedClient = perf.previousS.diff(perf.currentS); // this client has been served now

  //if new client or more than one, start time
  if (newClient.length > 0) {
    newClient.forEach(function (id) {
      perf[id] = Date.now();
    });
  }

  //if client or more than one have been served, stop time and get average time
  if (servedClient.length > 0) {
    servedClient.forEach(function (id) {
      /*  Get current time and subtract the previous time of it.
          The result is the needed time to serve this client.
          Divide it by the amount of beers needed to serve
          Get the average time per beer.
          Add the average time to the timePerClient array
      */
      var neededTime = (Date.now() - perf[id]) / perf.order[id];
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
    for (var i = 0; i > perf.timePerClient.length - 20; i++) {
      perf.timePerClient.shift();
    }
  }
}

/* ==========================================================================
   Display Performance
   ========================================================================== */
function displayPerf() {
  //Get all times combined
  var timeCombined = 0;
  perf.timePerClient.forEach(function (elem) {
    timeCombined += elem;
  });

  // Get the average time of all the combined times
  var averageTime = timeCombined / perf.timePerClient.length;

  //Calculcate percentage in relation to very fast serving of x seconds.
  perf.avgPerf = Math.floor(perf.avgT / averageTime * 100);
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
      datasets: [{
        data: [50, 50],
        backgroundColor: ["#39B54A"],
        borderWidth: [0, 0]
      }]
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
    var status = void 0;
    if (perf.avgPerf >= 60) {
      status = "good";
    } else if (perf.avgPerf <= 30) {
      status = "bad";
    } else if (perf.avgPerf > 30 && perf.avgPerf < 60) {
      status = "okay";
    }
    var color = {
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
      labels: ["ELH", "FTA", "HBL", "GTH", "HEA", "MIT", "R26", "RCH", "SLR", "SMP"],
      datasets: [{
        label: "Keg level in cl",
        backgroundColor: ["#39B54A"],

        data: [0, 10, 5, 2, 20, 30, 45]
      }]
    },

    // Configuration options go here
    options: {
      legend: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            suggestedMax: 2500,
            beginAtZero: true,
            min: 0,
            max: 2500,
            stepSize: 500
          }
        }]
      }
    }
  });
}

/* ==========================================================================
   Update Keg Level Data
   ========================================================================== */
function updateKegLevelData() {
  kegLevel = [];
  data.taps.forEach(function (keg) {
    var beerVar = keg.beer.toLowerCase().replace(/ /g, "");
    //console.log(beerVar);
    var short = {
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

    var beer = {
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

  var status = void 0;

  kegLevel.forEach(function (keg) {
    if (keg.level >= 1500) {
      status = "good";
    } else if (keg.level <= 500) {
      status = "bad";
    } else if (keg.level > 500 && keg.level < 1500) {
      status = "okay";
    }

    var color = {
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
      labels: ["ELH", "FTA", "HBL", "GTH", "HEA", "MIT", "R26", "RCH", "SLR", "SMP"],
      datasets: [{
        label: "Amount of kegs in storage",
        backgroundColor: ["#39B54A"],

        data: [0, 10, 5, 2, 20, 30, 45]
      }]
    },

    // Configuration options go here
    options: {
      legend: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            suggestedMax: 20,
            beginAtZero: true,
            min: 0,
            max: 10,
            stepSize: 1
          }
        }]
      }
    }
  });
}

/* ==========================================================================
   Update Storage Level Data
   ========================================================================== */
function updateStorageLevelData() {
  storageLevel = [];
  data.storage.forEach(function (storage) {
    var beerVar = storage.name.toLowerCase().replace(/ /g, "");
    //console.log(beerVar);
    var short = {
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

    var beer = {
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

  var status = void 0;

  storageLevel.forEach(function (storage) {
    if (storage.level >= 6) {
      status = "good";
    } else if (storage.level <= 2) {
      status = "bad";
    } else if (storage.level > 2 && storage.level < 6) {
      status = "okay";
    }

    var color = {
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
    var type = e.target.dataset.type;
    var text = {
      keg: {
        header: "KEG LEVEL",
        body: "Keg level displays the amount of beer left in a keg. The unit is in cl.<br /><br />Abbreviations:<br />ELH : El Hefe<br />FTA : Fairy Tale Ale<br />HBL : Hollaback Lager<br />GTH : GitHop<br />HEA : Hoppily Ever After<br />MIT : Mowintime<br />R26 : Row 26<br />RCH : Ruined Childhood<br />SLR : Sleighride<br />SMP : Steampunk"
      },
      storage: {
        header: "STORAGE LEVEL",
        body: "Storage level displays the amount of kegs in the storage room.<br /><br />Abbreviations:<br />ELH : El Hefe<br />FTA : Fairy Tale Ale<br />HBL : Hollaback Lager<br />GTH : GitHop<br />HEA : Hoppily Ever After<br />MIT : Mowintime<br />R26 : Row 26<br />RCH : Ruined Childhood<br />SLR : Sleighride<br />SMP : Steampunk"
      },
      topBox: {
        header: "OVERVIEW",
        body: "QUEUE displays the amount of clients waiting in line.<br /><br />SERVING displays the amount of clients currently beeing served<br /><br />PERFORMANCE displays the all around performance which is calculated based on the needed time to serve the last 20 beers. An average time is calculated and compared to 10s/beer which would be considered 100%. All performance over 60% is considered as very good!"
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

/* ==========================================================================
   Update the time clock in the nav
   ========================================================================== */
function updateTime() {
  var date = new Date();
  var hours = date.getHours() >= 10 ? date.getHours() : "0" + date.getHours();
  var min = date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes();
  var sec = date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds();
  timeNav.textContent = hours + ":" + min + ":" + sec;
}
},{}],"..\\..\\..\\..\\..\\..\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '50999' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["..\\..\\..\\..\\..\\..\\AppData\\Roaming\\npm\\node_modules\\parcel-bundler\\src\\builtins\\hmr-runtime.js","scripts\\script.js"], null)
//# sourceMappingURL=script.68d08339.map