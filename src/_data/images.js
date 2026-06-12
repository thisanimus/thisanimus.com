import fs from 'node:fs/promises';

const dirs = {
	photos: 'assets/media/photos',
	sketchbook: 'assets/media/sketchbook',
};

export default async function () {
	const all = [];

	for (const [type, dir] of Object.entries(dirs)) {
		const files = (await fs.readdir(dir)).filter((name) => !name.startsWith('.'));

		for (const name of files) {
			all.push({
				name,
				type,
				url: `/${dir.replace(/^assets\//, '')}/${name}`, // -> /media/photos/...
			});
		}
	}

	// Fisher-Yates shuffle
	for (let i = all.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[all[i], all[j]] = [all[j], all[i]];
	}

	return all;
}
