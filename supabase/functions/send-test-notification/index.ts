const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SendTestNotificationBody = {
  subscriptionId?: string | null;
  userId?: string | null;
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init?.headers ?? {}),
    },
  });
}

function getBearerToken(authHeader: string | null) {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      "=",
    );
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload) as { sub?: unknown };
  } catch {
    return null;
  }
}

function getCallerUserId(req: Request) {
  const token = getBearerToken(req.headers.get("Authorization"));
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  return typeof payload?.sub === "string" ? payload.sub : null;
}

function buildOneSignalPayload(params: {
  appId: string;
  subscriptionId?: string | null;
  userId: string;
}) {
  const basePayload = {
    app_id: params.appId,
    headings: {
      en: "Linka",
      pt: "Linka",
    },
    contents: {
      en: "Your test notification is working.",
      pt: "Sua notificacao de teste esta funcionando.",
    },
    custom_data: {
      type: "test_notification",
      userId: params.userId,
    },
  };

  if (params.subscriptionId) {
    return {
      ...basePayload,
      include_subscription_ids: [params.subscriptionId],
    };
  }

  return {
    ...basePayload,
    target_channel: "push",
    include_aliases: {
      external_id: [params.userId],
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

  if (!appId || !apiKey) {
    return jsonResponse({ error: "OneSignal env ausente" }, { status: 500 });
  }

  let body: SendTestNotificationBody;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "JSON invalido" }, { status: 400 });
  }

  const callerUserId = getCallerUserId(req);
  const userId = callerUserId ?? body.userId;

  if (!userId) {
    return jsonResponse({ error: "Usuario autenticado nao identificado" }, { status: 401 });
  }

  const payload = buildOneSignalPayload({
    appId,
    subscriptionId: body.subscriptionId,
    userId,
  });

  const response = await fetch("https://api.onesignal.com/notifications?c=push", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    return jsonResponse({ error: data }, { status: response.status });
  }

  return jsonResponse({ ok: true, onesignal: data });
});
