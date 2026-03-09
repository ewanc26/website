import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { parseWebhook, WebhookError, appendEvent } from '@ewanc26/supporters';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	console.log('[webhook] POST received', {
		contentType: request.headers.get('content-type'),
		userAgent: request.headers.get('user-agent')
	});

	// Bridge SvelteKit's private env into process.env for the supporters package.
	process.env.ATPROTO_DID = PUBLIC_ATPROTO_DID;
	process.env.ATPROTO_APP_PASSWORD = env.ATPROTO_APP_PASSWORD;

	let payload;
	try {
		payload = await parseWebhook(request, {
			secret: env.KOFI_VERIFICATION_TOKEN,
			...(env.KOFI_TEST_TOKEN ? { testToken: env.KOFI_TEST_TOKEN } : {})
		});
		console.log('[webhook] parsed payload', {
			type: payload.type,
			from: payload.from_name,
			isPublic: payload.is_public,
			timestamp: payload.timestamp,
			messageId: payload.message_id
		});
	} catch (err) {
		if (err instanceof WebhookError) {
			console.error('[webhook] WebhookError', { status: err.status, message: err.message });
			return json({ error: err.message }, { status: err.status });
		}
		console.error('[webhook] unexpected parse error', err);
		throw err;
	}

	if (!payload.is_public) {
		console.log('[webhook] skipping private payload');
		return new Response(null, { status: 200 });
	}

	try {
		await appendEvent(
			payload.from_name,
			payload.type,
			payload.tier_name,
			payload.timestamp,
			{
				isSubscriptionPayment: payload.is_subscription_payment,
				isFirstSubscriptionPayment: payload.is_first_subscription_payment,
				shopItems: payload.shop_items?.map((i) => i.direct_link_code)
			}
		);
		console.log('[webhook] appendEvent success', { from: payload.from_name, type: payload.type });
	} catch (err) {
		console.error('[webhook] appendEvent failed', err);
		throw err;
	}

	return new Response(null, { status: 200 });
};
