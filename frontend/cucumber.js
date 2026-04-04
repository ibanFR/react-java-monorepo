export default {
  paths: ['src/features/**/*.feature'],
  import: [
    'src/features/support/world.ts',
    'src/features/step_definitions/**/*.ts',
  ],
  format: ['progress-bar'],
}
