import { readdirSync } from 'fs';
import { join } from 'path';

function getLabel(name: string) {
	return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ').replace(/\.(svelte|md|svx)$/, '');
}

interface Page {
	path: string;
	label: string;
}

interface Folder {
	label: string;
	path: string;
	pages: Page[];
	folders: Folder[];
}

function scanDir(dirPath: string, basePath: string): { pages: Page[]; folders: Folder[] } {
	const entries = readdirSync(dirPath, { withFileTypes: true });
	const pages: Page[] = [];
	const folders: Folder[] = [];

	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;

		const fullPath = join(dirPath, entry.name);
		
		if (entry.isFile() && entry.name.startsWith('+page') && (entry.name.endsWith('.svelte') || entry.name.endsWith('.md') || entry.name.endsWith('.svx'))) {
			const slug = entry.name.replace(/\+page\.(svelte|md|svx)/, '');
			pages.push({
				path: slug ? `${basePath}/${slug}` : basePath,
				label: slug ? getLabel(slug) : getLabel(basePath.split('/').pop()!)
			});
		} else if (entry.isDirectory()) {
			const nested = scanDir(fullPath, `${basePath}/${entry.name}`);
			if (nested.pages.length || nested.folders.length) {
				const folderPath = `${basePath}/${entry.name}`;
				const filteredPages = nested.pages.filter(p => p.path !== folderPath);
				// Keep the root page if it's the only content
				const pagesToShow = filteredPages.length === 0 && nested.folders.length === 0 
					? nested.pages 
					: filteredPages;
				folders.push({
					label: getLabel(entry.name),
					path: folderPath,
					pages: pagesToShow,
					folders: nested.folders
				});
			}
		}
	}

	return { 
		pages: pages.sort((a, b) => a.label.localeCompare(b.label)), 
		folders: folders.sort((a, b) => a.label.localeCompare(b.label)) 
	};
}

export async function load() {
	try {
		const docsDir = join(process.cwd(), 'src/routes/docs');
		const entries = readdirSync(docsDir, { withFileTypes: true });
		
		const docs: Folder[] = entries
			.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
			.map(dir => {
				const nested = scanDir(join(docsDir, dir.name), `/docs/${dir.name}`);
				const folderPath = `/docs/${dir.name}`;
				const filteredPages = nested.pages.filter(p => p.path !== folderPath);
				// Keep the root page if it's the only content
				const pagesToShow = filteredPages.length === 0 && nested.folders.length === 0 
					? nested.pages 
					: filteredPages;
				
				return {
					label: getLabel(dir.name),
					path: folderPath,
					pages: pagesToShow,
					folders: nested.folders
				};
			})
			.sort((a, b) => a.label.localeCompare(b.label));

		return { docs };
	} catch (error) {
		console.error('Failed to load docs:', error);
		return { docs: [] };
	}
}
