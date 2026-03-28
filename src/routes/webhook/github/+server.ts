import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { parseGitHubSponsorsWebhook, GitHubWebhookError, appendSponsorEvent } from '@ewanc26/supporters';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	console.log('[webhook/github] POST received', {
		event: request.headers.get('x-github-event'),
		delivery: request.headers.get('x-github-delivery')
	});

	// Bridge SvelteKit's private env into process.env for the supporters package.
	process.env.ATPROTO_DID = PUBLIC_ATPROTO_DID;
	process.env.ATPROTO_APP_PASSWORD = env.ATPROTO_APP_PASSWORD;

	let payload;
	try {
		payload = await parseGitHubSponsorsWebhook(request, {
			secret: env.GITHUB_WEBHOOK_SECRET
		});
		console.log('[webhook/github] parsed payload', {
			action: payload.action,
			sponsor: payload.sponsorship.sponsor.login,
			tier: payload.sponsorship.tier.name,
			privacy: payload.sponsorship.privacy_level
		});
	} catch (err) {
		if (err instanceof GitHubWebhookError) {
			console.error('[webhook/github] GitHubWebhookError', { status: err.status, message: err.message });
			return json({ error: err.message }, { status: err.status });
		}
		console.error('[webhook/github] unexpected parse error', err);
		throw err;
	}

	// Respect the sponsor's privacy preference.
	if (payload.sponsorship.privacy_level !== 'public') {
		console.log('[webhook/github] skipping private sponsorship');
		return new Response(null, { status: 200 });
	}

	// pending_* actions are informational — don't write a record until the action completes.
	if (payload.action === 'pending_cancellation' || payload.action === 'pending_tier_change') {
		console.log('[webhook/github] skipping pending action', payload.action);
		return new Response(null, { status: 200 });
	}

	try {
		await appendSponsorEvent(
			payload.sponsorship.sponsor.login,
			payload.sponsorship.sponsor.name,
			payload.action,
			payload.sponsorship.tier.name,
			payload.sponsorship.tier.monthly_price_in_dollars,
			payload.sponsorship.created_at
		);
		console.log('[webhook/github] appendSponsorEvent success', {
			login: payload.sponsorship.sponsor.login,
			action: payload.action
		});
	} catch (err) {
		console.error('[webhook/github] appendSponsorEvent failed', err);
		throw err;
	}

	return new Response(null, { status: 200 });
};
