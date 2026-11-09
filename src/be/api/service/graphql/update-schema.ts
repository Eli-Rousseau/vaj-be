import { rebuildSchema } from "@/be/graphql/yoga";

//////////
// MAIN //
//////////
export async function updateSchema() {
    await rebuildSchema();
}