export default {
  '*.(ts|tsx)': ['eslint --fix --ignore-pattern "templates"', 'prettier --write'],
  '*.(json)': ['prettier --write'],
};
