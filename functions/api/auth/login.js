import { authenticateUser, createSessionCookie } from "../../_lib/auth.js";
import { json, readJson } from "../../_lib/http.js";

export async function onRequestPost(context) {
  const body = await readJson(context.request);
  if (!body) return json({ error: "Invalid JSON." }, 400);

  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password) {
    return json({ error: "請輸入帳號與密碼。" }, 400);
  }

  try {
    const user = await authenticateUser(context.env, username, password);
    if (!user) return json({ error: "帳號或密碼錯誤。" }, 401);

    const cookie = await createSessionCookie(context.env, user);
    return json({
      ok: true,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      id: user.id
    }, 200, { "Set-Cookie": cookie });
  } catch (error) {
    console.error("login failed", error);
    return json({ error: "登入失敗，請稍後再試。" }, 500);
  }
}
