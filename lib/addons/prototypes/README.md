# Optable Prebid Analytics Addon

This addon integrates Optable analytics with Prebid.js, allowing you to send auction and bid data to Optable for analysis. It is designed to be used as a plugin within your Optable SDK setup.

## Installation

1. **Configure Analytics**  
   Use the following code snippet to enable analytics and configure the integration withing your Optable SDK wrapper:

   ```js
   import OptablePrebidAnalytics from './analytics';
   // ...
   const tenant = 'my_tenant';
   const analyticsSample = sessionStorage.optableEnableAnalytics || 0.1;
   window.optable.runAnalytics = analyticsSample > Math.random();
   // ...

   window.optable.customAnalytics = function() {
      const customAnalyticsObject = {};
      // ...
      return customAnalyticsObject;
   }
   // ...
   if (window.optable.runAnalytics && tenant) {
     window.optable[`${tenant}_analytics`] = new window.optable.SDK({
       host: 'na.edge.optable.co',
       node: 'analytics',
       site: 'analytics',
       readOnly: true,
       cookies: false,
     });

     window.optable.analytics = new OptablePrebidAnalytics(window.optable[`${tenant}_analytics`], { analytics: true, tenant, debug: !!sessionStorage.optableDebug });
     window.optable.analytics.hookIntoPrebid(window.pbjs);
   }
   // ...
   ```

   - Replace 'my_tenant' with your Optable tenant name.
   - Optionally, implement `window.optable.customAnalytics` to add custom key-value pairs to each analytics event.

## Usage

- **Sampling**:  
  The `analyticsSample` variable controls the sampling rate. Set it to a float between 0 and 1 to control what fraction of users send analytics.

- **Debugging**:  
  Set `sessionStorage.optableDebug` to `true` to force analytics to run and enable debug logging.

- **Custom Analytics Data**:  
  Implement `window.optable.customAnalytics` to return an object with custom data to be included in analytics events.

## API

### `OptablePrebidAnalytics`

- **Constructor**:  
  `new OptablePrebidAnalytics(sdkInstance, options)`
  - `sdkInstance`: An instance of the Optable SDK.
  - `options`: Object with options such as `debug`, `analytics`, and `tenant`.

- **hookIntoPrebid(pbjs)**:  
  Hooks the analytics into the provided Prebid.js instance.

## Example

```js
window.optable.customAnalytics = function() {
  return {
    pageType: 'homepage',
    userSegment: 'premium'
  };
};
```
