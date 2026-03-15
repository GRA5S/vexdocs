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
		{#if folder.folders.length > 0}
			<button class="folder-btn" on:click={() => (expanded[folder.label] = !expanded[folder.label])}>
				<a href={folder.path} class:active={pathname === folder.path}>{folder.label}</a>
				<span class="arrow" class:open={expanded[folder.label]}>▶</span>
			</button>
			{#if expanded[folder.label]}
				<ul class="nested">
					{#each folder.pages as page}
						<li>
							<a href={page.path} class:active={pathname === page.path}>{page.label}</a>
						</li>
					{/each}
					{#each folder.folders as subfolder}
						<svelte:self folder={subfolder} {pathname} />
					{/each}
				</ul>
			{/if}
		{:else}
			<a href={folder.path} class:active={pathname === folder.path}>{folder.label}</a>
		{/if}
	</li>
{:else if data}
	<div class="main">
		<aside class="sidebar">
			<ul>
				{#each data.docs as topFolder}
					<li>
						{#if topFolder.folders.length > 0}
							<button class="folder-btn" on:click={() => (expanded[topFolder.label] = !expanded[topFolder.label])}>
								<a href={topFolder.path} class:active={pathname === topFolder.path}>{topFolder.label}</a>
								<span class="arrow" class:open={expanded[topFolder.label]}>▶</span>
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
						{:else}
							<a href={topFolder.path} class:active={pathname === topFolder.path}>{topFolder.label}</a>
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
	.main {
		display: flex;
		gap: 2rem;
		/* max-width: 80vw; */
		margin: 0 auto;
		width:100%;
		/* margin-top:-1.5em; */
		padding: 2rem;
		padding-top: 0;
	}

	.sidebar {
		flex: 0 0 15vw;
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
		/* all: unset; */
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		border-radius: 5px;
		/* padding: 0.5rem 1rem; */
		cursor: pointer;
		/* font-weight: 500; */
		/* font-size: 18px; */
    	/* line-height: 1.555556; */
		/* transition: background-color 0.2s; */
	}

	.folder-btn:hover {
		background-color: var(--color-bg-1);
	}

	.folder-btn a {
		/* color: inherit; */
		text-decoration: none;
		text-align: left;
	}

	.arrow {
		display: inline-block;
		transition: transform 0.2s;
		font-size: 0.55rem;
		margin-left: -40px;
	}

	.arrow.open {
		transform: rotate(90deg);
	}

	.nested {
		list-style: none;
		padding-left: 3rem;
		margin: 0;
	}

	.nested li {
		margin-left: 2rem;
	}

	.sidebar a {
		display: block;
		padding: 0.5rem 1rem;
		/* border-left: 3px solid transparent; */
		transition: all 0.2s;
		font-weight: 500;
		font-size: 18px;
    	line-height: 1.555556;
		border-radius: 5px;
		width: 100%;
	}

	.sidebar a:hover {
		/* border-left-color: var(--color-primary); */
		background-color: var(--color-bg-1);
	}

	.sidebar a.active {
		/* border-left-color: var(--color-primary); */
		background-color: var(--color-bg-1);
	}

	main {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.main {
			flex-direction: column;
			gap: 1rem;
		}

		.sidebar {
			flex: 1;
		}
	}
</style>
