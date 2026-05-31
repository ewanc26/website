<script lang="ts">
</script>

<footer class="site-footer">
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
    <nav class="footer-nav">
        <a href="mailto:contact@ewancroft.uk" class="footer-link">contact@ewancroft.uk</a>
        <a href="/site/brand" class="footer-link">brand</a>
        <a href="/site/meta" class="footer-link">site meta</a>
    </nav>
</footer>

<style>
    .site-footer {
        border-top: 1px solid var(--surface-color);
        padding: var(--space-lg) var(--space-lg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--text-xs);
        color: var(--color-ink-600);

    }

    .site-footer p {
        margin: 0;
    }

    .footer-nav {
        display: flex;
        align-items: center;
        gap: var(--space-md);
    }

    .footer-link {
        color: var(--color-ink-600);
        text-decoration: none;
        white-space: nowrap;
    }

    .footer-link:hover {
        color: var(--color-primary-700);
    }

    @media (max-width: 640px) {
        .site-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-sm);
            padding: var(--space-md);
        }

        .footer-nav {
            gap: var(--space-sm);
            flex-wrap: wrap;
        }
    }
</style>
