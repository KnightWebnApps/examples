import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ }) => {
	return json(
		{ todos: ['Go to the grocery store.', 'Build a ChatGPT plugin'] },
		{ statusText: 'OK', status: 200 }
	);
};
