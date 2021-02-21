(function (ready) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    ready();
  } else {
    document.addEventListener("readystatechange", function() {
      if (document.readyState === "complete") {
        ready();
      }
    });
  }
})(function perf() { /* the document is now complete. */

  var data = {
    url: window.location.href,
    dcl: 0,
    load: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    fid: 0
  };

  var fcpObserver = new PerformanceObserver(function handleFCP(entryList) {
    // * API Boilerplate to gather the entries data. get entries or an empty array
    var entries = entryList.getEntries() || [];
    // * we loop over each entry and capture an specific entry call first-content-ful-paint
    entries.forEach(function(entry) {
      if (entry.name === "first-contentful-paint") {
        // * then we assign that to our data object as a fcp property and throw there the value of entry.startTime
        data.fcp = entry.startTime;
        // * Optional clg
        console.log("Recorded FCP Performance: " + data.fcp);
      }
    });
    // * we activate the observable and pass in the options 
  }).observe({ type: "paint", buffered: true });

  var lcpObserver = new PerformanceObserver(function handleLCP(entryList) {
    var entries = entryList.getEntries() || [];
    entries.forEach(function(entry) {
      // * as LCP get the data on each CP render we want to know if it is the largest to assign it ot our data.lcp
      if (entry.startTime > data.lcp) {
        data.lcp = entry.startTime;
        console.log("Recorded LCP Performance: " + data.lcp);
      }
    });
  }).observe({ type: "largest-contentful-paint", buffered: true });

  var clsObserver = new PerformanceObserver(function handleCLS(entryList) {
    var entries = entryList.getEntries() || [];
    entries.forEach(function(entry) {
      // * we want to know if that layout-shift was expected caused by user input, so we want that entry.hadRecentIput to be false
      if (!entry.hadRecentInput) {
        // * to add them all together to our data.cls
        data.cls += entry.value;
        console.log("Increased CLS Performance: " + data.cls);
      }
    });
  }).observe({ type: "layout-shift", buffered: true });

  var fidObserver = new PerformanceObserver(function handleFID(entryList) {
    var entries = entryList.getEntries() || [];
    entries.forEach(function(entry) {
      // * if there input by the user we get this data, otherwise we wont.
      // * we have to subtract these two values to get the correct value 
      data.fid = entry.processingStart - entry.startTime;
      console.log("Recorded FID Performance: " + data.fid);
    });
  }).observe({ type: "first-input", buffered: true });

  // * we rather get the data before the user unloads the page but we cannot do much in the event
  window.addEventListener("beforeunload", function() {
    var navEntry = performance.getEntriesByType("navigation")[0];
    data.dcl = navEntry.domContentLoadedEventStart;
    data.load = navEntry.loadEventStart;

    // * Beacon is a small payload 
    var payload = JSON.stringify(data);
    navigator.sendBeacon("/api/perf", payload);
    console.log("Sending performance:", payload);
  });

});
