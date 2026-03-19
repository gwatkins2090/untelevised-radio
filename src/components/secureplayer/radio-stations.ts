export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  genre: string;
  color: string;
  url: string;
  description: string;
  tagline?: string;
}

export const radioStations: RadioStation[] = [
  {
    id: '1',
    name: 'Untelevised Radio',
    frequency: '314.7',
    genre: 'Resistance • Truth • Liberation',
    color: '#0ed729', // phosphor green
    url: 'https://radio.watkinsgeorge.com/listen/test/radio.mp3',
    description: 'Independent community radio broadcasting truth and resistance',
    tagline: 'The revolution will not be televised'
  },
];

export function getStationById(id: string): RadioStation | undefined {
  return radioStations.find(station => station.id === id);
}
