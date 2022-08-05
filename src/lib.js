const axios = require('axios');

class Item {
	constructor(raw) {
		this.ups = raw.ups;
		this.downs = raw.downs;
		this.name = raw.name;
		this.title = raw.title;
		this.link = raw.permalink;
		this.url = raw.url;
		this.sub = raw.subreddit;
	}

	toString() {
		return `${this.link}\n⬆️${this.ups} ⬇️${this.downs} "${this.title}"\n${this.url}\n`;
	}
}


async function search(subreddit, type, query, before, limit = 100) {
	let url = `https://api.reddit.com/r/${subreddit}/search?restrict_sr=on&sort=new&t=all&limit=${limit}&show=all&nsfw=on&include_over_18=on&before=${before || '0'}`;
	if (type === 'keyword') {
		url += `&q=${query}`;
	} else if (type === 'flair') {
		url += `&q=flair: "${query}"`;
	}
	const result = await axios.get(url)
		.then(res => res.data.data.children.map(child => child.data))
		.then(data => data.map(p => new Item(p)))
		.then(data => data.reverse());
	return result;
}
module.exports = search;

module.exports = {
	Item,
	search
};