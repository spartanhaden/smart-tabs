window.onload = function () {
    const windowTabCount = document.getElementById("window-tab-count");
    const totalTabCount = document.getElementById("total-tab-count");
    const totalWindowCount = document.getElementById("total-window-count");
    const moreInfoBtn = document.getElementById("more-info");

    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        windowTabCount.textContent = tabs.length;
    });

    chrome.tabs.query({}, function (tabs) {
        totalTabCount.textContent = tabs.length;
    });

    chrome.windows.getAll(function (windows) {
        totalWindowCount.textContent = windows.length;
    });

    moreInfoBtn.addEventListener("click", function () {
        chrome.tabs.create({ url: "page.html" });
    });
}
