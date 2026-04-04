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
    timeout: 60_000,
    parallel: 1,
  },
}
