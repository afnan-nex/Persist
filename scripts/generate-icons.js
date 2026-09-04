const fs = require('fs');
const path = require('path');
const { renderAsync } = require('@resvg/resvg-js');

async function main() {
  const bgSvg = fs.readFileSync(path.join(__dirname, '../ic_launcher_background.svg'));
  const fgSvg = fs.readFileSync(path.join(__dirname, '../ic_launcher_foreground.svg'));
  const monoSvg = fs.readFileSync(path.join(__dirname, '../ic_launcher_monochrome.svg'));

  // 1. Assets directory images
  console.log('Generating assets/ images...');
  const fg1024 = await renderAsync(fgSvg, { fitTo: { mode: 'width', value: 1024 } });
  const bg1024 = await renderAsync(bgSvg, { fitTo: { mode: 'width', value: 1024 } });
  const mono1024 = await renderAsync(monoSvg, { fitTo: { mode: 'width', value: 1024 } });

  const assetsDir = path.join(__dirname, '../assets');
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), fg1024.asPng());
  fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), fg1024.asPng());
  fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), bg1024.asPng());
  fs.writeFileSync(path.join(assetsDir, 'android-icon-monochrome.png'), mono1024.asPng());
  fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), fg1024.asPng());

  // 2. Android mipmaps
  const densities = [
    { name: 'mdpi', iconSize: 48, adaptiveSize: 108 },
    { name: 'hdpi', iconSize: 72, adaptiveSize: 162 },
    { name: 'xhdpi', iconSize: 96, adaptiveSize: 216 },
    { name: 'xxhdpi', iconSize: 144, adaptiveSize: 324 },
    { name: 'xxxhdpi', iconSize: 192, adaptiveSize: 432 },
  ];

  const resDir = path.join(__dirname, '../android/app/src/main/res');

  for (const density of densities) {
    const targetDir = path.join(resDir, `mipmap-${density.name}`);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`Generating mipmap-${density.name}...`);
    // Full legacy icon
    const iconPng = await renderAsync(fgSvg, { fitTo: { mode: 'width', value: density.iconSize } });
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconPng.asPng());
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), iconPng.asPng());

    // Adaptive icon layers
    const fgPng = await renderAsync(fgSvg, { fitTo: { mode: 'width', value: density.adaptiveSize } });
    const bgPng = await renderAsync(bgSvg, { fitTo: { mode: 'width', value: density.adaptiveSize } });
    const monoPng = await renderAsync(monoSvg, { fitTo: { mode: 'width', value: density.adaptiveSize } });

    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgPng.asPng());
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_background.png'), bgPng.asPng());
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_monochrome.png'), monoPng.asPng());
  }

  // Also clean up test_fg.png if exists
  const testFile = path.join(__dirname, '../test_fg.png');
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }

  console.log('All icons generated successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
