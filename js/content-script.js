chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == "get all performance") {
        if (window && window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize) {
            sendResponse({
            	timing:window.performance.timing,
            	memory:{
            		totalJSHeapSize:window.performance.memory.totalJSHeapSize,
            		usedJSHeapSize:window.performance.memory.usedJSHeapSize
            	},
            	entries:window.performance.getEntries()
            });
        } else {
            sendResponse("null");
        }
    }
});