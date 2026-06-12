import eleventyImage from '@11ty/eleventy-img';
import * as fs from 'fs';

const shortcodes = {
	image: async function (filepath, alt, widths, classes, sizes) {
		const imageDir = '/assets/';
		const defaultFormat = 'webp';
		filepath = '.' + imageDir + filepath;

		const options = {
			formats: ['webp', defaultFormat],
			widths: widths ? widths.split(',') : [600, 900, 1500],
			urlPath: imageDir,
			outputDir: './_site' + imageDir,
		};

		const stats = await eleventyImage(filepath, options);

		return eleventyImage.generateHTML(stats, {
			alt,
			loading: 'lazy',
			decoding: 'async',
			sizes: sizes || '(min-width: 22em) 30vw, 100vw',
			class: classes || '',
		});
	},
	svg: async function svgShortcode(file) {
		const svgString = fs.readFileSync('./assets/' + file);
		const currentColor = svgString
			.toString()
			.replace(/#000000/g, 'currentColor')
			.replace(/#000/g, 'currentColor');
		return currentColor;
	},
	generateProps: function generateProps(props) {
		let style = '';
		console.log(props);
		for (const key in props) {
			style += `${key}:${props[key]}; `;
		}
		return style;
	},
};

export default async function (eleventyConfig) {
	// plugins

	// shortcodes
	eleventyConfig.addShortcode('image', shortcodes.image);
	eleventyConfig.addShortcode('svg', shortcodes.svg);
	eleventyConfig.addFilter('generateProps', shortcodes.generateProps);

	// passthroughs
	eleventyConfig.addPassthroughCopy('./assets');
	eleventyConfig.addPassthroughCopy('./src/**/*.css');
	eleventyConfig.addPassthroughCopy('./src/**/*.js');

	return {
		dir: {
			input: 'src',
			output: '_site',
			data: '_data',
			layouts: '_layouts',
		},
		templateFormats: ['html', 'liquid', 'md'],
		markdownTemplateEngine: 'liquid',
		htmlTemplateEngine: 'liquid',
	};
}
