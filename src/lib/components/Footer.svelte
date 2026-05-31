<script lang="ts">
</script>

<footer class="site-footer">
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
    <a href="/site/meta" class="footer-link">site meta</a>
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

    .footer-link {
        color: var(--color-ink-600);
        text-decoration: none;
    }

    .footer-link:hover {
        color: var(--color-primary-500);
    }

    @media (max-width: 560px) {
        .site-footer {
            padding: var(--space-md);
        }
    }
</style>
