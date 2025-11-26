export default {
  compilerOptions: {
    css: 'injected'
  },
  onwarn: (warning, handler) => {
    // Disable a11y-label-has-associated-control since we have multiple inputs per label (range + number)
    if (warning.code === 'a11y-label-has-associated-control') return;
    handler(warning);
  }
};

