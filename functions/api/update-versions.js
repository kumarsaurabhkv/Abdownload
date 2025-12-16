export const onRequest = async (context) => {
    // Optional security: add a secret
    // const secret = context.request.headers.get('X-Update-Secret');
    // if (secret !== 'your-super-secret') return new Response('No', {status: 401});

    const kv = context.env.VERSIONS_KV;
    const newList = await context.request.json();

    if (!Array.isArray(newList)) {
        return new Response('Bad data', {status: 400});
    }

    await kv.put("versions_list", JSON.stringify(newList));

    return new Response('Updated', {status: 200});
};
