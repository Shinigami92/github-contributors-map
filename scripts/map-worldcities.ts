import parse from 'csv-parse/lib/sync';
import { readFileSync, writeFileSync } from 'fs';
import type { WorldCity } from '../src/shared/WorldCity';

const input: string = readFileSync('./scripts/worldcities/worldcities.csv', 'utf8');

interface CsvRecord {
  city: string;
  city_ascii: string;
  lat: string;
  lng: string;
  country: string;
  iso2: string;
  iso3: string;
  admin_name: string;
  capital: string;
  population: string;
  id: string;
}

const records: CsvRecord[] = parse(input, {
  columns: true,
  skip_empty_lines: true
});

const worldcities: WorldCity[] = records.map((record) => ({
  city: record.city,
  lat: Number(record.lat),
  lng: Number(record.lng),
  cityAscii: record.city_ascii,
  country: record.country,
  adminName: record.admin_name || null
}));

writeFileSync('./src/assets/worldcities.json', JSON.stringify(worldcities, null, 2));
