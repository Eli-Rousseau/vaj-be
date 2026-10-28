import { ConfigError } from "@/core/errors";

///////////////
// VARIABLES //
///////////////
const allowedOrigins: Record<string, string[]> = {
    dev: ["", "http://localhost:1230"],
    prod: []
}

///////////
// TYPES //
///////////
type CorsEvent = {
    origin: string;
};

type CorsResult = {
    allowed: boolean;
}

//////////
// MAIN //
//////////
export function cors(event: CorsEvent): CorsResult {
    const { origin } = event;

    const stage = process.env.STAGE;
    if (!stage) throw new ConfigError("Missing required environmental variable: STAGE.");

    const allowed = allowedOrigins[stage].includes(origin);

    return { allowed };
}