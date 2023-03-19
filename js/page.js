// chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
//     if (changeInfo.status === 'complete') {
//         const title = tab.title;
//         const url = 'http://localhost:8000/title';
//         const options = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ title })
//         };

//         // send and don't wait for response
//         fetch(url, options);
//         // const response = await fetch(url, options);
//         // console.log(await response.text());
//     }
// });

// make a new function that returns a list item with the title and url of the tab and favicon and listener to focus the tab and window when clicked
function makeTabListItem(tab) {
    const li = document.createElement("li");
    const tabTitle = document.createElement("div");

    // add the class tab-list-item to the li
    li.classList.add("tab-list-item");

    // add a tab title
    tabTitle.textContent = tab.title;

    // make the tab title auto truncate with fade if it is too long
    tabTitle.classList.add("tab-title");

    // log active with description
    // console.log("active: " + tab.active) // true, false
    // console.log("autoDiscardable: " + tab.autoDiscardable) // true, false
    // console.log("discarded: " + tab.discarded) // true, false
    // console.log("highlighted: " + tab.highlighted) // true, false
    // console.log("selected: " + tab.selected) // true, false
    // console.log("status: " + tab.status) // unloaded, loading, complete

    // make it focus on the tab and make it the active tab
    li.addEventListener("click", function () {
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
    });

    // Create an img element for the favicon
    const favicon = document.createElement("img");

    // Set the src attribute of the img element to the tab's favIconUrl
    favicon.src = tab.favIconUrl;

    // Set the width and height of the favicon
    favicon.width = 16;
    favicon.height = 16;

    // Set some style for the favicon to add some spacing between it and the link text
    favicon.style.marginRight = "8px";

    // make a circle element
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.textContent = "\u25CF";

    circle.classList.add(tab.status);

    // Add the favicon to the li
    li.appendChild(favicon);

    // add the link to the list item
    li.appendChild(tabTitle);

    // add the circle to the li
    li.appendChild(circle);

    return li;
};

function handleSearchBar() {
    const searchBox = document.getElementById('search-box');
    const searchResultStatus = document.getElementById('search-result-status');
    const searchResults = document.getElementById('search-results');

    searchBox.addEventListener('input', function () {
        const query = searchBox.value.toLowerCase();
        chrome.tabs.query({}, function (tabs) {
            const matchingTabs = tabs.filter(function (tab) {
                return tab.title.toLowerCase().includes(query) || tab.url.toLowerCase().includes(query);
            });
            displayResults(matchingTabs);
        });
    });

    function displayResults(tabs) {
        searchResultStatus.textContent = tabs.length;
        searchResults.innerHTML = '';
        if (tabs.length === 0) {
            searchResults.innerHTML = 'No matching tabs found.';
            return;
        }
        const ul = document.createElement('ul');
        ul.classList.add("tab-list");
        tabs.forEach(function (tab) {
            ul.appendChild(makeTabListItem(tab));
        });
        searchResults.appendChild(ul);
    }
};

    // handle send-data button
function handleSendDataButton() {
    const sendButton = document.getElementById('send-data');
    sendButton.addEventListener('click', async function () {
        console.log('hello')
        const title = 'hello';
        // Send the title to the local server
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8000/title');
        xhr.setRequestHeader('Content-Type', 'application/json');

        // try to send and if there is no response change the button text to failed also catch Failed to load resource: net::ERR_CONNECTION_REFUSED

        // status div
        const status = document.getElementById('status');

        response = xhr.send(JSON.stringify({ title }));

        // xhr.onload = function () {
        //     if (xhr.status != 200) { // analyze HTTP status of the response
        //         console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        //         status.textContent = `Error ${xhr.status}: ${xhr.statusText}`;
        //     } else { // show the result
        //         console.log(`Done, got ${xhr.response.length} bytes`); // response is the server
        //         status.textContent = `Done, got ${xhr.response.length} bytes`;
        //     }
        // };

    });
};

