const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
// dane

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };
  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  console.log(textData);
  await image.quality(100).writeAsync(outputFile);
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
};

//metody
const prepareOutputFilename = (filename) => {
  const [name, ext] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

// Start app
const startApp = async () => {
  //Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message: ' Hi! Welcome to "Watermark menager". Copy your image files to folder ',
      type: 'confirm',
    },
  ]);
  // if answer is no, just quit the app
  if (!answer.start) process.exit();
  // ask about input file and watermark type
  const options = await inquirer.prompt([
    {
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    },
    {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    },
  ]);
  if (options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([
      {
        name: 'value',
        type: 'input',
        message: 'Type your watermark text: ',
      },
    ]);
    try {
      if (fs.existsSync('./img/' + options.inputImage)) {
        options.watermarkText = text.value;
        addTextWatermarkToImage(
          './img/' + options.inputImage,
          './img/' + prepareOutputFilename(options.inputImage),
          options.watermarkText
        );
        console.log('Success');
        startApp();
      } else {
        console.log('cant find file.');
      }
    } catch (error) {
      console.log('Something went wrong ... Try again!');
    }
  } else {
    const image = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name : ',
        default: 'logo.jpg',
      },
    ]);
    try {
      if (fs.existsSync('./img/' + image.filename)) {
        options.watermarkImage = image.filename;

        addImageWatermarkToImage(
          './img/' + options.inputImage,
          './img/' + prepareOutputFilename(options.inputImage),
          './img/' + options.watermarkImage
        );
        console.log('Success');
        startApp();
      } else {
        console.log('Something went wrong');
      }
    } catch (error) {
      console.log('Something went wrong ... Try again!');
    }
  }
};

startApp();

//
// addImageWatermarkToImage('./test.jpg', './test-with-watermark2.jpg', './logo.jpg');
