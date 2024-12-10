function aqiIndex(pollutant, concentration) {
  let il, ih, cl, ch;

  switch (pollutant.toLowerCase()) {
    case "pm2_5":
      if (concentration <= 12.0) {
        il = 0;
        ih = 50;
        cl = 0.0;
        ch = 12.0;
      } else if (concentration <= 35.4) {
        il = 51;
        ih = 100;
        cl = 12.1;
        ch = 35.4;
      } else if (concentration <= 55.4) {
        il = 101;
        ih = 150;
        cl = 35.5;
        ch = 55.4;
      } else if (concentration <= 150.4) {
        il = 151;
        ih = 200;
        cl = 55.5;
        ch = 150.4;
      } else if (concentration <= 250.4) {
        il = 201;
        ih = 300;
        cl = 150.5;
        ch = 250.4;
      } else if (concentration <= 350.4) {
        il = 301;
        ih = 400;
        cl = 250.5;
        ch = 350.4;
      } else if (concentration <= 500.4) {
        il = 401;
        ih = 500;
        cl = 350.5;
        ch = 500.4;
      } else {
        return 500;
      }
      break;

    case "pm10":
      if (concentration <= 54) {
        il = 0;
        ih = 50;
        cl = 0;
        ch = 54;
      } else if (concentration <= 154) {
        il = 51;
        ih = 100;
        cl = 55;
        ch = 154;
      } else if (concentration <= 254) {
        il = 101;
        ih = 150;
        cl = 155;
        ch = 254;
      } else if (concentration <= 354) {
        il = 151;
        ih = 200;
        cl = 255;
        ch = 354;
      } else if (concentration <= 424) {
        il = 201;
        ih = 300;
        cl = 355;
        ch = 424;
      } else if (concentration <= 504) {
        il = 301;
        ih = 400;
        cl = 425;
        ch = 504;
      } else if (concentration <= 604) {
        il = 401;
        ih = 500;
        cl = 505;
        ch = 604;
      } else {
        return 500;
      }
      break;

    case "co":
      if (concentration <= 4.4) {
        il = 0;
        ih = 50;
        cl = 0.0;
        ch = 4.4;
      } else if (concentration <= 9.4) {
        il = 51;
        ih = 100;
        cl = 4.5;
        ch = 9.4;
      } else if (concentration <= 12.4) {
        il = 101;
        ih = 150;
        cl = 9.5;
        ch = 12.4;
      } else if (concentration <= 15.4) {
        il = 151;
        ih = 200;
        cl = 12.5;
        ch = 15.4;
      } else if (concentration <= 30.4) {
        il = 201;
        ih = 300;
        cl = 15.5;
        ch = 30.4;
      } else if (concentration <= 40.4) {
        il = 301;
        ih = 400;
        cl = 30.5;
        ch = 40.4;
      } else if (concentration <= 50.4) {
        il = 401;
        ih = 500;
        cl = 40.5;
        ch = 50.4;
      } else {
        return 500;
      }
      break;

    case "o3":
      if (concentration <= 54) {
        il = 0;
        ih = 50;
        cl = 0;
        ch = 54;
      } else if (concentration <= 70) {
        il = 51;
        ih = 100;
        cl = 55;
        ch = 70;
      } else if (concentration <= 85) {
        il = 101;
        ih = 150;
        cl = 71;
        ch = 85;
      } else if (concentration <= 105) {
        il = 151;
        ih = 200;
        cl = 86;
        ch = 105;
      } else if (concentration <= 200) {
        il = 201;
        ih = 300;
        cl = 106;
        ch = 200;
      } else {
        return 500;
      }
      break;

    case "so2":
      if (concentration <= 35) {
        il = 0;
        ih = 50;
        cl = 0;
        ch = 35;
      } else if (concentration <= 75) {
        il = 51;
        ih = 100;
        cl = 36;
        ch = 75;
      } else if (concentration <= 185) {
        il = 101;
        ih = 150;
        cl = 76;
        ch = 185;
      } else if (concentration <= 304) {
        il = 151;
        ih = 200;
        cl = 186;
        ch = 304;
      } else if (concentration <= 604) {
        il = 201;
        ih = 300;
        cl = 305;
        ch = 604;
      } else if (concentration <= 1004) {
        il = 301;
        ih = 400;
        cl = 605;
        ch = 1004;
      } else if (concentration <= 1504) {
        il = 401;
        ih = 500;
        cl = 1005;
        ch = 1504;
      } else {
        return 500;
      }
      break;

    case "no2":
      if (concentration <= 53) {
        il = 0;
        ih = 50;
        cl = 0;
        ch = 53;
      } else if (concentration <= 100) {
        il = 51;
        ih = 100;
        cl = 54;
        ch = 100;
      } else if (concentration <= 360) {
        il = 101;
        ih = 150;
        cl = 101;
        ch = 360;
      } else if (concentration <= 649) {
        il = 151;
        ih = 200;
        cl = 361;
        ch = 649;
      } else if (concentration <= 1249) {
        il = 201;
        ih = 300;
        cl = 650;
        ch = 1249;
      } else if (concentration <= 2049) {
        il = 301;
        ih = 400;
        cl = 1250;
        ch = 2049;
      } else if (concentration <= 3049) {
        il = 401;
        ih = 500;
        cl = 2050;
        ch = 3049;
      } else {
        return 500;
      }
      break;

    default:
      throw new Error("Unsupported pollutant type.");
  }

  const aqi = ((ih - il) / (ch - cl)) * (concentration - cl) + il;
  return Math.round(aqi);
}

module.exports = aqiIndex;
