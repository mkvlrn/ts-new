export default {
  '*.(ts|tsx)': ['eslint --fix', 'prettier --write', 'vitest related --run'],
  '*.(json)': ['prettier --write'],
};
