import { rebuildSchema } from "@/src/be/graphql/yoga";

//////////
// MAIN //
//////////
export async function updateSchema() {
    await rebuildSchema();
}