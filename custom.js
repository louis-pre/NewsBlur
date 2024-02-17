// Custom JS to add duration for youtube videos, works better than before.
// Still some layout issues in non-group Youtube RSS threads but I barely use them ¯\_(ツ)_/¯

function replace_image(storyNode) {
  var imageDiv = storyNode.getElementsByClassName(
    "NB-storytitles-story-image"
  )[0];
  if (!imageDiv) {
    return;
  }
  var re = /url\("(.*?)"\)/;
  var match = re.exec(imageDiv.style.backgroundImage);
  if (!match) {
    return;
  }
  const image = document.createElement("img");
  image.className = "new-image";
  image.style.width = "100%";
  image.src = match[1];
  imageDiv.replaceWith(image);
}

function use_youtube_card(storyNode) {
  var title = storyNode.getElementsByClassName("story_title")[0];
  if (!title || !title.href.includes("youtube.com/watch")) {
    return;
  }

  // Remove height restrictions
  var container = storyNode.getElementsByClassName("NB-story-grid")[0];
  if (container) {
    container.style.height = "unset";
    container.style.backgroundColor = "unset";
  }
  storyNode.style.height = "unset";

  // Add duration and remove description
  var description = storyNode.getElementsByClassName(
    "NB-storytitles-content-preview"
  )[0];
  if (description) {
    var re = /Duration:\ ([0-9:]+)\n?/;
    var match = re.exec(description.innerText);
    if (!match) {
      return;
    }
    // Add duration to image
    var imageContainer = storyNode.getElementsByClassName(
      "NB-storytitles-story-image-container"
    )[0];
    imageContainer.style.position = "relative";
    const span = document.createElement("span");
    span.innerText = match[1];
    span.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    span.style.color = "white";
    span.style.position = "absolute";
    span.style.right = "0";
    span.style.bottom = "0";
    imageContainer.appendChild(span);

    // Remove the description
    description.remove();
  }

  // Move date next to channel name
  var footer = storyNode.getElementsByClassName(
    "NB-storytitles-grid-bottom"
  )[0];
  console.log("FOOTER", footer);
  if (footer) {
    var feedTitle = storyNode.getElementsByClassName("feed_title")[0];
    var feedDate = footer.getElementsByClassName("story_date")[0];

    feedTitle.style.position = "unset";
    feedTitle.innerText = feedTitle.innerText + " - " + feedDate.innerText;

    // Remove the footer
    footer.remove();
  }

  // Move channel and date below title
  var titleContainer = storyNode.getElementsByClassName(
    "NB-storytitles-content"
  )[0];
  if (titleContainer) {
    var channelAndDate = storyNode.getElementsByClassName("NB-story-feed")[0];
    // channelAndDate.style.width = "unset";
    channelAndDate.style.width = "200px";
    channelAndDate.remove();
    titleContainer.appendChild(channelAndDate);
  }
}

// Add durations
var container = document.getElementsByClassName("right-pane")[0];
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (!mutation.target.closest(".NB-layout-grid")) {
      return;
    }
    if (mutation.addedNodes.length > 0) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        if (
          !newNode.className?.includes("NB-story-title-container") &&
          !newNode.className?.includes("NB-story-grid")
        ) {
          continue;
        }
        var title = newNode.getElementsByClassName("story_title")[0];
        if (!title || !title.href.includes("youtube.com/watch")) {
          continue;
        }
        replace_image(newNode);
        use_youtube_card(newNode);
      }
    }
  });
});
observer.observe(container, { subtree: true, childList: true });

cursor.forEach(function (doc) {
  var updatedUrls = doc.image_urls.map(function (url, index) {
    if (index == 0)
      return url.replace(new RegExp(pattern, "i"), replacementValue);
    return url;
  });
  /* Update the document with the modified array*/
  db.stories.updateOne({ _id: doc._id }, { $set: { image_urls: updatedUrls } });
});
