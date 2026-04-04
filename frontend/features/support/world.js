import { setWorldConstructor, World } from '@cucumber/cucumber'

class CustomWorld extends World {
  browser = undefined

  context = undefined

  page = undefined

  artifactBaseName = undefined

  tracePath = undefined

  screenshotPath = undefined
}

setWorldConstructor(CustomWorld)
