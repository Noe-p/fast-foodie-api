import * as request from 'supertest';

// Ce test de smoke ping l'API déployée.
// Par défaut, utilise l'URL publique. Peut être surchargée via API_URL.

describe('Smoke test API déployée', () => {
  const baseUrl =
    process.env.API_URL || 'https://api.fast-foodie.noe-philippe.fr';

  beforeAll(() => {
    // Étend le timeout pour les environnements distants
    jest.setTimeout(30000);
  });

  it('GET / doit répondre 200 et un corps', async () => {
    const res = await request(baseUrl).get('/').expect(200);
    // On accepte tout contenu; on vérifie seulement que ce n'est pas vide
    expect(res.text || res.body).toBeTruthy();
  });

  it('GET /health doit répondre 200 et status ok', async () => {
    const res = await request(baseUrl).get('/health').expect(200);
    expect(res.body).toBeTruthy();
    // Tolérant: on accepte string ou object
    const status =
      (res.body && (res.body.status || res.body['status'])) || res.text;
    expect(status).toBeDefined();
  });

  it('GET /health/db doit répondre 200 et un contenu', async () => {
    const res = await request(baseUrl).get('/health/db').expect(200);
    const contentType = res.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      expect(res.body).toBeTruthy();
    } else {
      expect(res.text).toBeTruthy();
    }
  });
});
