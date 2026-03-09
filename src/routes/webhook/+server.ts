import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { parseWebhook, WebhookError, appendEvent } from '@ewanc26/supporters';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// The supporters package reads auth config from process.env directly;
	// bridge SvelteKit's private env into it before any calls.
	process.env.KOFI_VERIFICATION_TOKEN = env.KOFI_VERIFICATION_TOKEN;
	process.env.ATPROTO_DID = PUBLIC_ATPROTO_DID;
	process.env.ATPROTO_APP_PASSWORD = env.ATPROTO_APP_PASSWORD;

	let payload;
	try {
		payload = await parseWebhook(request);
	} catch (err) {
		if (err instanceof WebhookError) {
			return json({ error: err.message }, { status: err.status });
		}
		throw err;
	}

	if (!payload.is_public) {
		return new Response(null, { status: 200 });
	}

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

	return new Response(null, { status: 200 });
};
