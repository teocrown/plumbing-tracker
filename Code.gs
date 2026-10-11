// =====================================================================
//  CROWN ELITE JOB TRACKER  -  Google Apps Script backend, version 3
//  Paste this whole file over the old code in the "Plumbing Tracker"
//  script, then Deploy > Manage deployments > Edit > New version.
// =====================================================================

const SS_ID = '1dAEtj__71U-vPRzVnx5-sp6fGq7oK6VPlt55_escoRk'; // "Plumbing Job Tracker" sheet
const APP_FOLDER_ID = '10QFPRuXh7VBXJhlTPbKVSWAu9VauNvp1';     // Drive folder "App"
const TZ = 'America/Chicago';
const API_VERSION = 3;
const SETUP_HASH = 'd67a75516d151a41d428029a50b13eb13f182acd38befb693977e01b9e86be89';
const MIGRATION_KEY = 'houseList_2026_10_07';
const MIGRATION2_KEY = 'builders_2026_10_11';
const HOUSTON_LINK = 'https://www.pdinet.pd.houstontx.gov/cohilms/webs/Inspection_Lookup.asp';

const PHASES = ['Ground', 'Rough-in', 'Top out', 'Trim', 'Final inspection', 'Service/Warranty'];
const INSP_KEYS = ['ground', 'sewer', 'gas', 'roughIn', 'showPan', 'tempGas', 'final'];
const INSP_LABELS = { ground: 'Ground', sewer: 'Sewer', gas: 'Gas', roughIn: 'Rough In', showPan: 'Shower Pan', tempGas: 'Temp Gas', final: 'Final' };
const DOC_KEYS = ['foundation', 'blueprint', 'materials', 'other'];

const STARTER_CHECKLIST = [
  'Underground installed',
  'Rough in installed',
  'Tubs and shower pans set',
  'Gas line installed',
  'Water heater installed',
  'Toilets set',
  'Sinks and faucets installed',
  'Tub and shower trim installed'
];
// Starter items that are already proven done by a passed inspection.
const STARTER_PROOF = {
  'Underground installed': ['ground', 'sewer'],
  'Rough in installed': ['roughIn'],
  'Tubs and shower pans set': ['showPan'],
  'Gas line installed': ['gas', 'tempGas']
};

const TEAM = [
  ['u_brenda', 'Brenda', 'owner'], ['u_teodoro', 'Teodoro', 'owner'],
  ['u_luis', 'Luis', 'employee'], ['u_daniel', 'Daniel', 'employee'],
  ['u_danny', 'Danny', 'employee'], ['u_miguel', 'Miguel', 'employee']
];

