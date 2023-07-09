import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');

	if (origin && origin === 'https://chat.openai.com') {
		// * This needs to be here to allow the request
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			});
		}
		event.request.headers.append('Access-Control-Allow-Origin', origin);
		return await resolve(event);
	}
	return await resolve(event);
};
