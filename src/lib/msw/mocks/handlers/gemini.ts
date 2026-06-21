import { http, HttpResponse } from 'msw';
import { getErrorScenario } from '../scenario';
import { GEMINI_TAGS_MOCK } from '../data/gemini';

export const geminiHandlers = [
  http.post('*/api/tag/post/image/analyze', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const scenario = getErrorScenario();
    if (scenario === 'GEMINI_500')
      return HttpResponse.json({ message: 'Error interno al procesar las imágenes' }, { status: 500 });

    return HttpResponse.json(GEMINI_TAGS_MOCK);
  }),
];
