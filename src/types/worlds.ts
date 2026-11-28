export type WorldId =
  | 'universe'
  | 'automotive'
  | 'engineering'
  | 'jet_engine'
  | 'laptop'
  | 'satellite';

export interface WorldConfig {
  id: WorldId;
  name: string;
  shortLabel: string;
  tagline: string;
  description: string;
  accentColor: string;
  secondaryColor: string;
  gridColor: string;
}

export interface InspectablePart {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor?: string;
  material?: string;
  jointType?: string;
  movement?: string;
}
