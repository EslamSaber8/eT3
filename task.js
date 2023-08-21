const fs = require("fs")
const path = require("path")
const csvWriter = require("csv-writer")

function copyImages(sourceFolder, destinationFolder) {
  fs.readdirSync(sourceFolder, { withFileTypes: true }).forEach((entry) => {
    const fullEntryPath = path.join(sourceFolder, entry.name)
    if (entry.isFile()) {
      const destinationPath = path.join(destinationFolder, entry.name)
      fs.copyFileSync(fullEntryPath, destinationPath)
    } else if (entry.isDirectory()) {
      const newSourceFolder = path.join(sourceFolder, entry.name)
      copyImages(newSourceFolder, destinationFolder)
    }
  })
  console.log("Images copied successfully!")
}

function removePrefix(imageName) {
  const splitName = imageName.split("_")
  return splitName[1]
}

function getImageInfo(imagePath) {
  const stats = fs.statSync(imagePath)
  const imageName = path.basename(imagePath)
  const imageSize = stats.size
  const modificationTime = stats.mtime
  return { imageName, imageSize, modificationTime }
}

// Specify the source folder containing the image dataset
const sourceFolder = "./dairies"

// Specify the destination folder where all images will be copied
const destinationFolder = "./Images"

// Copy images from source folder and sub-folders to the destination folder
copyImages(sourceFolder, destinationFolder)

// Create a CSV writer to write the report
const writer = csvWriter.createObjectCsvWriter({
  path: "image_report.csv",
  header: [
    { id: "imageName", title: "Image Name" },
    { id: "imageSize", title: "Image Size (bytes)" },
    { id: "modificationTime", title: "Last Modification Time" },
  ],
})

const imageReport = []

// Iterate through the images in the dataset folder
fs.readdirSync(destinationFolder).forEach((imageFile) => {
  const imagePath = path.join(destinationFolder, imageFile)

  // Remove the prefix from the image name
  const imageName = removePrefix(imageFile)

  // Get image information
  const { imageSize, modificationTime } = getImageInfo(imagePath)

  // Add image details to the report
  imageReport.push({
    imageName,
    imageSize,
    modificationTime,
  })
})

// Write the report to the CSV file
writer
  .writeRecords(imageReport)
  .then(() => {
    console.log("Image report generated successfully!")
  })
  .catch((error) => {
    console.error("Error generating image report:", error)
  })