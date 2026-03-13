<script lang="ts">
	import { page } from '$app/stores';

	export let data;
	export let folder = null;
	export let pathname = '';

	let expanded: Record<string, boolean> = {};
	
	$: {
		pathname = $page.url.pathname;
		// Auto-expand folders containing current page
		const shouldExpand = (f: any): boolean => {
			const hasActivePage = f.pages?.some((p: any) => p.path === pathname) || 
								 f.folders?.some((sub: any) => shouldExpand(sub));
			if (hasActivePage) {
				expanded[f.label] = true;
			}
			return hasActivePage;
		};
		
		if (!folder && data) {
			data.docs?.forEach(shouldExpand);
		} else if (folder) {
			shouldExpand(folder);
		}
	}
</script>

{#if folder}
	<li>
		<button class="folder-btn" on:click={() => (expanded[folder.label] = !expanded[folder.label])}>
			<span class="arrow" class:open={expanded[folder.label]}>▶</span>
			{folder.label}
		</button>
		{#if expanded[folder.label]}
			<ul class="nested">
				{#each folder.pages as page}
					<li>
						<a href={page.path} class:active={pathname === page.path}>{page.label}</a>
					</li>
				{/each}
				{#each folder.folders as subfolder}
					<svelte:self {subfolder} {pathname} />
				{/each}
			</ul>
		{/if}
	</li>
{:else if data}
	<div class="container">
		<aside class="sidebar">
			<ul>
				{#each data.docs as topFolder}
					<li>
						<button class="folder-btn" on:click={() => (expanded[topFolder.label] = !expanded[topFolder.label])}>
							<span class="arrow" class:open={expanded[topFolder.label]}>▶</span>
							{topFolder.label}
						</button>
						{#if expanded[topFolder.label]}
							<ul class="nested">
								{#each topFolder.pages as page}
									<li>
										<a href={page.path} class:active={pathname === page.path}>{page.label}</a>
									</li>
								{/each}
								{#each topFolder.folders as subfolder}
									<svelte:self folder={subfolder} {pathname} />
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</aside>

		<main>
			<slot />
		</main>
	</div>
{/if}

<style>
	.container {
		display: flex;
		gap: 2rem;
		/* max-width: 1200px; */
		margin: 0 auto;
		padding: 2rem;
	}

	.sidebar {
		flex: 0 0 200px;
	}

	.sidebar ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.sidebar li {
		margin-bottom: 0.5rem;
	}

	.folder-btn {
		all: unset;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 1rem;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.folder-btn:hover {
		background-color: var(--color-bg-1);
	}

	.arrow {
		display: inline-block;
		transition: transform 0.2s;
		font-size: 0.75rem;
	}

	.arrow.open {
		transform: rotate(90deg);
	}

	.nested {
		list-style: none;
		padding-left: 1.5rem;
		margin: 0;
	}

	.sidebar a {
		display: block;
		padding: 0.5rem 1rem;
		border-left: 3px solid transparent;
		transition: all 0.2s;
	}

	.sidebar a:hover {
		border-left-color: var(--color-primary);
		background-color: var(--color-bg-1);
	}

	.sidebar a.active {
		border-left-color: var(--color-primary);
		background-color: var(--color-bg-1);
		font-weight: 500;
	}

	main {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			gap: 1rem;
		}

		.sidebar {
			flex: 1;
		}
	}
</style>
