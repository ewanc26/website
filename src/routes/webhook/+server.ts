import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { parseWebhook, WebhookError } from '@ewanc26/supporters';
import { getPDSAgent } from '@ewanc26/atproto';
import { generateTID } from '@ewanc26/tid';
import type { RequestHandler } from './$types';

const COLLECTION = 'uk.ewancroft.kofi.supporter';

export const POST: RequestHandler = async ({ request }) => {
	// parseWebhook reads process.env directly; bridge SvelteKit's private env into it
	process.env.KOFI_VERIFICATION_TOKEN = env.KOFI_VERIFICATION_TOKEN;

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

	const agent = await getPDSAgent(PUBLIC_ATPROTO_DID);
	await agent.login({ identifier: PUBLIC_ATPROTO_DID, password: env.ATPROTO_APP_PASSWORD });

	const record = {
		name: payload.from_name,
		type: payload.type,
		...(payload.tier_name ? { tier: payload.tier_name } : {}),
		...(payload.is_subscription_payment ? { isSubscriptionPayment: true } : {}),
		...(payload.is_first_subscription_payment ? { isFirstSubscriptionPayment: true } : {}),
		...(payload.shop_items?.length ? { shopItems: payload.shop_items.map((i) => i.direct_link_code) } : {})
	};

	await agent.com.atproto.repo.putRecord({
		repo: PUBLIC_ATPROTO_DID,
		collection: COLLECTION,
		// Ko-fi timestamps have no timezone; append 'Z' so they parse as UTC
		rkey: generateTID(payload.timestamp.endsWith('Z') ? payload.timestamp : payload.timestamp + 'Z'),
		record: record as Record<string, unknown>
	});

	return new Response(null, { status: 200 });
};
