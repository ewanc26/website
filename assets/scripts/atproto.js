'use strict';
async function atprotoSite(options) {

// globalvar

let md;
if (window.markdownit) {
	md = window.markdownit();
} else {
	// if the markdown parser isn't loaded, just make it text with linebreaks
	md = {
		render: (markdown) => {
			const p = document.createElement('p');
			p.innerText = markdown;
			return p.outerHTML;
		}
	}
}

// html elements
const refs = {
	scrollers: document.querySelectorAll('.atproto-site-scroll'),
	postContainer: document.querySelector('post-container'),
	pagination: document.querySelector('if-pagination'),
	ifPreviousPage: document.querySelector('if-previous-page'),
	ifNextPage: document.querySelector('if-next-page'),
	currentPageNumber:document.querySelector('current-page-number'),
	previousPageLink: wrapLink(document, '', 'previous-page-link'),
	nextPageLink: wrapLink(document, '', 'next-page-link')
}
// places to store loaded info
const cache = {
	users: {},
	records: {},
	page: 1
}
const stream = {
	records: [],
	queues: []
}
function addQueue(user, collection, filter) {
	stream.queues.push({
		user: user,
		collection: collection,
		records: [],
		cursor: '',
		reachedEnd: false,
		filter: filter
	});
}

// Modal

const modal = document.createElement('div');
modal.style.position = 'fixed';
modal.style.inset = '0';
modal.style.display = 'flex';
modal.style.flexDirection = 'column';
modal.style.justifyContent = 'center';
modal.style.alignItems = 'center';
modal.style.pointerEvents = 'none';

const modalImage = document.createElement('img');
modalImage.style.display = 'block';
modalImage.style.width = 'auto';
modalImage.style.height = 'auto';
modalImage.style.maxHeight = '90%';
modalImage.style.maxWidth = '90%';
modalImage.style.pointerEvents = 'auto';
modal.appendChild(modalImage);

const modalBackground = document.createElement('div');
modalBackground.style.position = 'fixed';
modalBackground.style.inset = '0';
modalBackground.style.background = '#000000bb';
modalBackground.onclick = function () {
	modal.remove();
	this.remove();
}

const modalAlt = document.createElement('div');
modalAlt.style.maxWidth = '90%';
modalAlt.style.padding = '.5em';
modalAlt.style.marginTop = '12px';
modalAlt.style.background = '#222222';
modalAlt.style.color = '#ffffff';
modalAlt.style.border = '1px solid #555555';
modalAlt.style.borderRadius = '6px';
modalAlt.style.overflowY = 'auto';
modalAlt.style.pointerEvents = 'auto';
modalAlt.ariaHidden = 'true';
modal.appendChild(modalAlt);

function openModal(src, alt) {
	modalImage.src = src;
	modalImage.alt = alt;
	modalAlt.textContent = alt;
	document.body.appendChild(modalBackground);
	document.body.appendChild(modal);
}

// Sources

const sources = [
	{
		name: 'Bluesky',
		createQueue(user) {
			let filter = function (record) {
				if (!options.showReplies && record.value.reply) {
					return false;
				}
				if (options.hideNSFW) {
					// filters out all current self labels
					if (record.value.labels && record.value.labels.values) {
						for (let label of record.value.labels.values) {
							if (label.val === "porn" || label.val === "graphic-media" || label.val === "sexual" || label.val === "nudity") {
								return false;
							}
						}
					}
				}
				return true;
			}
			addQueue(user, 'app.bsky.feed.post', filter);
		},
		createPost(record, info) {
			if (info.collection === 'app.bsky.feed.post') {
				const url = `https://bsky.app/profile/${info.DID}/post/${info.rkey}`;
				let images = [];

				// construct embed based on embed type
				let externalEmbed;
				let embed = record.value.embed;
				if (embed) {
					if (embed.$type === 'app.bsky.embed.images') {
						images = embed.images;
					} else if (embed.$type === 'app.bsky.embed.recordWithMedia') {
						if (embed.media.images) {
							images = embed.media.images;
						} else if (embed.media.video) {
							externalEmbed = { title: embed.alt, text: 'Open video on Bluesky', url: url };
						}
					} else if (embed.$type === 'app.bsky.embed.external') {
						externalEmbed = {
							title: embed.external.title,
							text: embed.external.description,
							url: embed.external.uri,
							user: record.author,
							blob: embed.external.thumb
						}
					} else if (embed.$type === 'app.bsky.embed.video') {
						externalEmbed = { title: embed.alt, text: 'Open video on Bluesky', url: url };
					} else {
						externalEmbed = { text: 'Open embedded content on Bluesky', url: url };
					}
				}

				// pick type of post to create
				let post;
				if (images.length === 1) {
					post = createCustomElement('image-post');
				} else if (images.length > 1) {
					post = createCustomElement('imageset-post');
				} else {
					post = createCustomElement('text-post');
				}

				// replies
				if (record.value.reply) {
					removeCustomElements(post, 'if-not-reply');
					const replyInfo = parseURI(record.value.reply.parent.uri);
					wrapLink(post, `https://bsky.app/profile/${replyInfo.DID}/post/${replyInfo.rkey}`, 'reply-link-wrapper');
				} else {
					removeCustomElements(post, 'if-reply');
				}

				removeCustomElements(post, 'if-title');
				addText(post, record.value.text);
				for (let image of images) {
					addImage(post, record.author, image.image, image.alt);
				}
				if (externalEmbed) {
					addEmbed(post, externalEmbed);
				}
				addRemoteLink(post, url, 'Bluesky');
				addCreatedAt(post, record.value.createdAt);
				return post;
			}
		},
	},
	{
		name: 'WhiteWind',
		createQueue(user) {
			let filter;
			if (!options.showDrafts) {
				filter = (record) => record.value.visibility === 'public';
			}
			addQueue(user, 'com.whtwnd.blog.entry', filter);
		},
		createPost(record, info, threshold) {
			if (info.collection === 'com.whtwnd.blog.entry') {
				const post = createCustomElement('text-post');
				removeCustomElements(post, 'if-reply');
				addText(post, record.value.title, 'title-content');
				addMarkdown(post, record.value.content, threshold);
				addRemoteLink(post, `https://whtwnd.com/${info.DID}/${info.rkey}`, 'WhiteWind');
				addCreatedAt(post, record.value.createdAt);
				return post;
			}
		}
	},
	{
		name: 'Frontpage',
		createQueue(user) {
			addQueue(user, 'fyi.unravel.frontpage.post');
		},
		createPost(record, info) {
			if (info.collection === 'fyi.unravel.frontpage.post') {
				const post = createCustomElement('link-post');
				post.classList.add('frontpage-post');
				removeCustomElements(post, 'if-reply');
				addText(post, record.value.title, 'title-content');
				addText(post, record.value.url, 'link-content');
				wrapLink(post, record.value.url);
				addRemoteLink(post, `https://frontpage.fyi/post/${info.DID}/${info.rkey}`,'Frontpage');
				addCreatedAt(post, record.value.createdAt);
				return post;
			}
		}
	},
	{
		name: 'PinkSea',
		createQueue(user) {
			let filter = function (record) {
				if (!options.showReplies && record.value.inResponseTo) {
					return false;
				}
				if (options.hideNSFW && record.value.nsfw) {
					return false;
				}
				return true;
			}
			addQueue(user, 'com.shinolabs.pinksea.oekaki', filter);
		},
		createPost(record, info) {
			if (info.collection === 'com.shinolabs.pinksea.oekaki') {
				let post = createCustomElement('image-post');

				// replies
				if (record.value.inResponseTo) {
					removeCustomElements(post, 'if-not-reply');
					const replyInfo = parseURI(record.value.inResponseTo.uri);
					wrapLink(post, `https://pinksea.art/${replyInfo.DID}/oekaki/${replyInfo.rkey}`, 'reply-link-wrapper');
				} else {
					removeCustomElements(post, 'if-reply');
				}

				removeCustomElements(post, 'if-title');
				addImage(post, record.author, record.value.image.blob, record.value.image.imageLink.alt);
				addTags(post, record.value.tags);
				addRemoteLink(post, `https://pinksea.art/${info.DID}/oekaki/${info.rkey}`, 'PinkSea');
				addCreatedAt(post, record.value.createdAt);
				return post;
			}
		}
	},
	{
		name: 'pastesphere',
		createQueue(user) {
			addQueue(user, 'link.pastesphere.snippet');
		},
		createPost(record, info, threshold) {
			if (info.collection === 'link.pastesphere.snippet') {
				const post = createCustomElement('text-post');
				removeCustomElements(post, 'if-reply');
				addText(post, record.value.title, 'title-content');
				// put together description and body, wrap code types in backticks
				if (record.value.type === 'Plain Text') {
					addText(post, `${record.value.description}\n\n${record.value.body}`);
				} else if (record.value.type === 'Markdown') {
					addMarkdown(post, `${record.value.description}\n\n${record.value.body}`, threshold);
				} else {
					addMarkdown(post, `${record.value.description}\n\n\`\`\`${record.value.type}\n${record.value.body}\`\`\``, threshold);
				}
				addRemoteLink(post, `https://pastesphere.link/user/${info.DID}/snippet/${info.rkey}`, 'pastesphere');
				addCreatedAt(post, record.value.createdAt);
				return post;
			}
		}
	}
]

// Things that deal with at://

// breaks down URI into DID, collection, and rkey
function parseURI(uri) {
	const components = uri.split('/');
	return {
		DID: components[2],
		collection: components[3],
		rkey: components[4]
	}
}

// returns a cursor and list of records or undefined
async function fetchRecords(DID, collection, limit=20, cursor=undefined) {
	let url = `https://${options.PDS}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=${collection}&limit=${limit}`;
	if (cursor) {
		url += `&cursor=${cursor}`;
	}
	const httpsResponse = await fetch(url, { method: 'GET' });
	if (!httpsResponse.ok) {
		return undefined; // handled differently depending on caller
	}
	const converted = await httpsResponse.json();
	return converted;
}

// returns a single record or undefined
async function fetchRecordByURI(uri) {
	const info = parseURI(uri);
	const url = `https://${options.PDS}/xrpc/com.atproto.repo.getRecord?repo=${info.DID}&collection=${info.collection}&rkey=${info.rkey}`;
	const httpsResponse = await fetch(url, { method: 'GET' });
	if (!httpsResponse.ok) {
		return undefined;
	}
	const converted = await httpsResponse.json();
	converted.author = cache.users[info.DID];
	return converted;
}

// Loading

// adds up to a certain number of records to a queue
async function queueRecords(queue, amount) {
	let records = [];
	let limit = amount;
	while (!records.length) {
		if (queue.reachedEnd) {
			break;
		}

		const response = await fetchRecords(queue.user.DID, queue.collection, limit, queue.cursor);
		queue.cursor = response.cursor;
		if (queue.filter) {
			records = response.records.filter(queue.filter);
		} else {
			records = response.records;
		}

		if (!response.cursor || response.records.length < amount) {
			queue.reachedEnd = true;
		}
	}
	queue.records = queue.records.concat(records);
}

// loads one page worth of records from queues into stream
async function loadRecords() {
	let records = [];
	const postsPerPage = options.postsPerPage;
	while (records.length < postsPerPage) {
		// remove any empty queues
		stream.queues = stream.queues.filter((queue) => {
			return queue.records.length;
		});

		// stop loading if there are no queues
		if (!stream.queues.length) {
			break;
		}

		// find the queue with the smallest first post date
		let queue;
		let latest = stream.queues[0];
		for (let i = 1; i < stream.queues.length; i++) {
			queue = stream.queues[i];
			if (queue.records[0].value.createdAt > latest.records[0].value.createdAt) {
				latest = queue;
			}
		}
		// unshift it into the new page of records
		const latestRecord = latest.records.shift();
		latestRecord.author = latest.user;
		records.push(latestRecord);
		// if that queue is empty, queue up a bit more than the page size
		if (!latest.records.length) {
			await queueRecords(latest, postsPerPage + options.overshoot);
		}
	}
	stream.records = stream.records.concat(records);
}

// returns posts on a given page
async function getPostsByPage(page) {
	const postsPerPage = options.postsPerPage;
	const pageStart = (page - 1) * postsPerPage;
	const pageEnd = pageStart + postsPerPage;

	// load pages until we reach this page + 1 entry
	while (stream.records.length <= pageEnd) {
		await loadRecords();
		// if there is nothing more to load from, return whatever did load
		if (!stream.queues.length) {
			return stream.records.slice(pageStart, pageEnd);
		}
	}
	return stream.records.slice(pageStart, pageEnd);
}

// loads up the page limit and returns all posts with the tag
async function getPostsByTag(tag) {
	await getPostsByPage(options.pageLimit);
	const filteredPosts = stream.records.filter((post) => {
		if (post.value.tags) {
			for (let postTag of post.value.tags) {
				if (tag === postTag.toLowerCase()) {
					return true;
				}
			}
		}
		return false;
	});
	return filteredPosts;
}

// returns a record given its URI
async function getRecord(uri) {
	if (uri in cache.records) {
		return cache.records[uri];
	}
	// if not yet loaded, fetch it and add it
	const record = await fetchRecordByURI(uri);
	cache.records[uri] = record;
	return record;
}

// Custom HTML Elements

function createCustomType(name) {
	customElements.define(name, class extends HTMLElement {});
}
const customTypes = [
	'text-post',
	'image-post',
	'imageset-post',
	'link-post',
	'profile-username',
	'profile-picture',
	'profile-description',
	'link-board',
	'page-nav-container',
	'page-nav',
	'if-previous-page',
	'previous-page-link',
	'if-next-page',
	'next-page-link',
	'current-page',
	'if-index-page',
	'if-tag-page',
	'tag-name',
	'if-author',
	'author-pfp',
	'author-username',
	'author-handle',
	'if-title',
	'title-content',
	'text-content',
	'image-content',
	'link-wrapper',
	'reply-link-wrapper',
	'embed-container',
	'embed-card',
	'remote-link',
	'created-at',
	'tag-container',
	'tag-chip',
	'if-reply',
	'if-not-reply'
]
for (let customType of customTypes) {
	createCustomType(customType);
}

function createCustomElement(type, fallback=true) {
	const element = document.createElement(type);

	let template = document.getElementById(`template-${type}`);

	// for post types, fall back to generic-post
	if (!template && fallback) {
		template = document.getElementById('template-generic-post');
	}

	// clone template or print an error and skip
	try {
		element.appendChild(template.content.cloneNode(true));
	} catch {
		console.error(`Could not find a valid template ${type}.`)
	}

	return element;
}

function showCustomElements(container, type) {
	const elements = container.querySelectorAll(type);
	for (let element of elements) {
		element.style.display = '';
	}
}

function hideCustomElements(container, type) {
	const elements = container.querySelectorAll(type);
	for (let element of elements) {
		element.style.display = 'none';
	}
}

function removeCustomElements(container, type) {
	const elements = container.querySelectorAll(type);
	for (let element of elements) {
		element.remove();
	}
}

function clearContainer(container) {
	container.innerHTML = '';
}

// General element creation

function createPost(record, showAuthor=true, threshold) {
	let post; // will be created depending on the type of post
	const info = parseURI(record.uri);
	for (let source of sources) {
		post = source.createPost(record, info, threshold);
		if (post) break;
	}

	// Add author information
	if (showAuthor) {
		addAuthor(post, record.author);
	} else {
		removeCustomElements(post, 'if-author');
	}

	// Tags as Classes
	if (options.tagsAsClasses) {
		if (record.value.tags) {
			for (let tag of record.value.tags) {
				post.classList.add(tag.toLowerCase());
			}
		}
	}

	return post;
}

// make an img element from blob or image link
function createImage(user, blob, alt) {
	const imageElement = document.createElement('img');
	imageElement.alt = alt;
	// check if it's a blob or not
	if (blob && blob.ref) {
		if (options.blobURL) {
			imageElement.src = `${options.blobURL}/${user.DID}/${blob.ref.$link}`;
		} else {
			imageElement.src = `https://${options.PDS}/xrpc/com.atproto.sync.getBlob?did=${user.DID}&cid=${blob.ref.$link}`;
		}
	} else {
		imageElement.src = blob;
	}
	return imageElement;
}

// container: HTML element
// url: string
// elementTag: string
// returns the link element the content has been wrapped in
function wrapLink(container, url, elementTag='link-wrapper') {
	const content = container.querySelector(elementTag);
	if (content) {
		const link = document.createElement('a');
		link.href = url;
		content.parentElement.replaceChild(link, content);
		link.appendChild(content);
		return link;
	}
}

// Functions that add things to elements

// container: HTML element
// records: array of records
function addPosts(container, records) {
	for (let record of records) {
		let element = createPost(record, true, options.readMore);
		container.appendChild(element);
	}
}

// container: HTML element
// uri: AT URI
// showAuthor: boolean
async function addPostByURI(container, uri, showAuthor) {
	const record = await getRecord(uri);
	if (record) {
		const element = createPost(record, showAuthor);
		container.appendChild(element);
	} else {
		addNotice(container, `The record ${uri} could not be found on the PDS.`);
	}
}

// container: HTML element
// text: string
function addNotice(container, text) {
	const post = createCustomElement('text-post');
	addText(post, text);
	removeCustomElements(post, 'if-title');
	removeCustomElements(post, 'if-reply');
	removeCustomElements(post, 'if-author');
	container.appendChild(post);
}

// post: HTML element
// elementTag: custom element tag
// text: string
function addText(post, text, elementTag='text-content') {
	const textElement = post.querySelector(elementTag);
	if (textElement) {
		textElement.innerText = text;
	}
}

// post: HTML element
// markdown: string
// threshold: how many elements to add Read more line after
// elementTag: custom element tag
function addMarkdown(post, markdown, threshold, elementTag='text-content') {
	const markdownElement = post.querySelector(elementTag);
	if (markdownElement) {
		markdownElement.innerHTML = md.render(markdown);
		if (threshold) {
			const children = markdownElement.children;
			// move all children past the readmore threshold to Details
			if (children.length > threshold) {
				const details = document.createElement('details');
				const summary = document.createElement('summary');
				summary.textContent = 'Read more';
				details.appendChild(summary);
				while (children.length > threshold) {
					details.appendChild(children[threshold]);
				}
				markdownElement.appendChild(details);
			}
		}
	}
}

// post: HTML element
// user: options.users._
// blob: blob
// alt: string
function addImage(post, user, blob, alt, clickToOpen=true) {
	const imageContent = post.querySelector('image-content');
	if (imageContent) {
		const image = createImage(user, blob, alt);
		imageContent.appendChild(image);
		// add onclick event that opens modal with this image
		if (clickToOpen) {
			if (options.blobURL) {
				image.onclick = () => {
					openModal(`${options.blobURL}/${user.DID}/${blob.ref.$link}`, alt);
				};
			} else {
				image.onclick = () => {
					openModal(`https://${options.PDS}/xrpc/com.atproto.sync.getBlob?did=${user.DID}&cid=${blob.ref.$link}`, alt);
				};
			}
		}
	}
}

// post: HTML element
// title, text, url: string
// user: options.users._
// blob: blob
function addEmbed(post, {title, text, url, user, blob}) {
	const embedContainer = post.querySelector('embed-container');
	if (embedContainer) {
		const embedLink = document.createElement('a');
		const embedCard = createCustomElement('embed-card', false);
		if (title) {
			addText(embedCard, title, 'title-content');
		} else {
			removeCustomElements(embedCard, 'if-title');
		}
		addText(embedCard, text, 'text-content');
		if (blob) {
			addImage(embedCard, user, blob, title || text, false);
		}
		embedLink.href = url;
		embedLink.appendChild(embedCard);
		embedContainer.appendChild(embedLink);
	}
}

// post: HTML element
// tags: array of strings
function addTags(post, tags) {
	const tagContainer = post.querySelector('tag-container');
	if (tagContainer) {
		for (let tag of tags) {
			const tagChip = createCustomElement('tag-chip', false);
			wrapLink(tagChip, `#tagged/${tag.toLowerCase()}`);
			addText(tagChip, tag, 'link-content');
			tagContainer.appendChild(tagChip);
		}
	}
}

// post: HTML element
// createdAt: string, https://en.wikipedia.org/wiki/ISO_8601
function addCreatedAt(post, createdAt) {
	const dateElement = post.querySelector('created-at');
	if (dateElement) {
		const datetime = Date.parse(createdAt);
		dateElement.textContent = options.dateFormat.format(datetime);
	}
}

// post: HTML element
// user: options.users._
// adds author username, handle, and pfp, linking to handle domain if requested
function addAuthor(post, user) {
	const usernameElement = post.querySelector('author-username');
	const handleElement = post.querySelector('author-handle');
	const pfpElement = post.querySelector('author-pfp');
	if (usernameElement) {
		usernameElement.textContent = user.profile.username;
	}
	if (handleElement) {
		handleElement.textContent = user.handle;
	}
	if (pfpElement) {
		const pfpImage = createImage(user, user.profile.pfp, `${user.profile.username}'s pfp`);
		pfpElement.appendChild(pfpImage);
	}
	if (options.linkToUserHandles) {
		wrapLink(post, `https://${user.handle}`, 'author-username');
		wrapLink(post, `https://${user.handle}`, 'author-handle');
		wrapLink(post, `https://${user.handle}`, 'author-pfp');
	}
}

// post: HTML element
// url: string
// service: string
function addRemoteLink(post, url, service) {
	const remoteElement = post.querySelector('remote-link');
	if (remoteElement) {
		const remoteLink = document.createElement('a');
		remoteLink.href = url;
		remoteLink.target = '_blank'; // open in new tab
		remoteLink.textContent = `Open on ${service}`;
		remoteElement.appendChild(remoteLink);
	}
}

// Pagination

function updatePagination() {
	if (refs.pagination) {
		const hasPreviousPage = cache.page !== 1; // previous page if not on page 1
		const hasNextPage = (cache.page * options.postsPerPage < stream.records.length) && (cache.page + 1 <= options.pageLimit); // next page if there are records after this page and next page would be within page limit

		// update page number and page number links
		if (refs.currentPageNumber) {
			refs.currentPageNumber.textContent = cache.page;
		}
		if (refs.previousPageLink) {
			if (hasPreviousPage) {
				refs.previousPageLink.href = `#page/${cache.page - 1}`;
			} else {
				refs.previousPageLink.removeAttribute('href');
			}
		}
		if (refs.nextPageLink) {
			if (hasNextPage) {
				refs.nextPageLink.href = `#page/${cache.page + 1}`;
			} else {
				refs.nextPageLink.removeAttribute('href');
			}
		}

		// only display things in <if-previous/next-page> blocks if the page exists
		if (refs.ifPreviousPage) {
			refs.ifPreviousPage.style.display = hasPreviousPage ? '' : 'none';
		}
		if (refs.ifNextPage) {
			refs.ifNextPage.style.display = hasNextPage ? '' : 'none';
		}
		refs.pagination.style.display = '';
	}
}

function hidePagination() {
	if (refs.pagination) {
		refs.pagination.style.display = 'none';
	}
}

// Routing

// numbered page: one page of the timeline
async function goToPage(page) {
	cache.page = page;
	hideCustomElements(document.body, 'if-tag-page');
	showCustomElements(document.body, 'if-index-page');
	clearContainer(refs.postContainer);
	const records = await getPostsByPage(page);
	addPosts(refs.postContainer, records);
	updatePagination();
}

// tag page: all posts up to limit, filtered by tag
async function goToTagPage(tag) {
	document.title += ` | #${tag}`;
	hideCustomElements(document.body, 'if-index-page');
	// add tag text to all if-tag-page tag-name elements
	const tagPageElements = document.body.querySelectorAll('if-tag-page');
	for (let element of tagPageElements) {
		element.style = '';
		addText(element, tag, 'tag-name');
	}
	hidePagination();
	clearContainer(refs.postContainer);
	const records = await getPostsByTag(tag);
	addPosts(refs.postContainer, records);
}

// custom page: the specified post
async function goToCustomPage(url) {
	hideCustomElements(document.body, 'if-tag-page');
	hideCustomElements(document.body, 'if-index-page');
	const page = options.pages[url];
	document.title += ` | ${page.title}`;
	hidePagination();

	// add the new page as a post
	clearContainer(refs.postContainer);
	await addPostByURI(refs.postContainer, page.post, false);
}

async function handleURL(url) {
	document.title = options.title;

	const parts = url.split('/');

	// figure out type of page and run the function for that type
	if (parts.length > 1 && parts[0] === 'page') {
		// #page/${number}
		const page = parseInt(parts[1]) || 1; // if no page number go to 1
		if (page <= options.pageLimit) {
			await goToPage(page);
		}
	} else if (parts.length > 1 && parts[0] === 'tagged') {
		// #tagged/${tag}
		await goToTagPage(parts[1]);
	} else if (url in options.pages) {
		// #${name} that matches a page in options.pages
		await goToCustomPage(url);
	} else if (url) {
		// error: page not found
		clearContainer(refs.postContainer);
		addNotice(refs.postContainer, `The page ${url} could not be found.`);
		hidePagination();
	} else {
		// default: timeline page 1
		await goToPage(1);
	}

	for (let scroller of refs.scrollers) {
		scroller.scroll(0, 0);
	}
}

window.onhashchange = () => {
	const url = window.location.hash.slice(1).toLowerCase();

	// if we navigated to the home page, reload
	if (!url) {
		window.location.reload();
	} else {
		handleURL(url);
	}
}

// page setup for first time load
async function firstLoadSetup() {
	// defaults if not provided
	if (!options.pageLimit) options.pageLimit = 5;
	if (!options.postsPerPage) options.postsPerPage = 10;
	if (!options.overshoot) options.overshoot = options.postsPerPage;
	if (!options.users) options.users = [];
	if (!options.pages) options.pages = {};
	if (!options.dateFormat) options.dateFormat = new Intl.DateTimeFormat();

	for (let user of options.users) {
		// set up queues
		for (let source of sources) {
			if (user.sources[source.name]) {
				source.createQueue(user);
			}
		}
		if (!user.profile) {
			// bluesky profile default
			const response = await fetchRecordByURI(`at://${user.DID}/app.bsky.actor.profile/self`);
			if (response) {
				user.profile = {
					username: response.value.displayName,
					description: response.value.description,
					pfp: response.value.avatar
				};
			} else {
				user.profile = {
					username: `Could not load profile for DID ${user.DID}`,
					description: `Could not load profile for DID ${user.DID}`,
					pfp: ''
				}
			}
		}
		// add user to cache
		cache.users[user.DID] = user;
	}
	
	// Populate profile elements
	const usernameElement = document.querySelector('profile-username');
	const pfpElement = document.querySelector('profile-picture');
	const descriptionElement = document.querySelector('profile-description');
	const firstUser = options.users[0];
	let profile;
	if (usernameElement || pfpElement || descriptionElement) {
		profile = options.profile || firstUser.profile;
	}
	if (usernameElement) {
		usernameElement.textContent = profile.username;
	}
	if (descriptionElement) {
		descriptionElement.innerText = profile.description;
	}
	if (pfpElement) {
		const profilePicture = createImage(firstUser, profile.pfp, 'Site profile picture');
		pfpElement.appendChild(profilePicture);
	}

	// Populate links
	if (firstUser && firstUser.sources.Linkat) {
		const linkBoard = document.querySelector('link-board');
		const response = await fetchRecordByURI(`at://${firstUser.DID}/blue.linkat.board/self`);
		if (response) {
			const cards = response.value.cards;
			for (let card of cards) {
				const linkCard = document.createElement('a');
				linkCard.href = card.url;
				const linkEmoji = document.createElement('span');
				linkEmoji.textContent = card.emoji;
				const linkText = document.createElement('span');
				linkText.textContent = card.text;
				linkCard.appendChild(linkEmoji);
				linkCard.appendChild(linkText);
				linkBoard.appendChild(linkCard);
			}
		} else {
			linkBoard.textContent = 'Could not find Linkat board.';
		}
	}

	// Populate user-added posts on page
	const userAddedPosts = document.querySelectorAll('site-post');
	for (let sitePost of userAddedPosts) {
		const uri = sitePost.dataset.uri;
		if (uri) {
			const showAuthor = sitePost.dataset.showAuthor !== undefined;
			await addPostByURI(sitePost, sitePost.dataset.uri, showAuthor);
		} else {
			addNotice(sitePost, 'Please specify an AT URI.');
		}
	}

	// go to page
	const url = window.location.hash.slice(1).toLowerCase();
	if (!(url in options.pages)) {
		// initial queue population for tl pages
		for (let queue of stream.queues) {
			await queueRecords(queue, options.postsPerPage + options.overshoot);
		}
	}
	await handleURL(url);
}

await firstLoadSetup();

}