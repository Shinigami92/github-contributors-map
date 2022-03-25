// @ts-check

/**
 * @type {import('prettier').Options}
 */
module.exports = {
  plugins: [require.resolve('@prettier/plugin-pug'), require.resolve('prettier-plugin-organize-imports')],
  arrowParens: 'always',
  bracketSpacing: true,
  printWidth: 120,
  semi: true,
  singleQuote: true,
  pugSingleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  pugSortAttributesBeginning: [
    '^cols$',
    '^v-if$',
    '^v-else-if$',
    '^v-else$',
    '^:is$',
    '^v-for$',
    '^:key$',
    '^v-on(\\.\\w+)*$',
    '^v-bind$',
    '^ref$',
    '^v-model',
    '^name$',
    '^:?type$',
    '^:value$',
    '^v-text$',
    '^:?label$',
    '^:headers$',
    '^:items$',
    '^:?item-key$',
    '^:?item-text$',
    '^:?item-value$',
    '^:?item-disabled$',
    '^:?must-sort$',
    '^:?sort-by$',
    '^:?sort-desc$',
    '^:?placeholder$',
    '^:?src$',
    '^:?app$',
    '^:?color$',
    '^:?text-color$',
    '^:?background-color$',
    '^:?dark$',
    '^:?icon$',
    '^:?align$',
    '^:?justify$',
    '^:?dense$',
    '^:?small$',
    '^:?outlined$'
  ],
  pugSortAttributesEnd: [
    '^:?options$',
    '^@update:options',
    '^:?hint$',
    '^:?persistent-hint$',
    '^prepend-',
    '^@click:prepend',
    '^append-',
    '^@click:append',
    '^:to$',
    '^exact$',
    '^:(?!(width|height|loading|disabled|data-))',
    '^target$',
    '^:?width$',
    '^:?height$',
    '^@click',
    '^@',
    '^:loading$',
    '^:disabled$',
    '^:?data-'
  ]
};