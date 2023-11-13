import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

router
    .get("/", async (ctx, next) => {
        ctx.response.type = "text/html";
        ctx.response.body = await Deno.readFile(`${Deno.cwd()}/html/index.html`);
        await next();
    })
    .get("/js/:filepath", async (ctx) => {
        await send(ctx, ctx.params.filepath, {
            root: `${Deno.cwd()}/js`,
        });
    })
    .get("/models/:model", async (ctx) => {
        await send(ctx, ctx.params.model, {
            root: `${Deno.cwd()}/models`,
        });
    })
    // new WebSocket("ws://localhost:8080/ws")
    .get("/ws", async (ctx) => {
        if (!ctx.isUpgradable) ctx.throw(501);

        const ws = await ctx.upgrade();

        ws.onopen = () => console.log("ws:Open");
        ws.onclose = () => console.log("ws:Close");
        ws.onerror = () => console.log("ws:Error");
        ws.onmessage = (e) => console.log("ws:Message", e.data);
    });

app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
        `Listening on ${secure ? "https://" : "http://"}${
            hostname ?? "localhost"
        }:${port}`
    );
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8080 });
