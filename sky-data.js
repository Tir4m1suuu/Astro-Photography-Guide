/* NPF Field — sky data & astronomy math
   All computation is local — no network calls, no external APIs. */

// ---------- City database ----------
// [name, country, lat, lon, population in millions (metro, approximate)]
// Used for: (a) quick location picking, (b) a DISTANCE-FROM-CITIES light
// pollution heuristic. This is NOT measured sky-brightness data — there's no
// bundled satellite radiance dataset here, just a proxy based on how close
// you are to population centers. Treat the resulting estimate as a
// starting point, not a light meter reading.
const CITY_DATA = [
["Tokyo","Japan",35.68,139.69,37.4],["Delhi","India",28.61,77.21,32.9],
["Shanghai","China",31.23,121.47,29.2],["São Paulo","Brazil",-23.55,-46.63,22.4],
["Mexico City","Mexico",19.43,-99.13,21.9],["Cairo","Egypt",30.04,31.24,21.3],
["Mumbai","India",19.08,72.88,21.3],["Beijing","China",39.90,116.41,20.9],
["Dhaka","Bangladesh",23.81,90.41,21.7],["Osaka","Japan",34.69,135.50,19.1],
["New York","USA",40.71,-74.01,18.8],["Karachi","Pakistan",24.86,67.01,16.8],
["Buenos Aires","Argentina",-34.60,-58.38,15.4],["Chongqing","China",29.56,106.55,16.4],
["Istanbul","Turkey",41.01,28.98,15.5],["Kolkata","India",22.57,88.36,15.1],
["Manila","Philippines",14.60,120.98,14.4],["Lagos","Nigeria",6.52,3.38,15.4],
["Rio de Janeiro","Brazil",-22.91,-43.17,13.7],["Tianjin","China",39.13,117.20,13.9],
["Kinshasa","DR Congo",-4.44,15.27,15.6],["Guangzhou","China",23.13,113.26,13.6],
["Los Angeles","USA",34.05,-118.24,12.4],["Moscow","Russia",55.76,37.62,12.6],
["Shenzhen","China",22.54,114.06,12.5],["Lahore","Pakistan",31.55,74.34,13.1],
["Bangalore","India",12.97,77.59,13.2],["Paris","France",48.85,2.35,11.1],
["Bogotá","Colombia",4.71,-74.07,10.9],["Jakarta","Indonesia",-6.21,106.85,10.6],
["Chennai","India",13.08,80.27,11.5],["Lima","Peru",-12.05,-77.04,10.8],
["Bangkok","Thailand",13.75,100.50,10.7],["Seoul","South Korea",37.57,126.98,9.9],
["Nagoya","Japan",35.18,136.91,9.5],["Hyderabad","India",17.39,78.49,10.5],
["London","UK",51.51,-0.13,9.6],["Tehran","Iran",35.69,51.39,9.4],
["Chicago","USA",41.88,-87.63,8.9],["Chengdu","China",30.57,104.07,10.2],
["Nanjing","China",32.06,118.80,9.4],["Wuhan","China",30.59,114.31,9.5],
["Ho Chi Minh City","Vietnam",10.82,106.63,9.3],["Luanda","Angola",-8.84,13.23,8.9],
["Ahmedabad","India",23.02,72.57,8.4],["Kuala Lumpur","Malaysia",3.14,101.69,8.3],
["Xi'an","China",34.34,108.94,9.6],["Hong Kong","China",22.32,114.17,7.5],
["Dongguan","China",23.02,113.75,8.3],["Hangzhou","China",30.27,120.15,10.4],
["Foshan","China",23.02,113.12,9.5],["Shenyang","China",41.80,123.43,9.1],
["Riyadh","Saudi Arabia",24.71,46.68,7.9],["Baghdad","Iraq",33.31,44.36,7.7],
["Santiago","Chile",-33.45,-70.67,6.8],["Surat","India",21.17,72.83,7.5],
["Madrid","Spain",40.42,-3.70,6.7],["Suzhou","China",31.30,120.62,7.4],
["Pune","India",18.52,73.86,7.4],["Houston","USA",29.76,-95.37,7.1],
["Dallas","USA",32.78,-96.80,7.6],["Toronto","Canada",43.65,-79.38,6.4],
["Jinan","China",36.65,117.12,8.9],["Qingdao","China",36.07,120.38,10.2],
["Johannesburg","South Africa",-26.20,28.05,6.0],["Barcelona","Spain",41.39,2.17,5.7],
["Singapore","Singapore",1.35,103.82,5.9],["Sydney","Australia",-33.87,151.21,5.4],
["Berlin","Germany",52.52,13.40,3.7],["Rome","Italy",41.90,12.50,4.3],
["Melbourne","Australia",-37.81,144.96,5.2],["Cape Town","South Africa",-33.92,18.42,4.7],
["Miami","USA",25.76,-80.19,6.2],["Atlanta","USA",33.75,-84.39,6.3],
["Philadelphia","USA",39.95,-75.17,6.2],["Washington DC","USA",38.91,-77.04,6.3],
["Phoenix","USA",33.45,-112.07,5.0],["Boston","USA",42.36,-71.06,4.9],
["San Francisco","USA",37.77,-122.42,4.7],["Seattle","USA",47.61,-122.33,4.0],
["Denver","USA",39.74,-104.99,3.0],["Detroit","USA",42.33,-83.05,4.3],
["Minneapolis","USA",44.98,-93.27,3.7],["Vancouver","Canada",49.28,-123.12,2.7],
["Montreal","Canada",45.50,-73.57,4.3],["Amsterdam","Netherlands",52.37,4.90,2.5],
["Vienna","Austria",48.21,16.37,2.0],["Warsaw","Poland",52.23,21.01,1.8],
["Athens","Greece",37.98,23.73,3.2],["Lisbon","Portugal",38.72,-9.14,2.9],
["Dublin","Ireland",53.35,-6.26,1.4],["Copenhagen","Denmark",55.68,12.57,1.4],
["Stockholm","Sweden",59.33,18.06,1.7],["Oslo","Norway",59.91,10.75,1.1],
["Helsinki","Finland",60.17,24.94,1.3],["Prague","Czechia",50.08,14.44,1.3],
["Budapest","Hungary",47.50,19.04,1.8],["Zurich","Switzerland",47.37,8.54,1.4],
["Milan","Italy",45.46,9.19,3.1],["Munich","Germany",48.14,11.58,1.6],
["Hamburg","Germany",53.55,9.99,1.9],["Brussels","Belgium",50.85,4.35,2.1],
["Kyiv","Ukraine",50.45,30.52,3.0],["Bucharest","Romania",44.43,26.10,1.9],
["Sofia","Bulgaria",42.70,23.32,1.2],["Belgrade","Serbia",44.79,20.45,1.4],
["Auckland","New Zealand",-36.85,174.76,1.7],["Wellington","New Zealand",-41.29,174.78,0.4],
["Brisbane","Australia",-27.47,153.03,2.6],["Perth","Australia",-31.95,115.86,2.1],
["Adelaide","Australia",-34.93,138.60,1.4],["Honolulu","USA",21.31,-157.86,1.0],
["Anchorage","USA",61.22,-149.90,0.29],["Reykjavik","Iceland",64.15,-21.94,0.23],
["Casablanca","Morocco",33.57,-7.59,3.7],
["Nairobi","Kenya",-1.29,36.82,4.7],["Addis Ababa","Ethiopia",9.03,38.74,5.2],
["Dar es Salaam","Tanzania",-6.79,39.21,7.4],["Kampala","Uganda",0.35,32.58,3.7],
["Accra","Ghana",5.60,-0.19,2.5],["Abidjan","Ivory Coast",5.36,-4.01,5.6],
["Dakar","Senegal",14.72,-17.47,3.1],["Algiers","Algeria",36.75,3.06,2.9],
["Tunis","Tunisia",36.81,10.18,2.6],["Khartoum","Sudan",15.50,32.56,5.8],
["Denpasar","Indonesia",-8.65,115.22,0.9],["Hanoi","Vietnam",21.03,105.85,8.2],
["Phnom Penh","Cambodia",11.56,104.92,2.3],["Yangon","Myanmar",16.87,96.20,5.4],
["Colombo","Sri Lanka",6.93,79.86,0.75],["Kathmandu","Nepal",27.72,85.32,1.5],
["Taipei","Taiwan",25.03,121.56,7.0],["Ulaanbaatar","Mongolia",47.92,106.92,1.6],
["Almaty","Kazakhstan",43.24,76.95,2.0],["Tashkent","Uzbekistan",41.30,69.24,2.6],
["Baku","Azerbaijan",40.41,49.87,2.3],["Tbilisi","Georgia",41.72,44.79,1.2],
["Yerevan","Armenia",40.18,44.51,1.1],["Amman","Jordan",31.95,35.93,2.1],
["Beirut","Lebanon",33.89,35.50,2.4],["Kuwait City","Kuwait",29.38,47.98,3.1],
["Doha","Qatar",25.29,51.53,2.4],["Dubai","UAE",25.20,55.27,3.5],
["Abu Dhabi","UAE",24.45,54.38,1.5],["Muscat","Oman",23.61,58.59,1.6],
["Panama City","Panama",8.98,-79.52,1.9],["San José","Costa Rica",9.93,-84.08,1.4],
["Havana","Cuba",23.13,-82.38,2.1],["Santo Domingo","Dominican Republic",18.49,-69.94,3.7],
["Kingston","Jamaica",18.00,-76.79,1.2],["Guatemala City","Guatemala",14.63,-90.51,3.0],
["San Salvador","El Salvador",13.69,-89.19,1.8],["Caracas","Venezuela",10.49,-66.88,2.9],
["Quito","Ecuador",-0.18,-78.47,2.8],["La Paz","Bolivia",-16.50,-68.15,1.8],
["Asunción","Paraguay",-25.28,-57.63,3.4],["Montevideo","Uruguay",-34.90,-56.16,1.7],
["Brasília","Brazil",-15.79,-47.88,4.8],["Salvador","Brazil",-12.97,-38.51,3.9],
["Fortaleza","Brazil",-3.72,-38.54,4.1],["Belo Horizonte","Brazil",-19.92,-43.94,5.9],
["Curitiba","Brazil",-25.43,-49.27,3.7],["Recife","Brazil",-8.05,-34.88,4.1],
["Porto Alegre","Brazil",-30.03,-51.23,4.3],["Manaus","Brazil",-3.12,-60.02,2.3],
["Guadalajara","Mexico",20.66,-103.35,5.3],["Monterrey","Mexico",25.69,-100.32,5.3],
["Puebla","Mexico",19.04,-98.21,3.2],["Tijuana","Mexico",32.53,-117.02,2.2],
["Calgary","Canada",51.05,-114.07,1.6],["Ottawa","Canada",45.42,-75.70,1.5],
["Edmonton","Canada",53.55,-113.49,1.5],["Winnipeg","Canada",49.90,-97.14,0.83],
["Halifax","Canada",44.65,-63.57,0.44],["Fairbanks","USA",64.84,-147.72,0.03],
["Salt Lake City","USA",40.76,-111.89,1.3],["Las Vegas","USA",36.17,-115.14,2.3],
["Portland","USA",45.52,-122.68,2.5],["Austin","USA",30.27,-97.74,2.3],
["San Antonio","USA",29.42,-98.49,2.6],["Kansas City","USA",39.10,-94.58,2.2],
["St. Louis","USA",38.63,-90.20,2.8],["Nashville","USA",36.16,-86.78,2.0],
["New Orleans","USA",29.95,-90.07,1.3],["Indianapolis","USA",39.77,-86.16,2.1],
["Columbus","USA",39.96,-82.99,2.1],["Cincinnati","USA",39.10,-84.51,2.3],
["Pittsburgh","USA",40.44,-79.99,2.4],["Charlotte","USA",35.23,-80.84,2.7],
["Orlando","USA",28.54,-81.38,2.7],["Tampa","USA",27.95,-82.46,3.2],
["Sacramento","USA",38.58,-121.49,2.4],["San Diego","USA",32.72,-117.16,3.3],
["Albuquerque","USA",35.08,-106.65,0.92],["Boise","USA",43.62,-116.20,0.77],
["Omaha","USA",41.26,-95.93,0.97],["Spokane","USA",47.66,-117.43,0.58],
["Perm","Russia",58.01,56.25,1.0],["Novosibirsk","Russia",55.03,82.92,1.6],
["Yekaterinburg","Russia",56.84,60.61,1.5],["Vladivostok","Russia",43.12,131.90,0.6],
["Krasnoyarsk","Russia",56.01,92.87,1.1],["St. Petersburg","Russia",59.93,30.34,5.4],
["Reims","France",49.26,4.03,0.32],["Toulouse","France",43.60,1.44,1.4],
["Marseille","France",43.30,5.37,1.6],["Lyon","France",45.76,4.84,2.3],
["Bristol","UK",51.45,-2.59,0.7],["Manchester","UK",53.48,-2.24,2.8],
["Glasgow","UK",55.86,-4.25,1.2],["Edinburgh","UK",55.95,-3.19,0.9],
["Birmingham","UK",52.48,-1.90,2.9],["Leeds","UK",53.80,-1.55,1.9]
];

