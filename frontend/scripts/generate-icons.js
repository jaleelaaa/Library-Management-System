/**
 * PWA Icon Generator Script
 * Generates all required icon sizes from a source image
 *
 * Usage: node scripts/generate-icons.js
 *
 * Note: Requires sharp package
 * Install: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// Icon sizes required for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SOURCE_ICON = path.join(__dirname, '../public/logo.png');

async function generateIcons() {
  try {
    // Check if sharp is available
    let sharp;
    try {
      sharp = require('sharp');
    } catch (error) {
      console.log('sharp not found. Installing...');
      console.log('Please run: npm install --save-dev sharp');
      process.exit(1);
    }

    // Create icons directory if it doesn't exist
    if (!fs.existsSync(ICONS_DIR)) {
      fs.mkdirSync(ICONS_DIR, { recursive: true });
      console.log('Created icons directory');
    }

    // Check if source icon exists
    if (!fs.existsSync(SOURCE_ICON)) {
      console.error('Source icon not found at:', SOURCE_ICON);
      console.log('Creating a placeholder logo...');
      await createPlaceholderLogo();
    }

    console.log('Generating PWA icons...');

    // Generate icons for each size
    for (const size of ICON_SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);

      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 16, g: 107, b: 163, alpha: 1 }, // FOLIO blue
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${size}x${size} icon`);
    }

    // Generate favicon
    await sharp(SOURCE_ICON)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.png'));

    console.log('✓ Generated favicon');

    console.log('\n✅ All icons generated successfully!');
    console.log(`Icons saved to: ${ICONS_DIR}`);
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

async function createPlaceholderLogo() {
  try {
    const sharp = require('sharp');

    // Create SVG placeholder
    const svgLogo = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#106ba3"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">
          FOLIO
        </text>
        <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" dy=".3em">
          LMS
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svgLogo))
      .png()
      .toFile(SOURCE_ICON);

    console.log('✓ Created placeholder logo');
  } catch (error) {
    console.error('Error creating placeholder:', error);
  }
}

// Run the generator
generateIcons();
