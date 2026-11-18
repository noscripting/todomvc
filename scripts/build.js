const fs = require("fs").promises;
const path = require("path");

const sourceDirectory = "./src";
const targetDirectory = "./dist";

const htmlFile = "index.html";

const filesToMove = [
	"node_modules/todomvc-common/base.css",
];

const build = async () => {
	// remove dist directory if it exists
	await fs.rm(targetDirectory, { recursive: true, force: true });

	// re-create the directory.
	await fs.mkdir(targetDirectory);

	// copy src folder
	await fs.cp(sourceDirectory, targetDirectory, { recursive: true });

	// copy files to move
	for (const file of filesToMove)
		await fs.copyFile(file, path.join(targetDirectory, path.basename(file)));

	// read html file, and remove the base paths of the files moved and of the source directory
	let html = await fs.readFile(htmlFile, "utf8");
	for (const file of filesToMove)
		html = html.replaceAll(file, path.basename(file));
	html = html.replaceAll(`${path.basename(sourceDirectory)}/`, "");

	// write html file
	await fs.writeFile(path.join(targetDirectory, htmlFile), html);

	console.log("done!!");
};

build();
