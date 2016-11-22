Social JS 2.0.0-beta
==================
Social JS is a Javascript to easily create share buttons for the most common social media sites. It's built in a way that requires almost no knowledge in javascript but depends instead of the use of data attributes.

[View Demo](http://andreasnorman.com/socialjs/)

<div style="text-align:center">
<img src="https://github.com/SubZane/socialjs/raw/master/demo/img/logo.png" alt="Social JS"/>
</div>


##Features
* Twitter - [API for fetching counts is shutdown](https://blog.twitter.com/2015/hard-decisions-for-a-sustainable-platform)
* Facebook
* LinkedIn
* Google Plus
* Reddit
* Can fetch share count for each social media. Requires server side client to provide a count for Google Plus. A PHP client is provided.

##Browser Support
* Google Chrome
* Internet Explorer 10+
* Firefox
* Safari 8+

##Installation
```
bower install socialjs --save
```

###Setup
```html
<!-- and you'll need to include socialjs of course! -->
<script src="socialjs.min.js"></script>
```
##Usage
```javascript
socialjs.init();
```

###Settings and Defaults
```javascript
options: {
  container: '.socialjs',
  fetchCounts: true,
  shortCount: true,
  https: true,
  urls: {
    GooglePlus: 'backend/GooglePlusCall.php',
    Facebook: 'http://graph.facebook.com/',
    Linkedin: 'http://www.linkedin.com/countserv/count/share',
    Reddit: 'http://www.reddit.com/api/info.json'
  },
  onInit: function () {},
  OnAttachEvents: function () {},
  onDestroy: function () {},
  onClick: function () {}
};
```
* `fetchCounts`: Default true. If the plugin should fetch share count or not.
* `shortCount`: Default true. Show total by k or M when number is to big.
* `https`: Defaults false. Set to true to change all requests from HTTP to HTTPS.
* `GooglePlus`: Path to server side google plus client.
* `Facebook`: URL to REST Service. Don't change unless you know what your doing.
* `Linkedin`: URL to REST Service. Don't change unless you know what your doing.
* `Reddit`: URL to REST Service. Don't change unless you know what your doing.
* `onInit`: Executes when initialized.
* `OnAttachEvents`: Executes when finished attaching all events.
* `onClick`: Executes when user clicks any share button.
* `onDestroy`: Executes when plugin is removed/destroyed.

###Required classes, data-attributes and elements.
* `.sharebutton`: Required. Class of the `<a href>` element containing all data-attributes.
* `data-sharetype`: Required. To tell the script what social media it is. Supports twitter, facebook, linkedin or googleplus
* `data-basecount`: Optional. If you want to cheat or have moved pages or switched domain but want to keep the old count you can add this and specify a number
* `data-text`: Optional. If not specified the plugin will take the title of the page as text.
* `data-via`: Only for Twitter. Optional. The creator of the content. Usually your twitter name without the @
* `data-related`: Only for Twitter. Optional. The creator of the content. Usually your twitter name without the @

If you want a count to be presented you'll need to add a `span` element inside the `<a href>`

###Public methods
Exposed methods that you can access and use. The count methods is best to use within the `onLoad` hook since the count will be fetched by and Ajax request.
* `getCount.Total`: getTotalCount,
* `getCount.Facebook`: getFacebookCount,
* `getCount.GooglePlus`: getGooglePlusCount,
* `getCount.Linkedin`: getLinkedinCount,
* `getCount.Reddit`: getTwitterCount

####How to use a public method
In this example we alert the count of all Facebook shares.
```javascript
socialjs.init();
alert(socialjs.getCount.Facebook());
```

###Typical setup
This could be your typical script setup for a facebook share button.

```javascript
socialjs.init();
```

```html
<div class="socialjs">
  <a class="sharebutton facebook" data-basecount="249" data-sharetype="facebook" data-text="The neat page title" title="Share this on Facebook" href="#"><span class="count"></span></a>
</div>
```

###About server side Google Plus clients
Currently I have only written one in PHP but you can write your own in any language really. The only thing you need to know is that the expected return value from the client is a number and nothing else.

If you want to contribute with a C# client or a client in any other language please do! Just fork and pull request.

##change log
####2.1.0
* CHANGE: Added option to set all requests from HTTP to HTTPS.

####2.0.0-beta
* CHANGE: Rewritten in vanilla Javascript. No dependencies needed.

####0.7.0
* CHANGE: Removed Twitter Count support due to Twitter: [Read their blogpost here](https://blog.twitter.com/2015/hard-decisions-for-a-sustainable-platform)

####0.6.0
* Added support for Reddit
* Renamed to Social JS since SimpleShareButtons already existed

####0.5.0
* First real public release
