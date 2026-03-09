import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { PUBLIC_ATPROTO_DID } from '$env/static/public';
import { parseWebhook, WebhookError } from '@ewanc26/supporters';
import { getPDSAgent } from '@ewanc26/atproto';
import { generateTID } from '@ewanc26/tid';
import type { RequestHandler } from './$types';

const COLLECTION = 'uk.ewancroft.kofi.supporter';

export const POST: RequestHandler = async ({ request }) => {
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
		...(payload.tier_name ? { tier: payload.tier_name } : {})
	};

	await agent.com.atproto.repo.putRecord({
		repo: PUBLIC_ATPROTO_DID,
		collection: COLLECTION,
		rkey: generateTID(payload.timestamp),
		record: record as Record<string, unknown>
	});

	return new Response(null, { status: 200 });
};
