window.onload = function () {
    let windowTabCount = document.getElementById("window-tab-count");
    let totalTabCount = document.getElementById("total-tab-count");
    let totalWindowCount = document.getElementById("total-window-count");
    let moreInfoBtn = document.getElementById("more-info");

    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        windowTabCount.textContent = tabs.length;
    });

    chrome.tabs.getAll(function (tabs) {
        totalTabCount.textContent = tabs.length;
    });

    chrome.windows.getAll(function (windows) {
        totalWindowCount.textContent = windows.length;
    });

    moreInfoBtn.addEventListener("click", function () {
        chrome.tabs.create({ url: "page.html" });
    });
}
