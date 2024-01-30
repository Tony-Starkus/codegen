import fsPromises from 'fs/promises'
import fs from 'fs'
import templates from './templates/index.js'
import Util from './util.js'

const defaultDependencies = (layer, componentName) => {
  const dependencies = {
    repository: [],
    service: [`${componentName}Repository`],
    factory: [`${componentName}Repository`, `${componentName}Service`]
  }

  return dependencies[layer].map(Util.lowerCaseFirstLetter)
}

async function executeWrites(pendingFilesToWrite) {
  return await Promise.all(pendingFilesToWrite.map(({ fileNameToCreate, txtFile }) => {
    fsPromises.writeFile(fileNameToCreate, txtFile)
  }))
}

export async function createFiles({ mainPath, defaultMainFolder, layers, componentName }) {
  const keys = Object.keys(templates)
  const pendingFilesToWrite = []

  for (const layer of layers) {
    const chosenTemplate = keys.find(key => key.includes(layer))

    if (!chosenTemplate) return { error: 'the chosen layer doesnt have a template' }

    const template = templates[chosenTemplate]
    const targetFolder = `${mainPath}/${defaultMainFolder}/${layer}`
    const dependencies = defaultDependencies(layer, componentName)
    const { fileName, template: txtFile } = template(componentName, ...dependencies)

    const fileNameToCreate = `${targetFolder}/${Util.lowerCaseFirstLetter(fileName)}.js`
    pendingFilesToWrite.push({ fileNameToCreate, txtFile })
  }

  await executeWrites(pendingFilesToWrite)

  return { success: true }
}