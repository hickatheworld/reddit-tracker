const fs = require('fs');
const {search} = require('./lib');
const colors = require('colors');

let SAVE;
let TRACK;

async function refresh() {
	for (const t of TRACK) {
		let result = await search(t.subreddit, t.type, t.query, SAVE[t.label].lastItem);
		if (!result.length) {
			result = await search(t.subreddit, t.type, t.query);
			const last = SAVE[t.label].date;
			if (!last) continue;
			result = result.filter(u => u.date > last);
			}
		if (result.length) {
			console.log(colors.bgCyan('New items for ' + t.label));
			for (const item of result) {
				console.log(colors.green(item.toString()));
				SAVE[t.label].lastItem = item.name;
				SAVE[t.label].date = item.date;	
				fs.writeFileSync('save.json', JSON.stringify(SAVE, null, 2));
				}
		} else {
			console.log(colors.bgRed('No item for ' + t.label));
		}
	}
}

(async () => {
	console.log();
	console.log(colors.bgYellow('LAUNCHING'));
	if (fs.existsSync('track.json')) {
		console.log(colors.cyan('Loading track.json...'));
		TRACK = require('../track.json');
		const labels = [];
		for (const {label} of TRACK) {
			if (labels.includes(label)) {
				console.log(colors.red(`Duplicate label: ${label}`));
				process.exit(1);
			}
			labels.push(label);
		}
	} else {
		console.log(colors.red(`Missing track.json`));
		process.exit(1);
	}
	if (fs.existsSync('save.json')) {
		console.log(colors.cyan('Loading save.json...'));
		SAVE = require('../save.json');
	} else {
		console.log('Generating save...');
		SAVE = {};
	}
	for (const t of TRACK) {
		if (SAVE[t.label] && SAVE[t.label].lastItem) {
			console.log(colors.green(`Last item for ${t.label} is ${SAVE[t.label].lastItem}`));
			continue;
		}
		const [lastItem] = await search(t.subreddit, t.type, t.query, '', 1);
		SAVE[t.label] = {};
		if (lastItem) {
			SAVE[t.label].lastItem = lastItem.name;
			SAVE[t.label].date = lastItem.date;
			console.log(colors.green(`Last item for ${t.label} is ${lastItem.name}`));
		} else {
			console.log(colors.red(`No items for ${t.label}`));
		}
	}
	fs.writeFileSync('save.json', JSON.stringify(SAVE, null, 2));
	console.log(colors.cyan('Saved save.json'));
	console.log(colors.bgGreen('READY'));
	console.log();
	refresh();
})();
