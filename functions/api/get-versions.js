export const onRequest = async (context) => {
    const kv = context.env.VERSIONS_KV;
    let list = await kv.get("versions_list", { type: "json" });

    if (!list) {
        list = ["12.3.1", "12.3", /* fallback list if empty */];
    }

    return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json", "Cache-Control": "s-maxage=300" }
    });
};
