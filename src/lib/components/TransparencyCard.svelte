<div class="transparency-card">
	<div class="card-header">
		<h2 class="text-lg font-black text-ink-900 dark:text-ink-50">Where it goes</h2>
	</div>
	<div class="content space-y-4">
		<div class="item">
			<span class="label">Infrastructure</span>
			<p class="desc">Hosting for firehose and API endpoints.</p>
		</div>
		<div class="item">
			<span class="label">Domains</span>
			<p class="desc">Maintaining the croft.click identity.</p>
		</div>
		<div class="item">
			<span class="label">Time</span>
			<p class="desc">Every contribution buys dedicated time for open-source development.</p>
		</div>
	</div>

	<div class="card-header mt-6">
		<h2 class="text-lg font-black text-ink-900 dark:text-ink-50">Roadmap</h2>
	</div>
	<ul class="roadmap space-y-2">
		<li class="done">✓ Patronage integration</li>
		<li class="active">◯ Benefactor-tier portal</li>
		<li>◯ Next-gen import tools</li>
	</ul>
</div>

<style>
	.transparency-card {
		background: var(--canvas-100);
		border: 1px solid var(--border);
		border-radius: 1rem;
		padding: 1.5rem;
	}
	.card-header {
		margin-bottom: 1rem;
	}
	.item {
		margin-bottom: 0.75rem;
	}
	.label {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--primary-600);
		text-transform: uppercase;
	}
	.desc {
		font-size: 0.85rem;
		color: var(--muted);
		margin-top: 0.1rem;
	}

	.roadmap {
		list-style: none;
		padding: 0;
		font-size: 0.85rem;
	}
	.done {
		color: #4ade80;
	}
	.active {
		color: #fafaf9;
		font-weight: 600;
	}
</style>
