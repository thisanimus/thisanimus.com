import fs from 'node:fs/promises';
import sharp from 'sharp';
import { Vibrant } from 'node-vibrant/node';

const dirs = {
	photos: 'assets/media/photos',
};

const GRAY_CUTOFF = 0.1; // saturation below this = no meaningful hue

async function dominantColor(file) {
	// Downscale with sharp first. libvips streams large JPEGs safely, so the
	// oversized decode that blows jpeg-js's memory limit never happens. Vibrant
	// then only ever sees a ~200px buffer — which is plenty for quantization.
	const buf = await sharp(file).resize(200, 200, { fit: 'inside', withoutEnlargement: true }).toBuffer();

	const palette = await Vibrant.from(buf).getPalette();
	const swatch = palette.Vibrant;
	if (!swatch) return null; // no Vibrant swatch for this image

	const [h, s, l] = swatch.hsl; // all normalized 0–1
	return { hex: swatch.hex, rgb: swatch.rgb, h, s, l };
}

export default async function () {
	const all = [];

	for (const [type, dir] of Object.entries(dirs)) {
		const files = (await fs.readdir(dir)).filter((n) => !n.startsWith('.'));
		for (const name of files) {
			all.push({
				name,
				type,
				url: `/${dir.replace(/^assets\//, '')}/${name}`,
				color: await dominantColor(`${dir}/${name}`),
			});
		}
	}

	// ROYGBIV gradient = ascending hue (Vibrant's hsl hue is 0–1). Images with no
	// meaningful hue (near-grayscale or no Vibrant swatch) go to the end.
	all.sort((a, b) => {
		const ag = !a.color || a.color.s < GRAY_CUTOFF;
		const bg = !b.color || b.color.s < GRAY_CUTOFF;
		if (ag && bg) return (b.color?.l ?? 0) - (a.color?.l ?? 0);
		if (ag) return 1;
		if (bg) return -1;
		return a.color.h - b.color.h;
	});

	return all;
}
