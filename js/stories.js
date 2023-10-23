"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, isOwn = false) {
	// console.debug("generateStoryMarkup", story);
	let starCan = "";
	let delButt = "";
	if (currentUser !== undefined) {
		if (currentUser.isFavorite(story)) {
			starCan = `<span class="star"><i class=" fa-star fas"></i></span>`;
		} else {
			starCan = `<span class="star"><i class="far fa-star"></i></span>`;
		}
	}
	if (isOwn) {
		delButt = `<span class="trash-can"><i class="fas fa-trash-alt"></i></span>`;
	}
	const hostName = story.getHostName();
	return $(`
      <li id="${story.storyId}">
	  ${delButt}
	  	${starCan}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug("putStoriesOnPage");

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(
			story,
			story.username === currentUser.username
		);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}
$submitForm.on("submit", submitNewStory);
async function submitNewStory(evt) {
	console.debug("submitNewStory");
	$allStoriesList.show();
	$submitForm.hide();
	evt.preventDefault();
	let url = $("#submit-url").val();
	let title = $("#submit-title").val();
	let author = $("#submit-author").val();
	let story = await storyList.addStory(currentUser, {
		title,
		url,
		author,
		username: currentUser.username,
	});
	$allStoriesList.prepend(generateStoryMarkup(story, true));
}
//Following the example given very closely, as I couldn't figure it out on my own.
async function toggleStoryFavorite(evt) {
	console.debug("toggleStoryFavorite");
	const $target = $(evt.target);
	const storyId = $target.closest("li").attr("id");
	console.log(storyId);
	const story = storyList.stories.find((s) => s.storyId === storyId);

	await currentUser.handleFavorite(story, $target.hasClass("fas"));
	$target.closest("i").toggleClass("fas far");
}
$allStoriesList.on("click", ".star", toggleStoryFavorite);

async function deleteStory(evt) {
	const $target = $(evt.target);
	const storyId = $target.closest("li").attr("id");
	const story = storyList.stories.find((s) => s.storyId === storyId);
	await currentUser.deleteStory(story);
	getAndShowStoriesOnStart();
}
$allStoriesList.on("click", ".trash-can", deleteStory);
