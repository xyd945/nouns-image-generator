import { ImageData, getNounSeedFromBlockHash, getNounData } from '@nouns/assets';
import { buildSVG } from '@nouns/sdk';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

// In some versions, the palette is nested under ImageData:
const { palette } = ImageData;

// // Mock values for demo (replace these with real data from ethers/Web3)
// const nextNounId = 999; // E.g. currentAuctionedNounId + 1
// const latestBlockHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

function main() {

  // Generate pseudo-random data for nextNounId and blockHash
  const nextNounId = Math.floor(Math.random() * 10000);
  const latestBlockHash = '0x' + crypto.randomBytes(32).toString('hex');

  console.log('Using nextNounId:', nextNounId);
  console.log('Using latestBlockHash:', latestBlockHash);

  // 1) Generate the `seed` for a particular Noun ID & block hash
  const seed = getNounSeedFromBlockHash(nextNounId, latestBlockHash);
  console.log('Seed:', seed);
  /**
   * Output example:
   *  {
   *    background: 1,
   *    body: 28,
   *    accessory: 120,
   *    head: 95,
   *    glasses: 15
   *  }
   */

  // 2) Get the trait parts + background color for that seed
  const { parts, background } = getNounData(seed);
  console.log('parts:', parts);
  console.log('background:', background);
  /**
   * Example output:
   *  {
   *    parts: [
   *      { filename: 'body-teal', data: '...' },
   *      { filename: 'accessory-txt-noun-multicolor', data: '...' },
   *      { filename: 'head-goat', data: '...' },
   *      { filename: 'glasses-square-red', data: '...' }
   *    ],
   *    background: 'e1d7d5'
   *  }
   */

  // 3) Build the SVG as a string
  const svgBinary = buildSVG(parts, palette, background);

  // 4) Convert that SVG string to base64
  // In Node.js, you can do:
  const svgBase64 = Buffer.from(svgBinary, 'utf8').toString('base64');

  // If you’re in a browser environment, you might do:
  // const svgBase64 = btoa(svgBinary);

  console.log('SVG string:', svgBinary);
  console.log('SVG base64:', svgBase64);
  
 const svgString = svgBinary;

  // 2. Create or confirm the output folder
  //    In this example, we create a folder named "images" at the root.
  //    __dirname = the folder of *this* file (i.e. src).
  //    We step one level up and then into "images".
  const imagesDir = path.join(__dirname, '..', 'images');
  
  // If folder doesn't exist, create it
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  // 3. Write the SVG file to the images folder
  const outFile = path.join(imagesDir, 'noun.svg');
  fs.writeFileSync(outFile, svgString, 'utf8');
  
  // 4. Log a success message
  console.log(`Wrote noun.svg to disk at: ${outFile}`);

}

main();