// ---------- Constellation catalog ----------
// [name, RA hours, Dec degrees] — approximate center of each figure.
// Good enough for "is it roughly above the horizon" visibility checks,
// not for precision boundary work.
const CONSTELLATIONS = [
  ["Ursa Major",11.0,55],["Ursa Minor",15.5,78],["Cassiopeia",1.0,60],
  ["Cepheus",22.0,70],["Draco",17.0,65],["Camelopardalis",6.0,70],
  ["Andromeda",1.0,38],["Perseus",3.2,45],["Auriga",6.0,42],
  ["Lyra",18.8,37],["Cygnus",20.5,40],["Hercules",17.3,30],
  ["Bootes",14.7,31],["Corona Borealis",15.8,30],["Triangulum",2.1,32],
  ["Aries",2.5,20],["Taurus",4.5,15],["Gemini",7.0,22],
  ["Cancer",8.5,20],["Leo",10.7,15],["Virgo",13.2,-2],
  ["Libra",15.2,-15],["Scorpius",16.8,-30],["Sagittarius",19.0,-25],
  ["Capricornus",21.0,-18],["Aquarius",22.5,-10],["Pisces",0.5,10],
  ["Orion",5.5,5],["Canis Major",6.8,-22],["Canis Minor",7.6,6],
  ["Lepus",5.5,-19],["Monoceros",7.0,-4],["Ophiuchus",17.0,-8],
  ["Serpens",16.0,10],["Aquila",19.7,3],["Delphinus",20.7,12],
  ["Sagitta",19.7,18],["Pegasus",22.7,19],["Equuleus",21.2,7],
  ["Corvus",12.4,-18],["Crater",11.4,-15],["Hydra",10.0,-15],
  ["Sextans",10.3,0],["Canes Venatici",13.1,40],["Lynx",7.9,47],
  ["Coma Berenices",12.8,23],["Scutum",18.7,-10],
  ["Sculptor",0.4,-32],["Fornax",2.8,-31],["Piscis Austrinus",22.0,-30],
  ["Eridanus",3.5,-28],["Cetus",1.7,-10],["Columba",5.8,-35],
  ["Puppis",7.3,-31],["Vela",9.5,-47],["Carina",8.7,-60],
  ["Centaurus",13.0,-47],["Crux",12.4,-60],["Lupus",15.3,-42],
  ["Norma",16.0,-52],["Ara",17.4,-56],["Corona Australis",18.9,-41],
  ["Telescopium",19.3,-51],["Pavo",19.6,-65],["Grus",22.5,-46],
  ["Tucana",23.8,-65],["Phoenix",1.0,-48],["Dorado",5.2,-60],
  ["Reticulum",3.9,-60],["Hydrus",2.3,-75],["Octans",21.0,-83],
  ["Chamaeleon",10.7,-79],["Musca",12.6,-70],["Apus",16.0,-75],
  ["Triangulum Australe",16.1,-65],["Indus",21.3,-58],
  ["Microscopium",20.9,-36],["Vulpecula",20.2,24],
  ["Lacerta",22.4,46]
];

