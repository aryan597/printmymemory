/**
 * Meshy.ai API wrapper for image-to-3D model generation.
 * Docs: https://docs.meshy.ai/api-image-to-3d
 *
 * Set VITE_MESHY_API_KEY in your .env file.
 * Free tier: 200 credits/month (~20 conversions).
 */

const API_KEY = import.meta.env.VITE_MESHY_API_KEY;
const BASE_URL = 'https://api.meshy.ai/v1';

/**
 * Start an image-to-3D task.
 * @param {string} imageUrl - Public URL of the uploaded image.
 * @returns {Promise<string>} Task ID
 */
export async function startImageTo3D(imageUrl) {
  if (!API_KEY) throw new Error('VITE_MESHY_API_KEY is not set.');

  const res = await fetch(`${BASE_URL}/image-to-3d`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: false,
      ai_model: 'meshy-4',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Meshy API error ${res.status}`);
  }

  const data = await res.json();
  return data.result; // task ID
}

/**
 * Poll for task completion.
 * @param {string} taskId
 * @returns {Promise<{ status: string, modelUrl: string|null, progress: number }>}
 */
export async function getTaskStatus(taskId) {
  if (!API_KEY) throw new Error('VITE_MESHY_API_KEY is not set.');

  const res = await fetch(`${BASE_URL}/image-to-3d/${taskId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Meshy status error ${res.status}`);
  }

  const data = await res.json();
  return {
    status: data.status,           // 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED'
    progress: data.progress ?? 0,  // 0-100
    modelUrl: data.model_urls?.glb ?? null,
    thumbnailUrl: data.thumbnail_url ?? null,
  };
}

/**
 * Poll until done or failed (max ~3 minutes).
 * Calls onProgress(0-100) as it goes.
 * @returns {Promise<{ modelUrl: string, thumbnailUrl: string }>}
 */
export async function waitForModel(taskId, onProgress) {
  const MAX_POLLS = 40;
  const INTERVAL_MS = 5000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise(r => setTimeout(r, INTERVAL_MS));
    const { status, progress, modelUrl, thumbnailUrl } = await getTaskStatus(taskId);

    onProgress?.(progress);

    if (status === 'SUCCEEDED') {
      return { modelUrl, thumbnailUrl };
    }
    if (status === 'FAILED') {
      throw new Error('3D model generation failed. Please try a clearer photo.');
    }
  }

  throw new Error('Generation timed out. Please try again.');
}
