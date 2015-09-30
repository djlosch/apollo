## What is Apollo?

If you're getting adblocked, you should know what the impact is.  Apollo is an adblock detector that you embed on your pages and use to measure the percentage of your userbase using adblock.

## Why use Apollo instead of [other package]?

* Apollo is ***free***.  I/we run way too many sites... paying for a trivial-to-write client side test with pricing scaling up based on sites or datapoints is absurd.
* Apollo is ***stupid easy to install***.  It's one line of javascript.
* Apollo is ***open source***.  Seriously, integrate it and mod it all you want.  It's on the [MIT License](https://en.wikipedia.org/wiki/MIT_License).  No GPL issues here.  Also, there's no weird cookie drop issues because you can self-host it... keep your data to yourself.
* Apollo is ***hosted*** on Github's CDN.  If you want to host it yourself, go ahead.  If you don't, just use GitHub's CDN, as used in the examples below.  Make sure you check out how to use sampling though if you have high traffic.
* Apollo is ***ultra light-weight***.  It's a single script, and doesn't call jQuery or any other libs.  Since it's also open source, and the source is tiny, you can glance through it in under 30 seconds to know it's kosher.
* Apollo uses ***Event tracking*** in [Google Analytics](http://www.google.com/analytics/) (GA), so if you know how to use GA, you know how to read Apollo reports.  Note: Apollo is not supported or endorsed by Google or Google Analytics.
* Apollo has ***sampling***.  If you've ever run Event tracking on a large site, you quickly realize how fast you can hit the [data point quota in GA](https://developers.google.com/analytics/devguides/collection/analyticsjs/limits-quotas?hl=en).  Sampling allows you to run the test on a random percentage of your visitors.
* Apollo has a ***timeout***.  Some sites/companies lazy load ad units or other scripts, so if you fire all tests immediately, the metric is measured before the event can accurately be logged in GA.  Some adblockers also don't load instantly, so you'll want to wait a tiny amount of time anyways (10+ ms).  You can mod the timeout, or leave it at the default 100ms.
* Apollo's ***default settings are customizable***, from sampling to timeout to the name of the div that's used for the adblock test, to the GA Event category/action/label.

## How does it work / What method does Apollo use?

Adblockers use filter matching -- they check element ids and classes.  If there's a match, the adblocker reduces the element height to zero, or removes it from the page entirely.  

By default, Apollo checks a div known to be filtered -- if the height is zero, or the div is removed from the page, it concludes that adblocking is enabled.  Apollo attempts to log the adblock detector results to your [Google Analytics](http://www.google.com/analytics/) profile.  Once you've added the script to your page, you'll see the results in the Events section (Behavior > Events > Top Events).  The default category is `adblock (apollo)` (you can change this if you want... examples below).  Apollo supports universal analytics (analytics.js) which uses `ga()`, or either legacy implementations from ga.js (`trackEvent()` and `_gaq.push()`).

## What's the license on Apollo?

[MIT](https://en.wikipedia.org/wiki/MIT_License).  Pull requests and courtesy beer are encouraged but not required.

## How do I test this out and set it up?

**Step 1**: Make sure you have GA set up on your page.

**Step 2**: Pull up your test server.  Embed the following javascript tag in your HTML, somewhere near or in your footer, preferably as the last thing on the page before your `</footer>` or `</body>` tag.  We're going to turn on verbose reporting temporarily, but this is just so you can see what's going on...

    <script src="//djlosch.github.io/apollo/apollo.js?verbose=true"></script>

**Step 3**: Load the page you included this tag on in your browser.  Open the javascript console (in most browsers, right click, select "Inspect Element" and then click the Console tab) and refresh.  Since you added the tag with `verbose=true`, you should see diagnostic output in the console.  Play around with page refreshes with adblock enabled and disabled.  If you open up the Real Time > Events section in GA, you'll even see the events firing.

**Step 4**: Customize the options to your use case.  All of these have default settings.  Examples are below for production deployments.

* `id (string)` : you can mod Apollo to use a known ad unit on your page.  Do not include the hash sign.  If you do not specify an id, Apollo will add a 300x250 empty div offpage, which is confirmed to be adblocked by popular filters, and then test whether the div is blocked for the visitor.

* `sampling (int)` : percentage of pageviews Apollo should test adblocking.  By default, Apollo tests every pageview.  For high-traffic sites, this can really pollute your Google Analytics profile.  Unless you've upgraded to a premium package, the number of datapoints you get per day can easily get blown out by event tracking.  Larger sites will frequently want to drop this down to 10 or lower.  DO NOT include a percent sign.

* `verbose (bool)` : whether you want diagnostic info to be displayed.  When you push this code live, you should have verbose turned off.

* `timeout (int)` : time to wait before testing any adblocking, in milliseconds.  Some setups lazy load ad divs and/or GA.  The timeout should usually be nonzero because even if you rush to load GA, it's not always immediately loaded before the visitor loads Apollo.  By default, the timeout is 100ms.

* `categoryBlocked (string)` : is the GA category that Apollo will submit when adblocking is confirmed.  By default, this is set to `adblock (apollo)`.

* `categoryUnblocked (string)` : is the GA category that Apollo will submit when no adblocking is confirmed.  By default, this is also set to `adblock (apollo)` (the same as the blocked category) so that you can easily look up all adblocking in a single category.

* `actionBlocked (string)` : is the GA action that Apollo will submit when adblocking is confirmed.  By default, this is set to `blocked`.

* `actionUnblocked (string)` : is the GA action that Apollo will submit when no adblocking is confirmed.  By default, this is set to `unblocked`.

* `labelBlocked (string)` : is the GA label that Apollo will submit when adblocking is confirmed.  By default, this is set to the path of the current page (`window.location.pathname`)

* `labelUnblocked (string)` : is the GA label that Apollo will submit when no adblocking is confirmed.  By default, this is set to the path of the current page (`window.location.pathname`)

## Production Ready Examples

Test adblock usage on 100% of pageviews, using a timeout of 100ms, using Apollo's default div.  Most sites are fine with this:

    <script src="//djlosch.github.io/apollo/apollo.js"></script>

Sample 50% of pageviews, on a div with `id="right-med-rec"`, with a timeout of 200ms.

    <script src="//djlosch.github.io/apollo/apollo.js?id=right-med-rec&timeout=200&sampling=50"></script>

Sample 10% of pageviews, on a div with `id="leaderboard"`, with a timeout of 50ms, modifying the GA actions to `leaderboard-blocked` and `leaderboard-unblocked` when the unit is blocked/unblocked respectively.

    <script src="//djlosch.github.io/apollo/apollo.js?id=leaderboard&timeout=50&sampling=10&actionBlocked=leadboard-blocked&actionUnblocked=leaderboard-unblocked"></script>

## Can I modify Apollo to block / redirect / maim users of adblock software?

Functionally, yes, because Apollo tests individual visitors' usage of adblock, you can tell exactly which users are using adblock.

The question is really *whether* you should terrorize them.  Before you do that, consider this: two major German publishers sued the largest adblock company.  Not only did the publishers lose their lawsuit, the news coverage exposed the technology to a lot of people who didn't previously know about adblocking.  This drove the adblocking rate up in Germany.  Way up.  Adblock usage varies by country and site audience, but the nationwide estimates for general audiences in most of the western world usually run 5-20%.  After this lawsuit, general audience adblock rates in Germany are as high as 40%+. 

Instead of terrorizing them, please consider alternate monetization strategies.  You'll want to add your logic to lines 154 and 152.

## Can I self-host or rename apollo.js?

Yes, you can, but if you do rename it, make sure you search the source and modify `scriptName` to match your filename.  The filename is used to import your config from its `$_GET` variables.
