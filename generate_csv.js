import fs from 'fs';

// We'll read the initialData.ts file and extract the exercises array
// Since it's a TS file, we can just use a regex or eval if we strip the export
const initialDataContent = fs.readFileSync('./src/initialData.ts', 'utf-8');
const jsonContent = fs.readFileSync('./src/locales/en.json', 'utf-8');

const locales = JSON.parse(jsonContent);

// Extract the INITIAL_DATA object
const dataString = initialDataContent.replace('export const INITIAL_DATA = ', '').replace(/;$/, '');
// We can use Function to evaluate it safely enough for this context
const INITIAL_DATA = new Function('return ' + dataString)();

const exercises = INITIAL_DATA.exercises;
const objectives = INITIAL_DATA.objectives;

// Create a map for objectives
const objMap = {};
objectives.forEach(o => {
  objMap[o.objective_id] = locales.objectives[o.name_key];
});

// CSV Header
const headers = [
  "exercise_id",
  "name",
  "description",
  "duration_sec",
  "objective",
  "difficulty",
  "intensity",
  "noise_level",
  "sweat_factor",
  "is_clothing_safe",
  "posture_benefit",
  "injury_risk",
  "discreetness",
  "time_to_start",
  "energy_type",
  "tools",
  "video_link",
  "image_url"
];

let csv = headers.join(',') + '\n';

exercises.forEach(ex => {
  const name = `"${locales.exercises[ex.name_key].replace(/"/g, '""')}"`;
  const desc = `"${locales.exercises[ex.description_key].replace(/"/g, '""')}"`;
  const obj = `"${objMap[ex.objective_id]}"`;
  
  const row = [
    ex.exercise_id,
    name,
    desc,
    ex.duration_sec,
    obj,
    `"${ex.difficulty}"`,
    `"${ex.intensity}"`,
    `"${ex.noise_level}"`,
    `"${ex.sweat_factor}"`,
    ex.is_clothing_safe,
    `"${ex.posture_benefit}"`,
    `"${ex.injury_risk}"`,
    `"${ex.discreetness}"`,
    `"${ex.time_to_start}"`,
    `"${ex.energy_type}"`,
    `"${ex.tools}"`,
    `"${ex.video_link}"`,
    `"${ex.image_url}"`
  ];
  
  csv += row.join(',') + '\n';
});

fs.writeFileSync('exercises.csv', csv);
console.log('CSV generated successfully at exercises.csv');
