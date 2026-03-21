export async function firePromptWebhook(
  webhookUrl: string,
  payload: {
    id: string | number;
    prompt_name: string | null;
    content: string | null;
    prompt_type: 'text' | 'voice';
    client_id: string;
  }
) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        action: 'updated',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.warn('Webhook fire failed (non-blocking):', err);
  }
}

export async function fireKnowledgeBaseWebhook(
  webhookUrl: string,
  payload: {
    action: 'created' | 'updated' | 'deleted';
    id?: number | string;
    title?: string;
    content?: string;
    tag?: string;
    clientId: string;
  }
) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
    });
  } catch (err) {
    console.warn('KB webhook fire failed (non-blocking):', err);
  }
}
