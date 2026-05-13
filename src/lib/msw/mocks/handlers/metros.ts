import { http, HttpResponse } from 'msw';
import metroData from '../data/metro-stations.json';

export const metroHandlers = [
  http.get('*/api/metro/stations', () => {
    const stations = metroData.lines.flatMap(line =>
      line.stations.map(name => ({ name, line: line.number }))
    );
    return HttpResponse.json(stations);
  }),
];