// Active houses from the "Crown Elite 2026" list sent October 7, 2026.
const HOUSES = [
  {"permit":"22035462","address":"6413 LEOPOLD STAR LN","city":"HOU TX","zip":"77048","subdivision":"","inspections":{"ground":"2023-05-02","sewer":"2023-05-02","gas":"","roughIn":"2026-05-19","showPan":"2026-08-11","tempGas":"","final":""}},
  {"permit":"24058905","address":"6523 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-23","sewer":"2025-06-23","gas":"2026-05-28","roughIn":"2026-07-09","showPan":"2026-09-03","tempGas":"","final":""}},
  {"permit":"24058906","address":"6525 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-23","sewer":"2025-06-23","gas":"2026-05-28","roughIn":"2026-07-09","showPan":"2026-09-03","tempGas":"","final":""}},
  {"permit":"24056473","address":"6527 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-23","sewer":"2025-06-23","gas":"2026-05-28","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24056474","address":"6529 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-23","sewer":"2025-06-23","gas":"2026-05-28","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24056470","address":"6531 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-05-28","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24056469","address":"6533 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-08-19","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24056471","address":"6535 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-08-19","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24056472","address":"6537 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-08-18","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24061159","address":"6539 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-08-07","roughIn":"2026-07-16","showPan":"2026-09-03","tempGas":"","final":""}},
  {"permit":"24061160","address":"6541 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-06-25","sewer":"2025-06-25","gas":"2026-08-07","roughIn":"2026-07-16","showPan":"2026-09-03","tempGas":"","final":""}},
  {"permit":"24064690","address":"6551 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-07-01","sewer":"2025-07-01","gas":"2026-08-03","roughIn":"2026-07-01","showPan":"2026-08-21","tempGas":"","final":""}},
  {"permit":"24064691","address":"6553 RENA ST","city":"HOU TX","zip":"77092","subdivision":"","inspections":{"ground":"2025-07-01","sewer":"2025-07-01","gas":"2026-08-03","roughIn":"2026-07-01","showPan":"2026-08-18","tempGas":"","final":""}},
  {"permit":"26011132","address":"2803 LAKE KOLBE LN","city":"HOU TX","zip":"77080","subdivision":"","inspections":{"ground":"2026-04-17","sewer":"2026-04-17","gas":"2026-09-03","roughIn":"2026-06-12","showPan":"2026-08-06","tempGas":"2026-09-03","final":""}},
  {"permit":"26040012","address":"2739 LAKE KOLBE","city":"HOU TX","zip":"77080","subdivision":"","inspections":{"ground":"2026-07-21","sewer":"2026-07-21","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"24079315","address":"3307 GREEN DAISY","city":"HOU TX","zip":"77008","subdivision":"","inspections":{"ground":"2026-05-18","sewer":"2026-05-18","gas":"2026-09-01","roughIn":"2026-06-23","showPan":"2026-08-18","tempGas":"2026-09-01","final":""}},
  {"permit":"26036149","address":"3311 ROBLYNN","city":"HOU TX","zip":"77008","subdivision":"","inspections":{"ground":"2026-06-25","sewer":"2026-06-25","gas":"","roughIn":"2026-08-19","showPan":"","tempGas":"","final":""}},
  {"permit":"26007607","address":"1026 LAMELIA","city":"HOU TX","zip":"77008","subdivision":"","inspections":{"ground":"2026-06-30","sewer":"2026-06-30","gas":"","roughIn":"2026-08-28","showPan":"","tempGas":"","final":""}},
  {"permit":"26009463","address":"1028 LAMELIA","city":"HOU TX","zip":"77008","subdivision":"","inspections":{"ground":"2026-06-30","sewer":"2026-06-30","gas":"","roughIn":"2026-09-14","showPan":"","tempGas":"","final":""}},
  {"permit":"25014415","address":"11067 CHATTERTON","city":"HOU TX","zip":"77043","subdivision":"","inspections":{"ground":"2026-08-13","sewer":"2026-08-13","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"4300 VERON","city":"BELLAIRE","zip":"77401","subdivision":"","inspections":{"ground":"2026-08-21","sewer":"2026-08-21","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"4300 DARSEY","city":"BELLAIRE","zip":"77401","subdivision":"","inspections":{"ground":"2026-07-06","sewer":"2026-07-06","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"4803 PINE","city":"BELLAIRE","zip":"77401","subdivision":"","inspections":{"ground":"2025-12-09","sewer":"2026-03-06","gas":"","roughIn":"2026-08-21","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"5811 LAKE ST","city":"HOU TX","zip":"77005","subdivision":"West Univ","inspections":{"ground":"2026-07-25","sewer":"2026-07-25","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25106682","address":"7207 AVENUE J A","city":"HOU TX","zip":"77011","subdivision":"","inspections":{"ground":"2026-02-03","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25106683","address":"7207 AVENUE J B","city":"HOU TX","zip":"77011","subdivision":"","inspections":{"ground":"2026-02-03","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25052416","address":"2305 MANSFIELD","city":"HOU TX","zip":"77091","subdivision":"","inspections":{"ground":"2026-08-27","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25108312","address":"5303 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-13","sewer":"2026-02-13","gas":"","roughIn":"2026-10-07","showPan":"","tempGas":"","final":""}},
  {"permit":"25108317","address":"5305 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-13","sewer":"2026-02-13","gas":"","roughIn":"2026-09-30","showPan":"","tempGas":"","final":""}},
  {"permit":"25108321","address":"5307 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-18","sewer":"2026-02-18","gas":"","roughIn":"2026-09-29","showPan":"","tempGas":"","final":""}},
  {"permit":"25108322","address":"5309 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-13","sewer":"2026-02-13","gas":"","roughIn":"2026-10-05","showPan":"","tempGas":"","final":""}},
  {"permit":"25108313","address":"5311 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-18","sewer":"2026-02-18","gas":"","roughIn":"2026-10-07","showPan":"","tempGas":"","final":""}},
  {"permit":"25108319","address":"5312 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-18","sewer":"2026-02-18","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25108327","address":"5314 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-18","sewer":"2026-02-18","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25108314","address":"5316 JESSELTON LN","city":"HOU TX","zip":"77019","subdivision":"","inspections":{"ground":"2026-02-18","sewer":"2026-02-18","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"22089062","address":"4712 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"2026-08-31","showPan":"","tempGas":"","final":""}},
  {"permit":"22089069","address":"4713 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"22089063","address":"4714 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"22089068","address":"4715 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"22089064","address":"4716 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"2026-08-31","showPan":"","tempGas":"","final":""}},
  {"permit":"22089067","address":"4717 THORNTON VILLAS","city":"HOU TX","zip":"77018","subdivision":"","inspections":{"ground":"2026-07-17","sewer":"2026-07-17","gas":"","roughIn":"2026-08-31","showPan":"2026-10-06","tempGas":"","final":""}},
  {"permit":"25023108","address":"1252 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-09-18","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25023109","address":"1254 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-09-18","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25023111","address":"1256 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-06-29","sewer":"2026-09-03","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25023112","address":"1258 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-06-29","sewer":"2026-09-03","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25023115","address":"1260 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-07-31","sewer":"","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25023116","address":"1262 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-07-31","sewer":"2026-09-09","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25024466","address":"1264 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-08-31","sewer":"2026-09-09","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25024467","address":"1266 CANGELOSI","city":"MISSOURI CITY","zip":"77489","subdivision":"","inspections":{"ground":"2026-08-31","sewer":"2026-09-09","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"23091482","address":"5815 BROOKFIELD","city":"HOU TX","zip":"77085","subdivision":"","inspections":{"ground":"2026-08-20","sewer":"2026-08-21","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"25033298","address":"5538 INDIGO ST P1","city":"HOU TX","zip":"","subdivision":"","inspections":{"ground":"2026-05-29","sewer":"2026-10-06","gas":"","roughIn":"2026-06-02","showPan":"2026-08-12","tempGas":"","final":""}},
  {"permit":"26022264","address":"2005 HARVARD","city":"HOU TX","zip":"","subdivision":"","inspections":{"ground":"2026-07-09","sewer":"2026-07-09","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"7 RAYDON","city":"HOU TX","zip":"77024","subdivision":"","inspections":{"ground":"2025-12-02","sewer":"2025-12-01","gas":"","roughIn":"","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"102 STADIUM (TRUMAN F)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"106 STADIUM (TRUMAN)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"110 STADIUM (MONROE)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"114 STADIUM (BUCHANAN)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"730 IMPERIAL (MONROE F)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}},
  {"permit":"","address":"734 IMPERIAL (BUCHANAN F)","city":"SUGAR LAND","zip":"77498","subdivision":"","inspections":{"ground":"2026-04-16","sewer":"","gas":"","roughIn":"2026-08-26","showPan":"","tempGas":"","final":""}}
];

// The house list sent October 11, 2026, in the order Brenda keeps it:
// [address, builder, neighborhood, [ground, sewer, gas, roughIn, showPan, tempGas, final], [inspections marked failed in red]]
const LIST_1011 = [
  ["6413 LEOPOLD STAR LN", "American Good", "", ["2023-05-02", "2023-05-02", "", "2026-05-19", "2026-08-11", "", ""], []],
  ["6523 RENA ST", "City Choice", "", ["2025-06-23", "2025-06-23", "2026-05-28", "2026-07-09", "2026-09-03", "", ""], []],
  ["6525 RENA ST", "City Choice", "", ["2025-06-23", "2025-06-23", "2026-05-28", "2026-07-09", "2026-09-03", "", ""], []],
  ["6527 RENA ST", "City Choice", "", ["2025-06-23", "2025-06-23", "2026-05-28", "", "", "", ""], []],
  ["6529 RENA ST", "City Choice", "", ["2025-06-23", "2025-06-23", "2026-05-28", "", "", "", ""], []],
  ["6531 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-05-28", "", "", "", ""], ["gas"]],
  ["6533 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-08-19", "", "", "", ""], ["gas"]],
  ["6535 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-08-19", "", "", "", ""], ["gas"]],
  ["6537 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-08-18", "", "", "", ""], ["gas"]],
  ["6539 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-08-07", "2026-07-16", "2026-09-03", "", ""], []],
  ["6541 RENA ST", "City Choice", "", ["2025-06-25", "2025-06-25", "2026-08-07", "2026-07-16", "2026-09-03", "", ""], []],
  ["6551 RENA ST", "City Choice", "", ["2025-07-01", "2025-07-01", "2026-08-03", "2026-07-01", "2026-08-21", "", ""], []],
  ["6553 RENA ST", "City Choice", "", ["2025-07-01", "2025-07-01", "2026-08-03", "2026-07-01", "2026-08-18", "", ""], []],
  ["2803 LAKE KOLBE LN", "Intown", "Park Kolbe", ["2026-04-17", "2026-04-17", "2026-09-03", "2026-06-12", "2026-08-06", "2026-09-03", ""], []],
  ["2739 LAKE KOLBE", "Intown", "Park Kolbe", ["2026-07-21", "2026-07-21", "", "", "", "", ""], []],
  ["3307 GREEN DAISY", "Intown", "Timbergreen", ["2026-05-18", "2026-05-18", "2026-09-01", "2026-06-23", "2026-08-18", "2026-09-01", ""], []],
  ["3311 ROBLYNN", "Intown", "Timbergreen", ["2026-06-25", "2026-06-25", "", "2026-08-19", "", "", ""], []],
  ["1026 LAMELIA", "Intown", "Timbergreen", ["2026-06-30", "2026-06-30", "", "2026-08-28", "", "", ""], []],
  ["1028 LAMELIA", "Intown", "Timbergreen", ["2026-06-30", "2026-06-30", "", "2026-09-14", "", "", ""], []],
  ["11067 CHATTERTON", "", "Upland", ["2026-08-13", "2026-08-13", "", "", "", "", ""], []],
  ["4300 VERON", "", "City of Bellaire", ["2026-08-21", "2026-08-21", "", "", "", "", ""], []],
  ["4300 DARSEY", "", "City of Bellaire", ["2026-07-06", "2026-07-06", "", "", "", "", ""], []],
  ["4803 PINE", "", "City of Bellaire", ["2026-12-09", "2026-03-06", "", "2026-08-21", "", "", ""], []],
  ["5811 LAKE ST", "", "West University", ["2026-07-25", "2026-07-25", "", "", "", "", ""], []],
  ["7207 AVENUE J A", "T&B", "", ["2026-02-03", "", "", "", "", "", ""], []],
  ["7207 AVENUE J B", "T&B", "", ["2026-02-03", "", "", "", "", "", ""], []],
  ["2305 MANSFIELD", "T&B", "", ["2026-08-27", "", "", "", "", "", ""], []],
  ["5303 JESSELTON LN", "", "Jesselton", ["2026-02-13", "2026-02-13", "", "2026-10-07", "", "", ""], []],
  ["5305 JESSELTON LN", "", "Jesselton", ["2026-02-13", "2026-02-13", "", "2026-09-30", "", "", ""], []],
  ["5307 JESSELTON LN", "", "Jesselton", ["2026-02-18", "2026-02-18", "", "2026-09-29", "", "", ""], []],
  ["5309 JESSELTON LN", "", "Jesselton", ["2026-02-13", "2026-02-13", "", "2026-10-05", "", "", ""], []],
  ["5311 JESSELTON LN", "", "Jesselton", ["2026-02-18", "2026-02-18", "", "2026-10-07", "", "", ""], []],
  ["5312 JESSELTON LN", "", "Jesselton", ["2026-02-18", "2026-02-18", "", "", "", "", ""], []],
  ["5314 JESSELTON LN", "", "Jesselton", ["2026-02-18", "2026-02-18", "", "", "", "", ""], []],
  ["5316 JESSELTON LN", "", "Jesselton", ["2026-02-18", "2026-02-18", "", "", "", "", ""], []],
  ["4712 THORNTON VILLAS", "", "Jesselton", ["2026-07-17", "2026-07-17", "", "2026-08-31", "2026-10-06", "", ""], []],
  ["4713 THORNTON VILLAS", "", "Jesselton", ["2026-07-20", "2026-07-20", "", "2026-09-08", "2026-10-07", "", ""], []],
  ["4714 THORNTON VILLAS", "", "Jesselton", ["2026-07-17", "2026-07-17", "", "2026-09-04", "2026-10-05", "", ""], []],
  ["4715 THORNTON VILLAS", "", "Jesselton", ["2026-07-20", "2026-07-20", "", "2026-09-04", "2026-10-07", "", ""], []],
  ["4716 THORNTON VILLAS", "", "Jesselton", ["2026-07-21", "2026-07-21", "", "2026-08-31", "2026-10-05", "", ""], []],
  ["4717 THORNTON VILLAS", "", "Jesselton", ["2026-07-21", "2026-07-21", "", "2026-09-02", "2026-10-07", "", ""], []],
  ["1252 CANGELOSI", "Ocean Global", "", ["2026-09-18", "", "", "", "", "", ""], []],
  ["1254 CANGELOSI", "Ocean Global", "", ["2026-09-18", "", "", "", "", "", ""], []],
  ["1256 CANGELOSI", "Ocean Global", "", ["2026-06-29", "", "", "", "", "", ""], []],
  ["1258 CANGELOSI", "Ocean Global", "", ["2026-06-29", "2026-09-03", "", "", "", "", ""], ["sewer"]],
  ["1260 CANGELOSI", "Ocean Global", "", ["2026-07-31", "", "", "", "", "", ""], []],
  ["1262 CANGELOSI", "Ocean Global", "", ["2026-07-31", "2026-09-09", "", "", "", "", ""], ["sewer"]],
  ["1264 CANGELOSI", "Ocean Global", "", ["2026-08-31", "2026-09-09", "", "", "", "", ""], []],
  ["1266 CANGELOSI", "Ocean Global", "", ["2026-08-31", "2026-09-09", "", "", "", "", ""], []],
  ["5815 BROOKFIELD", "Jorge Aguirre", "", ["2026-08-20", "2026-08-21", "", "2026-10-08", "", "", ""], []],
  ["5538 INDIGO ST P1", "Oracle", "", ["2026-05-29", "2026-10-06", "", "2026-06-02", "2026-08-12", "", ""], []],
  ["2005 HARVARD", "Key Investment", "", ["2026-07-09", "2026-07-09", "", "", "", "", ""], ["sewer"]],
  ["7 RAYDON", "Key Investment", "", ["2025-12-02", "2025-12-01", "", "", "", "", ""], []],
  ["102 STADIUM (TRUMAN F)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []],
  ["106 STADIUM (TRUMAN)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []],
  ["110 STADIUM (MONROE)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []],
  ["114 STADIUM (BUCHANAN)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []],
  ["730 IMPERIAL (MONROE F)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []],
  ["734 IMPERIAL (BUCHANAN F)", "Gracepoint", "", ["2026-04-16", "", "", "2026-08-26", "", "", ""], []]
];

// Houses that were active in the old tracker and are now finished.
const MOVE_TO_COMPLETE = ['26707 ALDERBROOK AVE', '6402 PREGONERO LN', '5306 JESSELTON LN', '3 N SAINT CHARLES ST # C',
  '2259 FM 1618 (OSBORN)', '4210 WICKHAM', '2629 LAKE KOLBE LN', '6254 KANSAS ST'];

const SHEETS = {
  Jobs: ['id', 'data', 'updated'],
  Users: ['id', 'name', 'role', 'active', 'pinHash', 'salt', 'fails', 'lockUntil', 'setPin'],
  Sessions: ['tokenHash', 'userId', 'created'],
  Tasks: ['id', 'assigneeId', 'date', 'text', 'jobId', 'done', 'doneBy', 'doneByName', 'doneDate', 'doneTs', 'createdBy', 'createdTs', 'time'],
  Activity: ['id', 'ts', 'date', 'userId', 'userName', 'jobId', 'address', 'kind', 'detail', 'ref'],
  Photos: ['id', 'jobId', 'fileId', 'date', 'ts', 'userId', 'userName', 'phase', 'note', 'thumb'],
  Contacts: ['id', 'name', 'builder', 'neighborhood', 'phone', 'notes', 'updated'],
  Settings: ['key', 'value']
};
const USER_HEADERS = ['id', 'name', 'role', 'active (1 = on)', 'pinHash (do not edit)', 'salt (do not edit)', 'fails', 'lockUntil', 'SET PIN: type 4 to 8 numbers here'];

// ---------------------------------------------------------------- entry points

function doGet(e) {
  // The old version of the app used GET. Tell it to update instead of loading stale data.
  return json_({ ok: false, success: false, error: 'update', message: 'Please refresh to get the new version of the Job Tracker.' });
}

function doPost(e) {
  let req;
  try { req = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, success: false, error: 'bad_request', message: 'Bad request.' }); }
  // A phone that still has the last version of the app open keeps working until it refreshes.
  if (!req || (req.v !== API_VERSION && req.v !== 2)) {
    return json_({ ok: false, success: false, error: 'update', message: 'Please refresh to get the new version of the Job Tracker.' });
  }
  const lock = LockService.getScriptLock();
  try { lock.waitLock(25000); } catch (err) { return json_({ ok: false, error: 'busy', message: 'The tracker is busy. Try again in a moment.' }); }
  try {
    const db = open_();
    return json_(route_(db, req));
  } catch (err) {
    if (err && err.isFail) return json_({ ok: false, error: err.code, message: err.message });
    return json_({ ok: false, error: 'server', message: 'Something went wrong: ' + String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (err) { /* ignore */ }
  }
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function fail_(code, message) { const e = new Error(message); e.isFail = true; e.code = code; throw e; }

// ---------------------------------------------------------------- storage

function Table_(db, name) {
  this.db = db; this.name = name; this.cols = SHEETS[name];
  this.readCols = name === 'Photos' ? this.cols.length - 1 : this.cols.length; // photo thumbnails are read only when asked for
  this.sheet = db.ss.getSheetByName(name);
  if (!this.sheet) {
    this.sheet = db.ss.insertSheet(name);
    this.sheet.getRange(1, 1, this.sheet.getMaxRows(), this.cols.length).setNumberFormat('@');
    this.sheet.getRange(1, 1, 1, this.cols.length).setValues([name === 'Users' ? USER_HEADERS : this.cols]);
    this.sheet.setFrozenRows(1);
  }
  this._rows = null;
}
Object.defineProperty(Table_.prototype, 'rows', {
  get: function () {
    if (this._rows) return this._rows;
    const last = this.sheet.getLastRow();
    const rows = [];
    if (last > 1) {
      const v = this.sheet.getRange(2, 1, last - 1, this.readCols).getValues();
      for (let i = 0; i < v.length; i++) {
        if (v[i].join('') === '') continue;
        const o = { _r: i + 2 };
        for (let j = 0; j < this.readCols; j++) o[this.cols[j]] = str_(this.db, v[i][j]);
        rows.push(o);
      }
    }
    this._rows = rows;
    return rows;
  }
});
Table_.prototype.vals_ = function (o) { return this.cols.map(function (c) { return o[c] == null ? '' : String(o[c]); }); };
Table_.prototype.add = function (o) {
  const r = this.sheet.getLastRow() + 1;
  if (r > this.sheet.getMaxRows()) this.sheet.insertRowsAfter(this.sheet.getMaxRows(), 500);
  this.sheet.getRange(r, 1, 1, this.cols.length).setNumberFormat('@').setValues([this.vals_(o)]);
  o._r = r;
  if (this._rows) this._rows.push(o);
  return o;
};
Table_.prototype.save = function (o) {
  const vals = this.vals_(o).slice(0, this.readCols);
  this.sheet.getRange(o._r, 1, 1, this.readCols).setNumberFormat('@').setValues([vals]);
};
Table_.prototype.remove = function (o) {
  this.sheet.deleteRow(o._r);
  const gone = o._r;
  if (this._rows) {
    this._rows = this._rows.filter(function (x) { return x !== o; });
    this._rows.forEach(function (x) { if (x._r > gone) x._r--; });
  }
};

function str_(db, v) {
  if (v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    const tz = db.tz;
    const t = Utilities.formatDate(v, tz, 'HH:mm:ss');
    return t === '00:00:00' ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : v.toISOString();
  }
  return String(v);
}

function open_() {
  const ss = SpreadsheetApp.openById(SS_ID);
  const db = { ss: ss, tz: ss.getSpreadsheetTimeZone() || TZ, tables: {}, _jobs: null, _settings: null };
  db.t = function (name) { if (!db.tables[name]) db.tables[name] = new Table_(db, name); return db.tables[name]; };
  if (setting_(db, MIGRATION_KEY) !== 'done') migrate_(db);
  if (setting_(db, MIGRATION2_KEY) !== 'done') migrate2_(db);
  applySetPins_(db);
  return db;
}

function settings_(db) {
  if (!db._settings) { db._settings = {}; db.t('Settings').rows.forEach(function (r) { db._settings[r.key] = r; }); }
  return db._settings;
}
function setting_(db, key) { const r = settings_(db)[key]; return r ? r.value : ''; }
function setSetting_(db, key, value) {
  const all = settings_(db);
  if (all[key]) { all[key].value = String(value); db.t('Settings').save(all[key]); }
  else all[key] = db.t('Settings').add({ key: key, value: String(value) });
}
function jsonSetting_(db, key, fallback) { try { const v = JSON.parse(setting_(db, key)); return v == null ? fallback : v; } catch (e) { return fallback; } }

// ---------------------------------------------------------------- small helpers

function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function nowIso_() { return new Date().toISOString(); }
function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function dateOr_(s, fallback) { return isDate_(s) ? String(s) : fallback; }
function addDays_(iso, n) { const p = iso.split('-'); const d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)); return d.toISOString().slice(0, 10); }
function id_(prefix) { return prefix + Utilities.getUuid().replace(/-/g, '').slice(0, 14); }
function cleanId_(s, prefix) { s = String(s || ''); return /^[A-Za-z0-9_]{6,40}$/.test(s) ? s : id_(prefix); }
function text_(s, max) { return String(s == null ? '' : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max || 300); }
function url_(s) { s = text_(s, 600); if (!s) return ''; if (!/^https?:\/\//i.test(s)) fail_('bad_link', 'Links must start with http:// or https://'); return s; }
function addrKey_(s) { return String(s || '').toUpperCase().replace(/\s+/g, ' ').trim(); }
function time_(s) { s = String(s || ''); return /^([01]\d|2[0-3]):[0-5]\d$/.test(s) ? s : ''; }
function groupKey_(builder, neighborhood) { return addrKey_(builder) + '|' + addrKey_(neighborhood); }
function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}
function isOwner_(u) { return u.role === 'owner'; }
function needOwner_(u) { if (!isOwner_(u)) fail_('forbidden', 'Only Brenda or Teodoro can do that.'); }

// ---------------------------------------------------------------- users, PINs, sessions

function pub_(u) { return { id: u.id, name: u.name, role: u.role }; }
function validPin_(p) { return /^\d{4,8}$/.test(String(p || '')); }
function setPin_(db, u, pin) {
  u.salt = Utilities.getUuid();
  u.pinHash = hash_(u.salt + ':' + pin);
  u.fails = ''; u.lockUntil = ''; u.setPin = '';
  db.t('Users').save(u);
  endSessions_(db, u.id);
}
function endSessions_(db, userId) {
  const t = db.t('Sessions');
  t.rows.filter(function (s) { return s.userId === userId; }).sort(function (a, b) { return b._r - a._r; }).forEach(function (s) { t.remove(s); });
}
// Anyone who can edit the Google Sheet can set or reset a PIN by typing it in the last column of the Users tab.
function applySetPins_(db) {
  db.t('Users').rows.forEach(function (u) {
    const p = String(u.setPin || '').trim();
    if (!p || p.indexOf('Use 4') === 0) return;
    if (validPin_(p)) setPin_(db, u, p);
    else { u.setPin = 'Use 4 to 8 numbers'; db.t('Users').save(u); }
  });
}
function setupOpen_(db) {
  if (setting_(db, 'setupOff') === '1') return false;
  return db.t('Users').rows.some(function (u) { return u.role === 'owner' && u.active === '1' && !u.pinHash; });
}
function publicUsers_(db) {
  return db.t('Users').rows.filter(function (u) { return u.active === '1'; })
    .map(function (u) { return { id: u.id, name: u.name, role: u.role, hasPin: !!u.pinHash }; });
}
function newSession_(db, u) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  db.t('Sessions').add({ tokenHash: hash_(token), userId: u.id, created: nowIso_() });
  return token;
}
function login_(db, req) {
  const users = db.t('Users');
  const u = users.rows.filter(function (x) { return x.id === String(req.userId || '') && x.active === '1'; })[0];
  if (!u) fail_('login', 'That name was not found.');
  const now = Date.now();
  if (Number(u.lockUntil || 0) > now) fail_('locked', 'Too many wrong tries. Wait ' + Math.ceil((Number(u.lockUntil) - now) / 60000) + ' minutes and try again.');
  if (!u.pinHash) fail_('nopin', 'No PIN has been set for ' + u.name + ' yet.');
  if (hash_(u.salt + ':' + String(req.pin || '')) !== u.pinHash) {
    u.fails = String(Number(u.fails || 0) + 1);
    if (Number(u.fails) >= 5) { u.lockUntil = String(now + 15 * 60000); u.fails = '0'; }
    users.save(u);
    return { ok: false, error: 'login', message: 'Wrong PIN.' };
  }
  if (u.fails || u.lockUntil) { u.fails = ''; u.lockUntil = ''; users.save(u); }
  return { ok: true, token: newSession_(db, u), me: pub_(u) };
}
// First time only: an owner picks a PIN using the setup code.
function setup_(db, req) {
  if (!setupOpen_(db)) fail_('setup_closed', 'Setup is already finished. Ask an owner to set your PIN.');
  const now = Date.now();
  if (Number(setting_(db, 'setupLockUntil') || 0) > now) fail_('locked', 'Too many wrong tries. Wait 15 minutes and try again.');
  const u = db.t('Users').rows.filter(function (x) { return x.id === String(req.userId || '') && x.active === '1' && x.role === 'owner' && !x.pinHash; })[0];
  if (!u) fail_('setup', 'Setup is only for an owner who has no PIN yet.');
  if (!validPin_(req.pin)) fail_('pin', 'A PIN is 4 to 8 numbers.');
  const code = String(req.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (hash_('ce-setup:' + code) !== SETUP_HASH) {
    const n = Number(setting_(db, 'setupFails') || 0) + 1;
    if (n >= 5) { setSetting_(db, 'setupLockUntil', now + 15 * 60000); setSetting_(db, 'setupFails', 0); }
    else setSetting_(db, 'setupFails', n);
    return { ok: false, error: 'setup', message: 'That setup code is not right.' };
  }
  setPin_(db, u, String(req.pin));
  return { ok: true, token: newSession_(db, u), me: pub_(u) };
}
function auth_(db, token) {
  const h = hash_(String(token || ''));
  const s = db.t('Sessions').rows.filter(function (x) { return x.tokenHash === h; })[0];
  if (!s) fail_('auth', 'Please enter your PIN again.');
  const u = db.t('Users').rows.filter(function (x) { return x.id === s.userId && x.active === '1'; })[0];
  if (!u) fail_('auth', 'This login has been turned off.');
  return u;
}
function findUser_(db, id) { return db.t('Users').rows.filter(function (x) { return x.id === id; })[0]; }
function ownersOut_(db) {
  return db.t('Users').rows.map(function (u) { return { id: u.id, name: u.name, role: u.role, active: u.active === '1', hasPin: !!u.pinHash }; });
}
function userAdd_(db, me, req) {
  needOwner_(me);
  const name = text_(req.name, 40);
  if (!name) fail_('name', 'Enter a name.');
  if (db.t('Users').rows.some(function (u) { return u.name.toLowerCase() === name.toLowerCase(); })) fail_('name', 'There is already someone named ' + name + '.');
  const u = db.t('Users').add({ id: id_('u_'), name: name, role: req.role === 'owner' ? 'owner' : 'employee', active: '1' });
  if (req.pin) { if (!validPin_(req.pin)) fail_('pin', 'A PIN is 4 to 8 numbers.'); setPin_(db, u, String(req.pin)); }
  return { ok: true, users: ownersOut_(db) };
}
function userEdit_(db, me, req) {
  needOwner_(me);
  const u = findUser_(db, String(req.userId || ''));
  if (!u) fail_('user', 'That person was not found.');
  if (req.name != null) { const n = text_(req.name, 40); if (n) u.name = n; }
  if (req.active != null) {
    if (!req.active && u.id === me.id) fail_('user', 'You cannot turn off your own login.');
    u.active = req.active ? '1' : '0';
    if (!req.active) endSessions_(db, u.id);
  }
  db.t('Users').save(u);
  if (req.pin != null) {
    if (!validPin_(req.pin)) fail_('pin', 'A PIN is 4 to 8 numbers.');
    const keep = u.id === me.id ? String(req.token) : null;
    setPin_(db, u, String(req.pin));
    if (keep) db.t('Sessions').add({ tokenHash: hash_(keep), userId: u.id, created: nowIso_() });
  }
  return { ok: true, users: ownersOut_(db) };
}

// ---------------------------------------------------------------- jobs (houses)

function normalizeJob_(j) {
  j.id = String(j.id || id_('j_'));
  j.address = String(j.address || '');
  ['lot', 'subdivision', 'builder', 'contactId', 'notes', 'permit', 'city', 'zip', 'inspUrl', 'pin', 'completedDate'].forEach(function (k) { j[k] = j[k] == null ? '' : String(j[k]); });
  j.status = j.status || 'active';
  if (!Array.isArray(j.phases) || j.phases.length !== PHASES.length) j.phases = PHASES.map(function (p) { return { name: p, status: 'pending', date: '' }; });
  if (!Array.isArray(j.log)) j.log = [];
  j.log.forEach(function (l) { if (!l.id) l.id = id_('l_'); });
  if (!Array.isArray(j.fixtures)) j.fixtures = [];
  j.fixtures.forEach(function (f) { if (!f.id) f.id = id_('f_'); });
  if (!j.docs || typeof j.docs !== 'object') j.docs = {};
  if (j.blueprint && !j.docs.blueprint) j.docs.blueprint = j.blueprint;
  if (!j.inspections || typeof j.inspections !== 'object') j.inspections = {};
  if (!Array.isArray(j.inspLog)) j.inspLog = [];
  INSP_KEYS.forEach(function (k) {
    const d = isDate_(j.inspections[k]) ? j.inspections[k] : '';
    // Dates recorded before pass/fail tracking count as passed inspections.
    if (d && !j.inspLog.some(function (e) { return e.key === k; })) j.inspLog.push({ id: 'old_' + k, key: k, result: 'pass', date: d, note: '', by: '', byName: '', ts: '' });
    j.inspections[k] = d;
  });
  if (!Array.isArray(j.checklist)) j.checklist = [];
  if (!Array.isArray(j.inspReqs)) j.inspReqs = [];   // ready for inspection, set, waiting on the result
  if (!Array.isArray(j.tickets)) j.tickets = [];     // service and warranty tickets
  return j;
}
function latestInsp_(job, key) {
  let best = null, bi = -1;
  job.inspLog.forEach(function (e, i) {
    if (e.key !== key) return;
    if (!best || e.date > best.date || (e.date === best.date && i > bi)) { best = e; bi = i; }
  });
  return best;
}
function syncInspections_(job) {
  INSP_KEYS.forEach(function (k) { const l = latestInsp_(job, k); job.inspections[k] = l && l.result === 'pass' ? l.date : ''; });
}
function jobs_(db) {
  if (!db._jobs) {
    db._jobs = [];
    db.t('Jobs').rows.forEach(function (r) {
      let j = null;
      try { j = JSON.parse(r.data); } catch (e) { j = null; }
      if (!j || typeof j !== 'object') return;
      if (!j.id) j.id = r.id;
      j = normalizeJob_(j);
      Object.defineProperty(j, '_row', { value: r, enumerable: false, writable: true });
      db._jobs.push(j);
    });
  }
  return db._jobs;
}
function findJob_(db, id) {
  const j = jobs_(db).filter(function (x) { return x.id === String(id || ''); })[0];
  if (!j) fail_('nojob', 'That house was not found. Tap Sync and try again.');
  return j;
}
function saveJob_(db, job) {
  const s = JSON.stringify(job);
  if (s.length > 48000) fail_('toobig', 'This house has too much history saved on it. Let Brenda know.');
  const now = nowIso_();
  if (job._row) { job._row.data = s; job._row.updated = now; db.t('Jobs').save(job._row); }
  else {
    const row = db.t('Jobs').add({ id: job.id, data: s, updated: now });
    Object.defineProperty(job, '_row', { value: row, enumerable: false, writable: true });
    jobs_(db).push(job);
  }
}
// What a person is allowed to see of a house. Other people's assignments and real entry times stay with the owners.
function outJob_(job, me) {
  const j = JSON.parse(JSON.stringify(job));
  delete j.blueprint;
  if (isOwner_(me)) return j;
  j.checklist.forEach(function (it) {
    if (it.assignee && it.assignee !== me.id) { it.assignee = ''; it.due = ''; it.time = ''; }
    (it.entries || []).forEach(function (e) { delete e.ts; });
  });
  j.tickets.forEach(function (t) {
    if (t.assignee && t.assignee !== me.id) { t.assignee = ''; t.date = ''; t.time = ''; }
    delete t.createdTs; delete t.doneTs;
  });
  j.inspReqs.forEach(function (r) { delete r.ts; delete r.setTs; });
  j.log.forEach(function (l) { delete l.ts; });
  j.phases.forEach(function (p) { delete p.ts; });
  j.fixtures.forEach(function (f) { delete f.ts; });
  j.inspLog.forEach(function (e) { delete e.ts; });
  delete j.photoFolderId;
  return j;
}
function starterChecklist_(db, job, creditInspections) {
  const tpl = jsonSetting_(db, 'checklistTemplate', STARTER_CHECKLIST);
  return tpl.map(function (t) {
    const it = { id: id_('c_'), text: text_(t, 120), qty: 1, assignee: '', due: '', entries: [] };
    const proof = STARTER_PROOF[it.text];
    if (creditInspections && proof) {
      const dates = proof.map(function (k) { return job.inspections[k]; }).filter(Boolean).sort();
      if (dates.length) it.entries.push({ id: id_('e_'), by: '', byName: 'Inspection passed', date: dates[0], n: 1, ts: '', prior: true });
    }
    return it;
  }).filter(function (it) { return it.text; });
}
function itemDone_(it) { return (it.entries || []).reduce(function (s, e) { return s + (Number(e.n) || 0); }, 0); }

// ---------------------------------------------------------------- activity (the record behind the reports)

function act_(db, who, job, kind, detail, ref, date) {
  db.t('Activity').add({
    id: id_('a_'), ts: nowIso_(), date: dateOr_(date, today_()), userId: who.id || '', userName: who.name || '',
    jobId: job ? job.id : '', address: job ? job.address : '', kind: kind, detail: text_(detail, 400), ref: ref || ''
  });
}
function unact_(db, ref) {
  if (!ref) return;
  const sh = db.t('Activity').sheet;
  const last = sh.getLastRow();
  if (last < 2) return;
  const col = SHEETS.Activity.indexOf('ref') + 1;
  const hits = sh.getRange(2, col, last - 1, 1).createTextFinder(ref).matchEntireCell(true).findAll();
  hits.map(function (r) { return r.getRow(); }).sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
  db.t('Activity')._rows = null;
}

// ---------------------------------------------------------------- changes to a house

function jobOp_(db, me, req) {
  const job = findJob_(db, req.jobId);
  const a = req.args || {};
  const owner = isOwner_(me);
  const date = dateOr_(a.date, today_());
  const ts = nowIso_();

  switch (String(req.op || '')) {

    case 'check': {
      const it = job.checklist.filter(function (x) { return x.id === a.itemId; })[0];
      if (!it) fail_('noitem', 'That checklist item is gone. Tap Sync.');
      const left = (Number(it.qty) || 1) - itemDone_(it);
      if (left <= 0) break;
      const n = Math.max(1, Math.min(left, Math.floor(Number(a.n) || 1)));
      const eid = cleanId_(a.entryId, 'e_');
      if (it.entries.some(function (e) { return e.id === eid; })) break;
      it.entries.push({ id: eid, by: me.id, byName: me.name, date: date, n: n, ts: ts });
      act_(db, me, job, 'Checklist', it.text + ((Number(it.qty) || 1) > 1 ? ' (' + n + ')' : ''), eid, date);
      break;
    }
    case 'uncheck': {
      const it = job.checklist.filter(function (x) { return x.id === a.itemId; })[0];
      if (!it) break;
      let e = null;
      if (a.entryId) e = it.entries.filter(function (x) { return x.id === a.entryId; })[0];
      else {
        const mine = it.entries.filter(function (x) { return owner || x.by === me.id; });
        e = mine[mine.length - 1];
      }
      if (!e) fail_('notyours', 'Only the person who checked this off, or an owner, can undo it.');
      if (!owner && e.by !== me.id) fail_('notyours', 'Only the person who checked this off, or an owner, can undo it.');
      it.entries = it.entries.filter(function (x) { return x !== e; });
      unact_(db, e.id);
      break;
    }
    case 'itemAdd': {
      needOwner_(me);
      const t = text_(a.text, 120);
      if (!t) fail_('text', 'Type what needs to be done.');
      job.checklist.push({ id: cleanId_(a.itemId, 'c_'), text: t, qty: Math.max(1, Math.min(99, Math.floor(Number(a.qty) || 1))), assignee: assignee_(db, a.assignee), due: dateOr_(a.due, ''), time: time_(a.time), entries: [] });
      break;
    }
    case 'itemEdit': {
      needOwner_(me);
      const it = job.checklist.filter(function (x) { return x.id === a.itemId; })[0];
      if (!it) fail_('noitem', 'That checklist item is gone. Tap Sync.');
      if (a.text != null) { const t = text_(a.text, 120); if (t) it.text = t; }
      if (a.qty != null) it.qty = Math.max(1, Math.min(99, Math.floor(Number(a.qty) || 1)));
      if (a.assignee != null) it.assignee = assignee_(db, a.assignee);
      if (a.due != null) it.due = dateOr_(a.due, '');
      if (a.time != null) it.time = time_(a.time);
      break;
    }
    case 'itemDel': {
      needOwner_(me);
      const it = job.checklist.filter(function (x) { return x.id === a.itemId; })[0];
      if (!it) break;
      it.entries.forEach(function (e) { unact_(db, e.id); });
      job.checklist = job.checklist.filter(function (x) { return x !== it; });
      break;
    }
    case 'starter': {
      needOwner_(me);
      const have = {};
      job.checklist.forEach(function (x) { have[x.text.toLowerCase()] = 1; });
      starterChecklist_(db, job, true).forEach(function (x) { if (!have[x.text.toLowerCase()]) job.checklist.push(x); });
      break;
    }
    case 'phase': {
      const i = Math.floor(Number(a.idx));
      const p = job.phases[i];
      if (!p) fail_('phase', 'That phase was not found.');
      const st = ['pending', 'inprogress', 'done'].indexOf(a.status) >= 0 ? a.status : 'pending';
      const ref = job.id + ':phase:' + i;
      unact_(db, ref);
      p.status = st;
      if (st === 'pending') { p.date = ''; p.by = ''; p.ts = ''; }
      else {
        p.date = date; p.by = me.name; p.ts = ts;
        act_(db, me, job, 'Phase', p.name + (st === 'done' ? ' done' : ' in progress'), ref, date);
      }
      break;
    }
    case 'insp': {
      needOwner_(me);
      if (INSP_KEYS.indexOf(a.key) < 0) fail_('insp', 'Unknown inspection.');
      const result = a.result === 'fail' ? 'fail' : 'pass';
      const note = text_(a.note, 400);
      if (result === 'fail' && !note) fail_('note', 'Add a note saying why it failed.');
      const eid = cleanId_(a.entryId, 'i_');
      if (job.inspLog.some(function (e) { return e.id === eid; })) break;
      job.inspLog.push({ id: eid, key: a.key, result: result, date: date, note: note, by: me.id, byName: me.name, ts: ts });
      job.inspReqs = job.inspReqs.filter(function (r) { return r.key !== a.key; }); // the result is in, so it is no longer waiting
      syncInspections_(job);
      act_(db, me, job, 'Inspection', INSP_LABELS[a.key] + (result === 'fail' ? ' FAILED: ' + note : ' passed' + (note ? ': ' + note : '')), eid, date);
      break;
    }
    case 'inspDel': {
      needOwner_(me);
      const before = job.inspLog.length;
      job.inspLog = job.inspLog.filter(function (e) { return e.id !== a.entryId; });
      if (job.inspLog.length !== before) { syncInspections_(job); unact_(db, String(a.entryId)); }
      break;
    }
    case 'inspReq': {
      // Anyone on the team can say a house is ready for an inspection.
      if (INSP_KEYS.indexOf(a.key) < 0) fail_('insp', 'Unknown inspection.');
      if (job.inspReqs.some(function (r) { return r.key === a.key; })) break;
      const rid = cleanId_(a.reqId, 'q_');
      const note = text_(a.note, 300);
      job.inspReqs.push({ id: rid, key: a.key, by: me.id, byName: me.name, date: today_(), ts: ts, note: note, setDate: '', setByName: '', setTs: '' });
      act_(db, me, job, 'Ready for inspection', INSP_LABELS[a.key] + (note ? ': ' + note : ''), rid, today_());
      break;
    }
    case 'inspReqDel': {
      const r = job.inspReqs.filter(function (x) { return x.id === a.reqId; })[0];
      if (!r) break;
      if (!owner && (r.by !== me.id || r.setDate)) fail_('notyours', 'Only Brenda or Teodoro can take this off the inspection list.');
      job.inspReqs = job.inspReqs.filter(function (x) { return x !== r; });
      unact_(db, r.id);
      break;
    }
    case 'inspSet': {
      // An owner called it in: record the day the inspection is set for. It then waits for a result.
      needOwner_(me);
      let r = job.inspReqs.filter(function (x) { return x.id === a.reqId; })[0];
      if (!r && INSP_KEYS.indexOf(a.key) >= 0) r = job.inspReqs.filter(function (x) { return x.key === a.key; })[0];
      if (!r) {
        if (INSP_KEYS.indexOf(a.key) < 0) fail_('insp', 'That request is gone. Tap Sync.');
        r = { id: cleanId_(a.reqId, 'q_'), key: a.key, by: me.id, byName: me.name, date: today_(), ts: ts, note: '', setDate: '', setByName: '', setTs: '' };
        job.inspReqs.push(r);
      }
      if (a.clear) { r.setDate = ''; r.setByName = ''; r.setTs = ''; }
      else {
        if (!isDate_(a.date)) fail_('date', 'Pick the day the inspection is set for.');
        r.setDate = String(a.date); r.setByName = me.name; r.setTs = ts;
      }
      break;
    }
    case 'ticketAdd': {
      needOwner_(me);
      const t = text_(a.text, 300);
      if (!t) fail_('text', 'Type what needs to be done.');
      const tid = cleanId_(a.ticketId, 'w_');
      if (job.tickets.some(function (x) { return x.id === tid; })) break;
      job.tickets.push({ id: tid, text: t, assignee: assignee_(db, a.assignee), date: dateOr_(a.day, ''), time: time_(a.time),
        createdByName: me.name, createdDate: today_(), createdTs: ts, done: false, doneDate: '', doneNote: '', doneBy: '', doneByName: '', doneTs: '' });
      break;
    }
    case 'ticketEdit': {
      needOwner_(me);
      const t = job.tickets.filter(function (x) { return x.id === a.ticketId; })[0];
      if (!t) fail_('noitem', 'That ticket is gone. Tap Sync.');
      if (a.text != null) { const x = text_(a.text, 300); if (x) t.text = x; }
      if (a.assignee != null) t.assignee = assignee_(db, a.assignee);
      if (a.day != null) t.date = dateOr_(a.day, '');
      if (a.time != null) t.time = time_(a.time);
      if (a.doneNote != null && t.done) t.doneNote = text_(a.doneNote, 600);
      break;
    }
    case 'ticketDel': {
      needOwner_(me);
      const t = job.tickets.filter(function (x) { return x.id === a.ticketId; })[0];
      if (!t) break;
      unact_(db, t.id);
      job.tickets = job.tickets.filter(function (x) { return x !== t; });
      break;
    }
    case 'ticketDone': {
      const t = job.tickets.filter(function (x) { return x.id === a.ticketId; })[0];
      if (!t) fail_('noitem', 'That ticket is gone. Tap Sync.');
      if (t.done) break;
      const note = text_(a.note, 600);
      if (!note) fail_('note', 'Write what was done.');
      t.done = true; t.doneDate = date; t.doneNote = note; t.doneBy = me.id; t.doneByName = me.name; t.doneTs = ts;
      act_(db, me, job, 'Warranty', t.text + ': ' + note, t.id, date);
      break;
    }
    case 'ticketUndo': {
      const t = job.tickets.filter(function (x) { return x.id === a.ticketId; })[0];
      if (!t || !t.done) break;
      if (!owner && t.doneBy !== me.id) fail_('notyours', 'Only the person who finished this, or an owner, can reopen it.');
      t.done = false; t.doneDate = ''; t.doneNote = ''; t.doneBy = ''; t.doneByName = ''; t.doneTs = '';
      unact_(db, t.id);
      break;
    }
    case 'fixtureAdd': {
      const name = text_(a.name, 120);
      if (!name) fail_('text', 'Type the fixture name.');
      const fid = cleanId_(a.id, 'f_');
      if (job.fixtures.some(function (f) { return f.id === fid; })) break;
      job.fixtures.push({ id: fid, name: name, phase: text_(a.phase, 30), date: date, by: me.id, byName: me.name, ts: ts });
      act_(db, me, job, 'Fixture', name + (a.phase ? ' (' + text_(a.phase, 30) + ')' : ''), fid, date);
      break;
    }
    case 'fixtureDel': {
      const f = job.fixtures.filter(function (x) { return x.id === a.id; })[0];
      if (!f) break;
      if (!owner && f.by !== me.id) fail_('notyours', 'Only the person who added this, or an owner, can remove it.');
      job.fixtures = job.fixtures.filter(function (x) { return x !== f; });
      unact_(db, f.id);
      break;
    }
    case 'logAdd': {
      const lid = cleanId_(a.id, 'l_');
      if (job.log.some(function (l) { return l.id === lid; })) break;
      let who = me;
      if (owner && a.worker && text_(a.worker, 40).toLowerCase() !== me.name.toLowerCase()) {
        const wn = text_(a.worker, 40);
        const match = db.t('Users').rows.filter(function (u) { return u.name.toLowerCase() === wn.toLowerCase(); })[0];
        who = match ? { id: match.id, name: match.name } : { id: '', name: wn };
      }
      const notes = text_(a.notes, 600);
      const phase = text_(a.phase, 30) || 'General';
      job.log.push({ id: lid, worker: who.name, workerId: who.id, date: date, phase: phase, notes: notes, enteredBy: me.name, ts: ts });
      act_(db, who, job, 'Visit', phase + (notes ? ': ' + notes : ''), lid, date);
      break;
    }
    case 'logDel': {
      const l = job.log.filter(function (x) { return x.id === a.id; })[0];
      if (!l) break;
      if (!owner && l.workerId !== me.id) fail_('notyours', 'Only the person who logged this, or an owner, can remove it.');
      job.log = job.log.filter(function (x) { return x !== l; });
      unact_(db, l.id);
      break;
    }
    case 'docs': {
      needOwner_(me);
      if (DOC_KEYS.indexOf(a.key) < 0) fail_('doc', 'Unknown document slot.');
      job.docs[a.key] = url_(a.url);
      if (a.key === 'blueprint') job.blueprint = '';
      break;
    }
    case 'info': {
      needOwner_(me);
      const addr = text_(a.address, 120);
      if (addr) job.address = addr;
      ['lot', 'subdivision', 'builder', 'city', 'zip', 'permit'].forEach(function (k) { if (a[k] != null) job[k] = text_(a[k], 80); });
      if (a.contactId != null) job.contactId = a.contactId && findContact_(db, a.contactId) ? String(a.contactId) : '';
      if (a.notes != null) job.notes = text_(a.notes, 1000);
      if (a.inspUrl != null) job.inspUrl = url_(a.inspUrl);
      if (a.status != null) setStatus_(job, a.status, date);
      break;
    }
    case 'status': {
      needOwner_(me);
      setStatus_(job, a.status, date);
      break;
    }
    case 'pin': {
      const p = String(a.pin || '');
      if (p && !/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/.test(p)) fail_('pin', 'That location could not be read.');
      if (!p) needOwner_(me);
      job.pin = p;
      break;
    }
    default: fail_('op', 'Unknown change. Refresh to get the newest version.');
  }
  saveJob_(db, job);
  return { ok: true, job: outJob_(job, me) };
}
function setStatus_(job, status, date) {
  if (['active', 'pending', 'complete', 'warranty'].indexOf(status) < 0) fail_('status', 'Unknown status.');
  if (status === 'complete' && job.status !== 'complete') job.completedDate = date;
  if (status !== 'complete') job.completedDate = '';
  job.status = status;
}
function assignee_(db, id) {
  id = String(id || '');
  if (!id) return '';
  return findUser_(db, id) ? id : '';
}
function jobCreate_(db, me, req) {
  needOwner_(me);
  const a = req.job || {};
  const addr = text_(a.address, 120);
  if (!addr) fail_('address', 'Enter the street address.');
  if (jobs_(db).some(function (j) { return addrKey_(j.address) === addrKey_(addr); })) fail_('dupe', 'That address is already in the tracker (check the Completed tab too).');
  const job = normalizeJob_({
    id: cleanId_(a.id, 'j_'), address: addr, lot: text_(a.lot, 80), subdivision: text_(a.subdivision, 80), builder: text_(a.builder, 80),
    contactId: a.contactId && findContact_(db, a.contactId) ? String(a.contactId) : '', city: text_(a.city, 80), zip: text_(a.zip, 12),
    permit: text_(a.permit, 40), notes: text_(a.notes, 1000), inspUrl: url_(a.inspUrl), status: 'active'
  });
  if (a.status) setStatus_(job, a.status, today_());
  // A house that comes in for warranty work was already built, so it does not get the build checklist.
  job.checklist = job.status === 'warranty' ? [] : starterChecklist_(db, job, false);
  saveJob_(db, job);
  return { ok: true, job: outJob_(job, me) };
}

// ---------------------------------------------------------------- private daily to do lists

function taskOut_(t) {
  return { id: t.id, assigneeId: t.assigneeId, date: t.date, text: t.text, jobId: t.jobId, done: t.done === '1', doneByName: t.doneByName, doneDate: t.doneDate, doneTs: t.doneTs, createdTs: t.createdTs, time: time_(t.time) };
}
function taskFor_(t, me) { const o = taskOut_(t); if (!isOwner_(me)) { delete o.doneTs; delete o.createdTs; } return o; }
function taskAdd_(db, me, req) {
  needOwner_(me);
  const a = req.task || {};
  const u = findUser_(db, String(a.assigneeId || ''));
  if (!u) fail_('user', 'Pick who this is for.');
  const t = text_(a.text, 300);
  if (!t) fail_('text', 'Type what needs to be done.');
  const tid = cleanId_(a.id, 't_');
  let row = db.t('Tasks').rows.filter(function (x) { return x.id === tid; })[0];
  if (!row) row = db.t('Tasks').add({ id: tid, assigneeId: u.id, date: dateOr_(a.date, today_()), text: t, jobId: a.jobId ? findJob_(db, a.jobId).id : '', done: '', createdBy: me.id, createdTs: nowIso_(), time: time_(a.time) });
  return { ok: true, task: taskFor_(row, me) };
}
function taskEdit_(db, me, req) {
  needOwner_(me);
  const row = db.t('Tasks').rows.filter(function (x) { return x.id === String(req.id || ''); })[0];
  if (!row) fail_('notask', 'That to do is gone. Tap Sync.');
  if (req.remove) { unact_(db, row.id); db.t('Tasks').remove(row); return { ok: true, removed: row.id }; }
  if (req.text != null) { const t = text_(req.text, 300); if (t) row.text = t; }
  if (req.date != null && isDate_(req.date)) row.date = req.date;
  if (req.assigneeId != null) { const u = findUser_(db, String(req.assigneeId)); if (!u) fail_('user', 'Pick who this is for.'); row.assigneeId = u.id; }
  if (req.jobId != null) row.jobId = req.jobId ? findJob_(db, req.jobId).id : '';
  if (req.time != null) row.time = time_(req.time);
  db.t('Tasks').save(row);
  return { ok: true, task: taskFor_(row, me) };
}
function taskToggle_(db, me, req) {
  const row = db.t('Tasks').rows.filter(function (x) { return x.id === String(req.id || ''); })[0];
  if (!row) fail_('notask', 'That to do is gone. Tap Sync.');
  if (!isOwner_(me) && row.assigneeId !== me.id) fail_('forbidden', 'That to do belongs to someone else.');
  unact_(db, row.id);
  if (req.done) {
    const date = dateOr_(req.date, today_());
    const doer = isOwner_(me) && row.assigneeId !== me.id ? (findUser_(db, row.assigneeId) || me) : me;
    row.done = '1'; row.doneBy = doer.id; row.doneByName = doer.name; row.doneDate = date; row.doneTs = nowIso_();
    const job = row.jobId ? jobs_(db).filter(function (j) { return j.id === row.jobId; })[0] : null;
    act_(db, doer, job, 'To do', row.text, row.id, date);
  } else { row.done = ''; row.doneBy = ''; row.doneByName = ''; row.doneDate = ''; row.doneTs = ''; }
  db.t('Tasks').save(row);
  return { ok: true, task: taskFor_(row, me) };
}

// ---------------------------------------------------------------- photos (saved in Google Drive)

function photoRoot_(db) {
  const id = setting_(db, 'photoFolderId');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* folder was removed, make a new one */ } }
  let parent;
  try { parent = DriveApp.getFolderById(APP_FOLDER_ID); } catch (e) { parent = DriveApp.getRootFolder(); }
  const f = parent.createFolder('Job Tracker Photos');
  setSetting_(db, 'photoFolderId', f.getId());
  return f;
}
function jobFolder_(db, job) {
  if (job.photoFolderId) { try { return DriveApp.getFolderById(job.photoFolderId); } catch (e) { /* make a new one */ } }
  const f = photoRoot_(db).createFolder(job.address + (job.city ? ', ' + job.city : ''));
  job.photoFolderId = f.getId();
  saveJob_(db, job);
  return f;
}
function photoOut_(p, me, thumb) {
  const o = { id: p.id, jobId: p.jobId, date: p.date, userName: p.userName, phase: p.phase, note: p.note };
  if (isOwner_(me)) o.ts = p.ts;
  if (thumb != null) o.thumb = thumb;
  return o;
}
function photoAdd_(db, me, req) {
  const a = req.photo || {};
  const job = findJob_(db, a.jobId);
  const pid = cleanId_(a.id, 'p_');
  const old = db.t('Photos').rows.filter(function (p) { return p.id === pid; })[0];
  if (old) return { ok: true, photo: photoOut_(old, me, String(req.thumb || '')) };
  const data = String(req.data || '');
  if (!data || data.length > 8000000) fail_('photo', 'That photo is too large to upload.');
  const bytes = Utilities.base64Decode(data);
  const date = dateOr_(a.date, today_());
  const phase = text_(a.phase, 30);
  const name = date + ' ' + me.name + (phase ? ' ' + phase : '') + ' ' + Utilities.formatDate(new Date(), TZ, 'HHmmss') + '.jpg';
  const file = jobFolder_(db, job).createFile(Utilities.newBlob(bytes, 'image/jpeg', name));
  file.setDescription(job.address + ' | ' + me.name + ' | ' + date + (phase ? ' | ' + phase : ''));
  let thumb = String(req.thumb || '');
  if (thumb.length > 45000 || !/^[A-Za-z0-9+\/=]*$/.test(thumb)) thumb = '';
  const row = db.t('Photos').add({ id: pid, jobId: job.id, fileId: file.getId(), date: date, ts: nowIso_(), userId: me.id, userName: me.name, phase: phase, note: text_(a.note, 200), thumb: thumb });
  act_(db, me, job, 'Photo', 'Photo' + (phase ? ' (' + phase + ')' : ''), pid, date);
  return { ok: true, photo: photoOut_(row, me, thumb) };
}
function photos_(db, me, req) {
  const job = findJob_(db, req.jobId);
  const t = db.t('Photos');
  const rows = t.rows.filter(function (p) { return p.jobId === job.id; });
  if (!rows.length) return { ok: true, jobId: job.id, photos: [] };
  const lo = rows[0]._r, hi = rows[rows.length - 1]._r;
  const thumbs = t.sheet.getRange(lo, t.cols.length, hi - lo + 1, 1).getValues();
  return { ok: true, jobId: job.id, photos: rows.map(function (p) { return photoOut_(p, me, String(thumbs[p._r - lo][0] || '')); }) };
}
function photoGet_(db, me, req) {
  const p = db.t('Photos').rows.filter(function (x) { return x.id === String(req.id || ''); })[0];
  if (!p) fail_('nophoto', 'That photo was not found.');
  const file = DriveApp.getFileById(p.fileId);
  const out = { ok: true, id: p.id, data: Utilities.base64Encode(file.getBlob().getBytes()) };
  if (isOwner_(me)) out.url = file.getUrl();
  return out;
}
function photoDel_(db, me, req) {
  needOwner_(me);
  const p = db.t('Photos').rows.filter(function (x) { return x.id === String(req.id || ''); })[0];
  if (!p) return { ok: true, removed: String(req.id || '') };
  try { DriveApp.getFileById(p.fileId).setTrashed(true); } catch (e) { /* already gone */ }
  unact_(db, p.id);
  db.t('Photos').remove(p);
  return { ok: true, removed: p.id };
}

// ---------------------------------------------------------------- phone book (builder contacts)

function contactOut_(c) { return { id: c.id, name: c.name, builder: c.builder, neighborhood: c.neighborhood, phone: c.phone, notes: c.notes }; }
function contactsOut_(db) { return db.t('Contacts').rows.map(contactOut_); }
function findContact_(db, id) { return db.t('Contacts').rows.filter(function (c) { return c.id === String(id || ''); })[0]; }
function contactSave_(db, me, req) {
  needOwner_(me);
  const a = req.contact || {};
  const name = text_(a.name, 80);
  if (!name) fail_('name', 'Enter the contact name.');
  const vals = { name: name, builder: text_(a.builder, 80), neighborhood: text_(a.neighborhood, 80), phone: text_(a.phone, 40), notes: text_(a.notes, 300), updated: nowIso_() };
  const cid = cleanId_(a.id, 'p_');
  const row = findContact_(db, cid);
  if (row) { Object.keys(vals).forEach(function (k) { row[k] = vals[k]; }); db.t('Contacts').save(row); }
  else { vals.id = cid; db.t('Contacts').add(vals); }
  return { ok: true, contacts: contactsOut_(db) };
}
function contactDel_(db, me, req) {
  needOwner_(me);
  const row = findContact_(db, req.id);
  if (row) {
    db.t('Contacts').remove(row);
    jobs_(db).forEach(function (j) { if (j.contactId === row.id) { j.contactId = ''; saveJob_(db, j); } });
  }
  return { ok: true, contacts: contactsOut_(db), jobs: jobs_(db).map(function (j) { return outJob_(j, me); }) };
}

// Rename a whole group at once: every house with the old builder and neighborhood gets the new ones,
// and the group keeps its place in the list order.
function groupEdit_(db, me, req) {
  needOwner_(me);
  const from = req.from || {}, to = req.to || {};
  const oldKey = groupKey_(from.builder, from.neighborhood);
  const builder = text_(to.builder, 80), hood = text_(to.neighborhood, 80);
  const newKey = groupKey_(builder, hood);
  jobs_(db).forEach(function (j) {
    if (groupKey_(j.builder, j.subdivision) !== oldKey) return;
    j.builder = builder; j.subdivision = hood;
    saveJob_(db, j);
  });
  let order = jsonSetting_(db, 'groupOrder', []);
  if (order.indexOf(newKey) >= 0) order = order.filter(function (k) { return k !== oldKey; });
  else order = order.map(function (k) { return k === oldKey ? newKey : k; });
  setSetting_(db, 'groupOrder', JSON.stringify(order));
  return { ok: true, jobs: jobs_(db).map(function (j) { return outJob_(j, me); }), settings: settingsOut_(db) };
}

// ---------------------------------------------------------------- loading, settings, reports

function settingsOut_(db) {
  return {
    inspLinks: jsonSetting_(db, 'inspLinks', { 'HOU TX': HOUSTON_LINK }),
    checklistTemplate: jsonSetting_(db, 'checklistTemplate', STARTER_CHECKLIST),
    groupOrder: jsonSetting_(db, 'groupOrder', [])
  };
}
function load_(db, me) {
  const owner = isOwner_(me);
  const today = today_();
  let tasks = db.t('Tasks').rows;
  tasks = owner
    ? tasks.filter(function (t) { return t.done !== '1' || t.date >= addDays_(today, -45); })
    : tasks.filter(function (t) { return t.assigneeId === me.id && (t.done !== '1' || t.date >= addDays_(today, -14)); });
  const photoCounts = {};
  db.t('Photos').rows.forEach(function (p) { photoCounts[p.jobId] = (photoCounts[p.jobId] || 0) + 1; });
  const out = {
    ok: true, me: pub_(me), today: today,
    jobs: jobs_(db).map(function (j) { return outJob_(j, me); }),
    tasks: tasks.map(function (t) { return taskFor_(t, me); }),
    photoCounts: photoCounts, settings: settingsOut_(db), contacts: contactsOut_(db),
    team: db.t('Users').rows.filter(function (u) { return u.active === '1'; }).map(function (u) { return owner || u.id === me.id ? pub_(u) : null; }).filter(Boolean)
  };
  if (owner) { out.users = ownersOut_(db); out.setupOpen = setupOpen_(db); }
  return out;
}
function settingsSave_(db, me, req) {
  needOwner_(me);
  if (req.inspLinks && typeof req.inspLinks === 'object') {
    const clean = {};
    Object.keys(req.inspLinks).forEach(function (k) { const key = addrKey_(k); const u = url_(req.inspLinks[k]); if (key && u) clean[key] = u; });
    setSetting_(db, 'inspLinks', JSON.stringify(clean));
  }
  if (Array.isArray(req.checklistTemplate)) {
    const tpl = req.checklistTemplate.map(function (t) { return text_(t, 120); }).filter(Boolean).slice(0, 40);
    setSetting_(db, 'checklistTemplate', JSON.stringify(tpl));
  }
  if (Array.isArray(req.groupOrder)) {
    const seen = {};
    const order = req.groupOrder.map(function (k) { return text_(k, 200); }).filter(function (k) { if (!k || k.indexOf('|') < 0 || seen[k]) return false; seen[k] = 1; return true; }).slice(0, 300);
    setSetting_(db, 'groupOrder', JSON.stringify(order));
  }
  if (req.setupOff != null) setSetting_(db, 'setupOff', req.setupOff ? '1' : '');
  return { ok: true, settings: settingsOut_(db), setupOpen: setupOpen_(db) };
}
function report_(db, me, req) {
  needOwner_(me);
  const today = today_();
  const from = dateOr_(req.from, addDays_(today, -6)), to = dateOr_(req.to, today);
  const rows = db.t('Activity').rows.filter(function (r) { return r.date >= from && r.date <= to; })
    .map(function (r) { return { ts: r.ts, date: r.date, userId: r.userId, userName: r.userName, jobId: r.jobId, address: r.address, kind: r.kind, detail: r.detail }; });
  const tasks = db.t('Tasks').rows.filter(function (t) { return t.date >= from && t.date <= to; }).map(taskOut_);
  return { ok: true, from: from, to: to, today: today, activity: rows, tasks: tasks };
}

// ---------------------------------------------------------------- router

function route_(db, req) {
  const a = String(req.action || '');
  if (a === 'users') return { ok: true, users: publicUsers_(db), setupOpen: setupOpen_(db) };
  if (a === 'login') return login_(db, req);
  if (a === 'setup') return setup_(db, req);

  const me = auth_(db, req.token);
  if (a === 'load') return load_(db, me);
  if (a === 'photos') return photos_(db, me, req);
  if (a === 'photoGet') return photoGet_(db, me, req);
  if (a === 'report') return report_(db, me, req);
  if (a === 'logout') {
    const h = hash_(String(req.token));
    const s = db.t('Sessions').rows.filter(function (x) { return x.tokenHash === h; })[0];
    if (s) db.t('Sessions').remove(s);
    return { ok: true };
  }

  // Everything below changes something. A change that was already saved once is not applied twice.
  const cache = CacheService.getScriptCache();
  const opKey = req.opId ? 'op_' + String(req.opId).slice(0, 60) : '';
  if (opKey && cache.get(opKey)) return { ok: true, dup: true };
  let out;
  switch (a) {
    case 'jobOp': out = jobOp_(db, me, req); break;
    case 'jobCreate': out = jobCreate_(db, me, req); break;
    case 'taskAdd': out = taskAdd_(db, me, req); break;
    case 'taskEdit': out = taskEdit_(db, me, req); break;
    case 'taskToggle': out = taskToggle_(db, me, req); break;
    case 'photoAdd': out = photoAdd_(db, me, req); break;
    case 'photoDel': out = photoDel_(db, me, req); break;
    case 'userAdd': out = userAdd_(db, me, req); break;
    case 'userEdit': out = userEdit_(db, me, req); break;
    case 'settingsSave': out = settingsSave_(db, me, req); break;
    case 'contactSave': out = contactSave_(db, me, req); break;
    case 'contactDel': out = contactDel_(db, me, req); break;
    case 'groupEdit': out = groupEdit_(db, me, req); break;
    default: fail_('action', 'Unknown request. Refresh to get the newest version.');
  }
  if (opKey && out && out.ok) cache.put(opKey, '1', 21600);
  return out;
}

// ---------------------------------------------------------------- one time update to the October 2026 house list

function migrate_(db) {
  // Team logins (no PINs yet).
  const users = db.t('Users');
  TEAM.forEach(function (m) {
    if (!users.rows.some(function (u) { return u.id === m[0] || u.name.toLowerCase() === m[1].toLowerCase(); })) users.add({ id: m[0], name: m[1], role: m[2], active: '1' });
  });
  if (!setting_(db, 'inspLinks')) setSetting_(db, 'inspLinks', JSON.stringify({ 'HOU TX': HOUSTON_LINK }));
  if (!setting_(db, 'checklistTemplate')) setSetting_(db, 'checklistTemplate', JSON.stringify(STARTER_CHECKLIST));

  const today = today_();
  const byAddr = {};
  jobs_(db).forEach(function (j) { byAddr[addrKey_(j.address)] = j; });

  const fresh = [];
  HOUSES.forEach(function (h) {
    let job = byAddr[addrKey_(h.address)];
    const isNew = !job;
    if (!job) { job = normalizeJob_({ id: id_('j_'), address: h.address, status: 'active' }); byAddr[addrKey_(h.address)] = job; }
    job.permit = h.permit || job.permit; job.city = h.city; job.zip = h.zip;
    if (h.subdivision && !job.subdivision) job.subdivision = h.subdivision;
    if (job.status === 'complete') { job.status = 'active'; job.completedDate = ''; }
    // The dates on the list are passed inspections.
    job.inspLog = job.inspLog.filter(function (e) { return String(e.id).indexOf('old_') !== 0; });
    INSP_KEYS.forEach(function (k) {
      if (h.inspections[k] && !job.inspLog.some(function (e) { return e.key === k; })) {
        job.inspLog.push({ id: 'old_' + k, key: k, result: 'pass', date: h.inspections[k], note: '', by: '', byName: '', ts: '' });
      }
    });
    syncInspections_(job);
    if (!job.checklist.length) job.checklist = starterChecklist_(db, job, true);
    if (isNew) fresh.push([job.id, JSON.stringify(job), nowIso_()]);
    else saveJob_(db, job);
  });
  if (fresh.length) {
    const sh = db.t('Jobs').sheet;
    const start = sh.getLastRow() + 1;
    if (start + fresh.length - 1 > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), fresh.length + 200);
    sh.getRange(start, 1, fresh.length, 3).setNumberFormat('@').setValues(fresh);
    db.t('Jobs')._rows = null; db._jobs = null;
  }

  const now = {};
  jobs_(db).forEach(function (j) { now[addrKey_(j.address)] = j; });
  MOVE_TO_COMPLETE.forEach(function (addr) {
    const job = now[addrKey_(addr)];
    if (job && job.status !== 'complete') { job.status = 'complete'; job.completedDate = today; saveJob_(db, job); }
  });

  setSetting_(db, MIGRATION_KEY, 'done');
}

// ---------------------------------------------------------------- one time update for the October 11, 2026 list
// Adds the builder and neighborhood to each house, keeps Brenda's list order, and brings in the inspection
// dates from her newest list. Red dates on that list are failed inspections. Anything already entered in
// the app by hand is left alone.

function migrate2_(db) {
  // The Tasks tab gets a new "time" column.
  const tasks = db.t('Tasks');
  const col = SHEETS.Tasks.length;
  if (tasks.sheet.getMaxColumns() < col) tasks.sheet.insertColumnsAfter(tasks.sheet.getMaxColumns(), col - tasks.sheet.getMaxColumns());
  tasks.sheet.getRange(1, col).setNumberFormat('@').setValue('time');
  db.t('Contacts');

  const today = today_();
  const byAddr = {};
  jobs_(db).forEach(function (j) { byAddr[addrKey_(j.address)] = j; });
  const order = [];
  LIST_1011.forEach(function (h, i) {
    const key = groupKey_(h[1], h[2]);
    if (order.indexOf(key) < 0) order.push(key);
    const job = byAddr[addrKey_(h[0])];
    if (!job) return;
    if (!job.builder) job.builder = h[1];
    if (h[2]) job.subdivision = h[2];
    job.ord = i + 1;
    INSP_KEYS.forEach(function (k, n) {
      const d = h[3][n];
      if (!isDate_(d) || d > today) return;
      const result = h[4].indexOf(k) >= 0 ? 'fail' : 'pass';
      const mine = job.inspLog.filter(function (e) { return e.key === k; });
      if (mine.some(function (e) { return String(e.id).indexOf('old_') !== 0; })) return; // entered in the app, leave it
      job.inspLog = job.inspLog.filter(function (e) { return e.key !== k; });
      job.inspLog.push({ id: 'old_' + k, key: k, result: result, date: d, note: result === 'fail' ? 'Failed (red date on the October 2026 list)' : '', by: '', byName: '', ts: '' });
    });
    syncInspections_(job);
    saveJob_(db, job);
  });
  if (!setting_(db, 'groupOrder')) setSetting_(db, 'groupOrder', JSON.stringify(order));
  setSetting_(db, MIGRATION2_KEY, 'done');
}

// Run this once from the editor (Run > authorize) so Google asks for permission to save photos to Drive.
function authorize() {
  DriveApp.getRootFolder().getName();
  open_(); // also runs the one time list updates, so the first time the app opens is quick
  Logger.log('Ready. The Job Tracker can now use the sheet and save photos to Drive.');
  return 'Ready';
}
