The most obvious route for rendering large lists of data is to use virtual/infinite scrolling.

Outside of Vue, we should look to only render items currently visible within the viewport. This mechanism would use a small buffer with an observer item above and below for smooth scrolling.

Use the total height of the list if all items on that page are rendered and once it hits that height it will render the next set of items. (Index based approach)

Infinite scrolling is a great technique to apply with a large list of items. We rely on the backend to have proper query params available to make this simple.  We have a limit query and a page query.

After a user hits the intersection observer at the bottom of the list, you will fetch the consequent page on the server. `(?limit=50&page=1,2,3,etc…)`

In terms of utilizing Vue’s api for optimization:   - v-once can be used if an item’s data never changes after it’s initial render. (Prevents tracking dependencies on each item)

- shallowRef or shallowReactive applied to the main data array. This prevents Vue from making every nested property reactive.
- Memoization: you can use `computed` properties if the item’s perform expensive calculations in order to provide caching.
- If the items have complex logic based on certain events like @click or @mouseover we can add debouncing or throttling logic in order to prevent repeated rapid calculations.
- There are numerous libraries which help with optimization and automating above logic, libraries such as `cue-virtual-scroller` or `@tanstack/vue-virtual`
- Component should stay rather simple so each item efficiently renders.
- Can use `Vue Devtools` to identify and profile the browser where performance is bottlenecking / lacking