window.onload = function () {
    const windowTabCount = document.getElementById("window-tab-count");
    const totalTabCount = document.getElementById("total-tab-count");
    const totalWindowCount = document.getElementById("total-window-count");

    chrome.tabs.query({ currentWindow: true }, function (tabs) {
        windowTabCount.textContent = tabs.length;
            });

                chrome.tabs.query({}, function (tabs) {
        totalTabCount.textContent = tabs.length;
            });

    chrome.windows.getAll(function (windows) {
        totalWindowCount.textContent = windows.length;
    });

    handleSendDataButton();

    handleSearchBar();

    // for each window get the title of the current tab and add a new h2 element to the page with that and the number of tabs in the window
    chrome.windows.getAll({ populate: true }, function (windows) {
        let windows_list = [];
        let tab_list = [];

        windows.forEach(function (window) {
            windows_list.push({ 'window': window, 'title': window.tabs[0].title, 'tab_count': window.tabs.length })

            window.tabs.forEach(function (tab) { tab_list.push(tab); });
        });

        // update window-count
        document.getElementById("total-window-count").textContent = windows_list.length;

        // check for duplicate tab
        let duplicate_tabs = {};

        // go through each tab and add it to the duplicate_tabs dict
        tab_list.forEach(function (tab) {
            // make a new set for each url if it doesn't exist
            if (!(tab.url in duplicate_tabs)) { duplicate_tabs[tab.url] = new Set(); }

            // add the tab id to the set
            duplicate_tabs[tab.url].add(tab.id);
        });

        // make an if statement that checks if there's any duplicates and if so adds a header saying so
        if (Object.keys(duplicate_tabs).some(function (url) { return duplicate_tabs[url].size > 1; })) {
            // make a detail tag that will show the duplicate tabs
            const detail = document.createElement("details");
            document.body.appendChild(detail);

            // make a summary tag that will show the duplicate tabs
            const summary = document.createElement("summary");
            const h2 = document.createElement("h2");
            h2.textContent = "Duplicate Tabs found:";
            h2.style.color = "orange";
            h2.style.display = "inline-block";
            // append as a summary to the details tag
            summary.appendChild(h2);
            detail.appendChild(summary);

            // go through the duplicate_tabs dict and print any sets with more than one element
            for (let url in duplicate_tabs) {
                if (duplicate_tabs[url].size > 1) {
                    // make a h3 that says the count and the url
                    const duplicateSet = document.createElement("div");
                    duplicateSet.textContent = "(" + duplicate_tabs[url].size + ") - " + url;

                    detail.appendChild(duplicateSet);

                    const ul = document.createElement("ul");
                    ul.classList.add("tab-list");

                    // get all the tabs with that url
                    chrome.tabs.query({ url: url }, function (tabs) {
                        // for each tab
                        tabs.forEach(function (tab) {
                            ul.appendChild(makeTabListItem(tab));
                        });
                    });
                    detail.appendChild(ul);
                }
            }
        }

        // make a h2 that says tabs
        const h2 = document.createElement("h2");
        h2.textContent = "Windows:";
        document.body.appendChild(h2);

        // sort the windows array by the reverse number of tabs in each window
        windows_list.sort(function (a, b) {
            return a.tab_count - b.tab_count;
        });

        // for each dict in the windows array
        windows_list.forEach(function (window) {
            // truncate the title if it is too long
            const maxTitleLength = 80;
            let truncatedTitle = window.title;
            if (truncatedTitle.length > maxTitleLength) { truncatedTitle = truncatedTitle.substring(0, maxTitleLength) + "..."; }

            // add a button called focus that will focus on that window
            const focusBtn = document.createElement("button");
            focusBtn.textContent = "focus";
            focusBtn.addEventListener("click", function () { chrome.windows.update(window.window.id, { focused: true }); });

            // add an h3 with the number of tabs in the window and the title of the current tab on the same line
            // (tab_count) - title
            const h3 = document.createElement("h3");
            h3.textContent = "(" + window.tab_count + ") - " + truncatedTitle;

            const container = document.createElement("div");

            // Set the display property of both elements to inline-block
            focusBtn.style.display = "inline-block";
            h3.style.display = "inline-block";

            // make the button and the h3 have a little space between them
            focusBtn.style.marginRight = "10px";

            // add a list of all the tabs in the window in a ul detail tag
            const detail = document.createElement("details");
            const summary = document.createElement("summary");

            const ul = document.createElement("ul");
            ul.classList.add("tab-list");

            // add a list item for each tab in the window
            window.window.tabs.forEach(function (tab) {
                // add the list item to the list
                ul.appendChild(makeTabListItem(tab));
            });

            // add the list to the detail tag
            detail.appendChild(ul);

            // expand if there are less than 50 tabs in the window
            if (window.tab_count < 50) { detail.setAttribute("open", ""); }

            summary.appendChild(focusBtn);
            summary.appendChild(h3);

            // add the summary to the detail
            detail.appendChild(summary);

            // add the detail tag to the container
            container.appendChild(detail);

            document.body.appendChild(container);

        });
    });
};
