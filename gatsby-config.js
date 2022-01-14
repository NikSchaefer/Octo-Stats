module.exports = {
	siteMetadata: {
		title: "OctoStats",
		description:
			"Take a look at a more detailed representation of github profile and repo stats",
		siteUrl: "https://octo-stats.vercel.app", // No trailing slash allowed!
		image: "/icon.png", // Path to your image you placed in the 'static' folder
		twitterUsername: "@NikSchaefer_",
		author: "nikkschaefer@gmail.com Nik Schaefer",
		url: "https://octo-stats.vercel.app/",
		language: `en-us`,
		keywords: ["Github", "Stats", "Code"],
	},
	plugins: [
		"gatsby-plugin-react-helmet",
		"gatsby-plugin-sharp",
		{
			resolve: "gatsby-plugin-manifest",
			options: {
				icon: "src/images/icon.png",
			},
		},
		"gatsby-transformer-sharp",
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "images",
				path: "./src/images/",
			},
			__key: "images",
		},
		{
			resolve: `gatsby-plugin-typescript`,
			options: {
				isTSX: true, // defaults to false
				jsxPragma: `jsx`, // defaults to "React"
				allExtensions: true, // defaults to false
			},
		},
	],
};