// Galactic center (Milky Way core), J2000 — Sagittarius A*
const GALACTIC_CENTER = { ra: 17.7611, dec: -28.936 };

// ---------- Spherical astronomy ----------
function toJulianDate(date){
  return date.getTime() / 86400000 + 2440587.5;
}
function gmstHours(jd){
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
             + 0.000387933 * T * T - (T * T * T) / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst / 15;
}
function lstHours(jd, lonDeg){
  let lst = gmstHours(jd) + lonDeg / 15;
  return ((lst % 24) + 24) % 24;
}
// Returns { altitude, azimuth } in degrees. Azimuth measured from North, through East.
function altAz(raHours, decDeg, latDeg, lonDeg, date){
  const jd = toJulianDate(date);
  const lst = lstHours(jd, lonDeg);
  let ha = (lst - raHours) * 15;
  ha = ((ha + 540) % 360) - 180;
  const haR = ha * Math.PI / 180;
  const decR = decDeg * Math.PI / 180;
  const latR = latDeg * Math.PI / 180;
  const sinAlt = Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(haR);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const cosAz = (Math.sin(decR) - Math.sin(alt) * Math.sin(latR)) / (Math.cos(alt) * Math.cos(latR));
  const sinAz = -Math.sin(haR) * Math.cos(decR) / Math.cos(alt);
  let az = Math.atan2(sinAz, cosAz) * 180 / Math.PI;
  az = ((az % 360) + 360) % 360;
  return { altitude: alt * 180 / Math.PI, azimuth: az };
}
function haversineKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ---------- US National Parks ----------
// [name, state(s), lat, lon] — approximate coordinates of each park's
// general area (not a specific overlook). Astrophotographers commonly use
// these as darker-sky location presets; the same distance-from-cities
// heuristic below runs against these coordinates just like any other point.
const NATIONAL_PARKS = [
["Acadia","ME",44.35,-68.21],["American Samoa","AS",-14.25,-170.68],
["Arches","UT",38.73,-109.59],["Badlands","SD",43.75,-102.50],
["Big Bend","TX",29.25,-103.25],["Biscayne","FL",25.49,-80.21],
["Black Canyon of the Gunnison","CO",38.58,-107.72],["Bryce Canyon","UT",37.59,-112.19],
["Canyonlands","UT",38.30,-109.90],["Capitol Reef","UT",38.37,-111.26],
["Carlsbad Caverns","NM",32.17,-104.44],["Channel Islands","CA",34.01,-119.42],
["Congaree","SC",33.78,-80.78],["Crater Lake","OR",42.90,-122.10],
["Cuyahoga Valley","OH",41.24,-81.55],["Death Valley","CA",36.50,-117.10],
["Denali","AK",63.10,-151.00],["Dry Tortugas","FL",24.63,-82.87],
["Everglades","FL",25.29,-80.90],["Gates of the Arctic","AK",67.78,-153.30],
["Gateway Arch","MO",38.63,-90.19],["Glacier","MT",48.70,-113.80],
["Glacier Bay","AK",58.50,-137.00],["Grand Canyon","AZ",36.06,-112.14],
["Grand Teton","WY",43.79,-110.68],["Great Basin","NV",39.00,-114.22],
["Great Sand Dunes","CO",37.73,-105.51],["Great Smoky Mountains","TN/NC",35.68,-83.53],
["Guadalupe Mountains","TX",31.92,-104.87],["Haleakalā","HI",20.72,-156.17],
["Hawaii Volcanoes","HI",19.38,-155.20],["Hot Springs","AR",34.51,-93.05],
["Indiana Dunes","IN",41.65,-87.05],["Isle Royale","MI",48.10,-88.55],
["Joshua Tree","CA",33.87,-115.90],["Katmai","AK",58.60,-155.00],
["Kenai Fjords","AK",59.90,-149.65],["Kings Canyon","CA",36.80,-118.55],
["Kobuk Valley","AK",67.55,-159.28],["Lake Clark","AK",60.97,-153.42],
["Lassen Volcanic","CA",40.49,-121.42],["Mammoth Cave","KY",37.19,-86.10],
["Mesa Verde","CO",37.18,-108.49],["Mount Rainier","WA",46.85,-121.75],
["New River Gorge","WV",37.90,-81.07],["North Cascades","WA",48.70,-121.20],
["Olympic","WA",47.80,-123.60],["Petrified Forest","AZ",34.90,-109.80],
["Pinnacles","CA",36.48,-121.16],["Redwood","CA",41.20,-124.00],
["Rocky Mountain","CO",40.30,-105.70],["Saguaro","AZ",32.25,-110.50],
["Sequoia","CA",36.49,-118.57],["Shenandoah","VA",38.53,-78.35],
["Theodore Roosevelt","ND",46.97,-103.45],["Virgin Islands","VI",18.33,-64.73],
["Voyageurs","MN",48.50,-92.88],["White Sands","NM",32.78,-106.17],
["Wind Cave","SD",43.57,-103.48],["Wrangell-St Elias","AK",61.00,-142.00],
["Yellowstone","WY/MT/ID",44.60,-110.50],["Yosemite","CA",37.75,-119.50],
["Zion","UT",37.30,-113.05]
];

