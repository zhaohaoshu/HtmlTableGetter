const btnPickTable = document.getElementById("btnPickTable");

function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, {});
    }
}

btnPickTable.addEventListener("click", function (event) {
    browser.tabs.query({ currentWindow: true, active: true }).then(sendMessageToTabs);
    window.close();
});