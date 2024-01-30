import {
  expect,
  describe,
  test,
  jest,
  beforeEach,
  beforeAll,
  afterAll
} from '@jest/globals';

import { tmpdir } from 'os'
import fsPromises from 'fs/promises'
import fs from 'fs'
import { join } from 'path'

import { createLayersIfNotExists } from '../../src/createLayers.js'
import { createFiles } from '../../src/createFiles.js'
import Util from '../../src/util.js';

function getAllFunctionsFromInstance(instance) {
  return Reflect.ownKeys(Reflect.getPrototypeOf(instance)).filter(method => method !== 'constructor')
}

function generateFilePath({ mainPath, defaultMainFolder, layers, componentName }) {
  return layers.map(layer => {
    // factory
    // factory/heroesFactory.js
    const filename = `${componentName}${Util.upperCaseFirstLetter(layer)}.js`

    // mainPath: /
    // defaultMainPath: src
    // layer: factory
    // filename: heroesFactory.js
    return join(mainPath, defaultMainFolder, layer, filename)
  })
}

describe('#Integration - Files - Files Structure', () => {
  const packageJSON = 'package.json'
  const packageJSONLocation = join('./test/integration/mocks', packageJSON)
  const config = {
    defaultMainFolder: 'src',
    mainPath: '',
    // Colocando sort porque o sistema retorna as pastas em ordem alfabética
    layers: ['service', 'factory', 'repository'].sort(),
    componentName: 'heroes'
  }

  beforeAll(async () => {
    config.mainPath = await fsPromises.mkdtemp(join(tmpdir(), 'layers-'))
    await fsPromises.copyFile(packageJSONLocation, join(config.mainPath, packageJSON))
    await createLayersIfNotExists(config)
  })

  afterAll(async () => {
    // await fsPromises.rm(config.mainPath, { recursive: true })
  })

  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('Repository class should have create, read, update and delete methods', async () => {
    const myConfig = {
      ...config
    }

    await createFiles(myConfig)
    // This fix a bug that the file is not writed when trying to import it
    await new Promise((r) => setTimeout(r, 500));
    const [_, repositoryFile] = generateFilePath(myConfig)

    const { default: Repository } = await import(repositoryFile)
    const instance = new Repository()

    const expectNotImplemented = fn => expect(() => fn.call()).rejects.toEqual("method not implemented!")

    expectNotImplemented(instance.create)
    expectNotImplemented(instance.read)
    expectNotImplemented(instance.update)
    expectNotImplemented(instance.delete)
  })

  test('Service should have the same signature of repository and call its methods', async () => {
    const myConfig = {
      ...config,
      layers: ['repository', 'service']
    }

    await createFiles(myConfig)
    // This fix a bug that the file is not writed when trying to import it
    await new Promise((r) => setTimeout(r, 500));
    const [repositoryFile, serviceFile] = generateFilePath(myConfig)

    const { default: Repository } = await import(repositoryFile)
    const { default: Service } = await import(serviceFile)

    const repository = new Repository()
    const service = new Service({ repository })

    const allRepositoryMethods = getAllFunctionsFromInstance(repository)

    allRepositoryMethods.forEach(method => jest.spyOn(repository, method).mockResolvedValue())

    getAllFunctionsFromInstance(service).forEach(method => service[method].call(service, []))

    allRepositoryMethods.forEach(method => expect(repository[method]).toHaveBeenCalled())
  })

  test('Factory instance should match layers', async () => {
    const myConfig = {
      ...config
    }

    await createFiles(myConfig)
    // This fix a bug that the file is not writed when trying to import it
    await new Promise((r) => setTimeout(r, 1000));

    const [factoryFile, repositoryFile, serviceFile] = generateFilePath(myConfig)

    const { default: Repository } = await import(repositoryFile)
    const { default: Service } = await import(serviceFile)
    const { default: Factory } = await import(factoryFile)

    const expectedInstace = new Service({ repository: new Repository() })
    const instance = Factory.getInstance()

    expect(instance).toMatchObject(expectedInstace)
    expect(instance).toBeInstanceOf(Service)
  })


})