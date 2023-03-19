chrome.tabs.query({ currentWindow: true }, function (currentTabs) {
    chrome.tabs.query({}, function (allTabs) {
        let currentCount = currentTabs.length;
        let totalCount = currentCount;
        allTabs.forEach(function (tab) {
            if (tab.windowId != currentTabs[0].windowId) {
                totalCount++;
            }
        });
        document.getElementById("current-tab-count").textContent = currentCount;
        document.getElementById("total-tab-count").textContent = totalCount;

        let moreInfoBtn = document.getElementById("more-info");
        moreInfoBtn.addEventListener("click", function() {
            chrome.tabs.create({ url: "page.html" });
        });
    });
});
