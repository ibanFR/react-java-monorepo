import { CUCUMBER_STEP_TIMEOUT_MS } from './features/utils/config.js'

export default {
  default: {
    paths: ['features/**/*.feature'],
    import: ['features/support/**/*.js', 'features/step-definitions/**/*.js'],
    format: [
      'progress-bar',
      'json:reports/cucumber/report.json',
      'junit:reports/cucumber/junit.xml',
    ],
    publishQuiet: true,
    timeout: CUCUMBER_STEP_TIMEOUT_MS,
    parallel: 1,
  },
}
