// Custom JS to add duration for youtube videos, it works but makes the list view bug (for youtube only)

function add_duration(storyNode) {
    var description = storyNode.getElementsByClassName("NB-storytitles-content-preview")[0];
    if (!description) {
        return;
    }
    var re = /Duration:\ (.+?)\ /;
    var match = re.exec(description.innerText);
    if (match) {
        var imageContainer = storyNode.getElementsByClassName("NB-storytitles-story-image-container")[0];
        imageContainer.style.position = "relative";
        const node = document.createElement("span");
        node.innerText = match[1];
        node.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        node.style.color = "white";
        node.style.position = "absolute";
        node.style.right = "0";
        node.style.bottom = "0";
        imageContainer.appendChild(node);
    }
}

// Add durations
var container = document.getElementsByClassName("NB-layout")[0];
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.target.className.includes("NB-story-titles") && mutation.addedNodes.length > 0) {
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                const newNode = mutation.addedNodes[i];
                if (newNode.className.includes("NB-story-title-container")) {
                    add_duration(newNode);
                }
            }
        }
    });
});
observer.observe(container, { subtree: true, childList: true });