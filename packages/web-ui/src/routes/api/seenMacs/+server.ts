import getSeenMacs from "$lib/server/getSeenMacs";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = () => getSeenMacs().then(json);
