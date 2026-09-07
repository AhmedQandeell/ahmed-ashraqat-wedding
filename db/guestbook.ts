import {env} from "cloudflare:workers";
export function guestDb(){if(!env.DB)throw new Error("Guestbook storage unavailable");return env.DB}
