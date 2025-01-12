import { ImageData, getNounSeedFromBlockHash, getNounData } from '@nouns/assets';
import { buildSVG, PNGCollectionEncoder } from '@nouns/sdk';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { readPngFile } from 'node-libpng';

// In some versions, the palette is nested under ImageData:
const { palette } = ImageData;
const suitcasePngPath = 'custom-assets/suitcase/suitcase.png';
// // Mock values for demo (replace these with real data from ethers/Web3)
// const nextNounId = 999; // E.g. currentAuctionedNounId + 1
// const latestBlockHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

async function main() {

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
  // 3) read your custom suitcase.svg from disk
  const suitcasePath = path.join(__dirname, '..', 'custom-assets','suitcase', 'suitcase.png');
  console.log('Attempting to read from path:', suitcasePath);
  
  // 3.1) Read the PNG file into memory
  const pngData = await readPngFile(suitcasePngPath);

  // 3.2) Create a PNGCollectionEncoder and encode the image
  // This appends the RLE data into encoder.data under the folder/name keys
  const encoder = new PNGCollectionEncoder();
  encoder.encodeImage('my-suitecase', pngData, 'custom'); 
    // 'my-suitecase' is the trait name
    // 'custom' is a folder/category name (arbitrary)

  // 3.3) Retrieve the encoded RLE from encoder.data
  //  The structure is: encoder.data[folderKey][traitName]
  const encodedSuitcaseRLE = encoder.data['custom']['my-suitecase'];
  console.log('Encoded suitcase RLE (first 50 chars):', encodedSuitcaseRLE.slice(0, 50), '...');
  
  

  // 4) Push the custom suitecase onto the parts
  //    array so it appears on top of the other
  //    layers.

  console.log('parts length BEFORE push:', parts.length);
  parts.push({
    filename: 'my-suitecase',
    data: encodedSuitcaseRLE,
  });
  console.log('parts length AFTER push:', parts.length);
  console.log('Official parts AFTER adding suitcase:', JSON.stringify(parts, null, 2));

  // 5) Build the SVG as a string
  console.log('Calling buildSVG now...');
  const svgBinary = buildSVG(parts, palette, background);

  // 6) Convert that SVG string to base64
  // In Node.js, you can do:
  const svgBase64 = Buffer.from(svgBinary, 'utf8').toString('base64');

  // If you’re in a browser environment, you might do:
  // const svgBase64 = btoa(svgBinary);

  console.log('SVG string:', svgBinary);
  console.log('SVG base64:', svgBase64);
  
 const svgString = svgBinary;

  //    Create or confirm the output folder
  //    In this example, we create a folder named "images" at the root.
  //    __dirname = the folder of *this* file (i.e. src).
  //    We step one level up and then into "images".
  const imagesDir = path.join(__dirname, '..', 'images');
  
  // If folder doesn't exist, create it
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  // Write the SVG file to the images folder
  const outFile = path.join(imagesDir, 'noun.svg');
  fs.writeFileSync(outFile, svgString, 'utf8');
  
  // Log a success message
  console.log(`Wrote noun.svg to disk at: ${outFile}`);

}

main();
