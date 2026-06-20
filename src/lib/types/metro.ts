export type StationDto = {
  id: string;
  name: string;
};

export type MetroLine = {
  number: string;
  stations: StationDto[];
};
