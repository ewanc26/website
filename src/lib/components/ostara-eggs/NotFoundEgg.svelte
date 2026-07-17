<script lang="ts">
	// Easter egg #10 — the 404 narrative.
	// "Three years ago, this site had a name I can't remember."
</script>

<div class="egg-panel">
	<div class="egg-panel-head">
		<span class="egg-badge">STATUS 404</span>
	</div>
	<div class="egg-panel-body">
		<h1 class="egg-title">Nowhere, for now.</h1>
		<p class="egg-desc">
			Three years ago, this site had a name I can't remember. That page existed somewhere — a
			forgotten Neocities URL, a GitHub Pages subdomain long since reclaimed by the void.
		</p>
		<p class="egg-desc">
			What's here now is still here. The domain holds. The data persists. Whatever you were looking
			for may have moved, or may never have existed in this version of the site.
		</p>
		<p class="egg-desc egg-muted">
			That's not a gap. That's the anti-entropy infrastructure not quite being perfect yet.
		</p>
		<div class="egg-actions">
			<a href="/" class="egg-btn">Back to ewancroft.uk</a>
		</div>
	</div>
</div>

<style>
	.egg-panel {
		width: 100%;
		border: 1px solid var(--surface-color, color-mix(in oklch, currentColor 12%, transparent));
		border-radius: var(--radius-lg, 8px);
		overflow: hidden;
		background: var(--surface-raised, Canvas);
	}

	.egg-panel-head {
		padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
		border-bottom: 1px solid var(--surface-color, color-mix(in oklch, currentColor 10%, transparent));
		background: var(--surface-raised, transparent);
	}

	.egg-badge {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: var(--text-xs, 0.75rem);
		color: var(--color-primary-600);
		letter-spacing: 0.05em;
	}

	.egg-panel-body {
		padding: var(--space-xl, 2rem);
	}

	.egg-title {
		margin-top: 0;
		margin-bottom: var(--space-sm, 0.5rem);
		font-size: var(--text-xl, 1.5rem);
		font-weight: 800;
		letter-spacing: -0.025em;
		color: var(--color-ink-950);
	}

	.egg-desc {
		margin-top: 0;
		margin-bottom: var(--space-md, 1rem);
		color: var(--color-ink-700);
		font-size: var(--text-md, 1rem);
		line-height: 1.6;
		max-width: 55ch;
	}

	.egg-desc:last-of-type {
		margin-bottom: var(--space-xl, 2rem);
	}

	.egg-muted {
		color: var(--color-ink-500);
		font-size: var(--text-sm, 0.875rem);
	}

	.egg-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md, 1rem);
	}

	.egg-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm, 0.5rem) var(--space-lg, 1.5rem);
		font-size: var(--text-sm, 0.875rem);
		font-weight: 600;
		text-decoration: none;
		border-radius: var(--radius-md, 6px);
		background-color: var(--color-primary-600);
		color: var(--color-canvas-50, white);
		transition: background-color 0.15s ease;
	}

	.egg-btn:hover {
		background-color: var(--color-primary-500);
	}
</style>
