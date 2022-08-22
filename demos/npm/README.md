# Optable Web SDK demo with NPM

This example uses [`npm`](https://www.npmjs.com/) to include [@optable/web-sdk](https://www.npmjs.com/package/@optable/web-sdk) package as a dependency. [`webpack`](https://webpack.js.org/) is used to bundle the SDK with the rest of the app in the `dist`.

## Build it locally

You need [`npm`](https://www.npmjs.com/) installed to install the dependencies.

```
$ cd path/to/optable-web-sdk/demos/npm
$ npm install # install dependencies
$ npm run build # bundle the HTML and JS files into dist folder
```

## Run it locally

After building the `dist`, simply open the file `optable-web-sdk/demos/npm/dist/index.html` in your browser.

## Modify it

You can change the code in `optable-web-sdk/demos/npm/src`. To see your changes in effect, build again with `npm run build` and open again (or refresh) the file `optable-web-sdk/demos/npm/dist/index.html`.

Note: if you are trying to contact your own DCN, make sure to update the hostname and site slug given to the SDK during initialization. Also, be sure to use [LocalStorage](https://github.com/Optable/optable-web-sdk#localstorage), as first-party cookie won't work between your local env and your DCN.