// ---------- Star trail rate ----------
// Sidereal angular rate at the celestial equator, arcsec/sec.
const SIDEREAL_RATE_ARCSEC_S = 15.0410;
// A star's trail rate falls off with cos(declination) — stars near a
// celestial pole trace tight arcs, stars near the celestial equator trail
// at the full rate. This is standard spherical astronomy, the same
// declination term used in extended NPF-rule derivations.
function starTrailArcsec(decDeg, seconds){
  return SIDEREAL_RATE_ARCSEC_S * seconds * Math.cos(decDeg * Math.PI / 180);
}

// Distance-and-population proxy, NOT measured sky brightness. Returns a
// bucket matching the app's existing SKY_EV_BASE keys, plus the nearest
// city for transparency about how the estimate was derived.
function estimateLightPollution(lat, lon){
  let score = 0;
  let nearest = null, nearestDist = Infinity;
  for(const [name, country, clat, clon, pop] of CITY_DATA){
    const d = haversineKm(lat, lon, clat, clon);
    if(d < nearestDist){ nearestDist = d; nearest = { name, country, pop, dist: d }; }
    if(d < 300){
      score += pop / Math.pow(d/10 + 1, 2);
    }
  }
  const pct = Math.round(100 * (1 - Math.exp(-score * 1.2)));
  let bucket;
  if(pct < 10) bucket = 'pristine';
  else if(pct < 30) bucket = 'rural';
  else if(pct < 50) bucket = 'transition';
  else if(pct < 75) bucket = 'suburban';
  else bucket = 'urban';
  return { pct, bucket, nearest };
}
