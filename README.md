# COML - Component Markup Language

COML is a javascript library that lets you build an SPA (Single Page Application) using normal html syntax pages.

## Building COML

1. Install Typescript
2. run `npm run build`

## Running the demo

1. Build COML (So `./js/coml/coml.js` exists)
2. CD to `./script` in a terminal
3. Run `node DemoServer.js` 
4. Open `http://localhost/index.html`

# Using COML

## CoElements

In COML you create CoElements - these are elements that look and behave just like normal html elements (`<div>` or `<span>`) but also have behavior that makes them useful as interactive components of an SPA.

Here is an html fragment that contains the  CoElement `<ws-pagecontainer>` that builds an area where other pages can be swapped in or out.

```html
<div class="u-outer">
    <ws-pagecontaner></ws-pagecontainer>
</div>
```

COML pages can contain logic - here is an example of a `for` loop:

```html
<!--Fixed count:-->

 <for count="10" countername="cnx">
     <div>${this.cnx}</div>
 </for>

 <!-- Over a list in an attribute 'in' -->
 <for in="Oranges,Apples,Bananas" countername="fruit">
    
        <div>${this.fruit}</div>
    
 </for>
```

## Scripts

Each COML page is a Javascript class instance that contains its own logic. You can freely declare and use functions
in the html header of the COML page:

```html
<head>
<script>
    console.log(`------------------Here-------------------`);
    // `this` points to this COML page instance. It has some useful functions
    // (See coml/This.ts), and you can freely declare methods and variables for your
    // business logic:

    // a field
    this.counter=0;

    // a function 
    this.clicked = (e)=>{
        this.counter++;
        console.log('clicked');

        // the pre-dclared function invalidate() repains the selected element:
        this.invalidate('.hello-div1');
    }
</script>
</head>
<body>
    <div class="hello-div2" onclick="this.clicked(event)">
        Click Me! ${this.counter}
    </div>
</body>
```

`this` can be referred to anywhere in the COML page using the standard Javascript '\`' template literals and will expand to the given expression. You can also refer to `this` in script fragments inside event handling attributes (see `onclick="this.clicked(event)"` above).

## COML pages as CoElements

Every COML page is itself a CoElement. This lets you build SPAs of any complexity by defining each functionality as a COML page, then using that as a CoElement in other pages.

Suppose you define a pictureframe page in coml:

```html
<!-- file pictureframe.html -->
<html>
    <head>
        <script>
        // define any logic for the picture frame
        </script>
        <style>
            /* define some styles, make the frame look pretty */
        </style>    
    </head>
    <body>
        <div class="frame-outer">
            <div class="frame-inner">
                <img src="someimage.png"></img>
            </div>
        </div>
    </body>
</html>
```

You can now use that picture frame inside another page, lets call it `mywall.html`:

```html
<!-- file mywall.html -->
<html>
    <head>
        <script>
            // import the picture frame as the co element <co-pictureframe>:
            this.import({name:'pictureframe.html',type:'page'},'co-pictureframe');
        </script>
    </head>
    <body>
        <div class="wall-outer">
            <co-pictureframe></co-pictureframe><!-- first frame -->
            <co-pictureframe></co-pictureframe><!-- second frame -->
            <co-pictureframe></co-pictureframe><!-- third frame -->
        </div>
    </body>
</html>
```

## COML Templates

How can you 'inject' some detail into a co-element imported from a page?

By using the templating features of COML.

Here is the picture frame example but using templates (The only difference is the addition of `hole` and `plughole` attributes in  replaceable elements)

```html
<!-- file pictureframe.html -->
<html>
    <head>
        <!-- same as before -->
    </head>
    <body>
        <div class="frame-outer">
            <div class="frame-inner">
                <div hole="image"></div> <!-- replaced the previous hard-coded <img> -->
            </div>
        </div>
    </body>
</html>
```

Now you can decorate the wall with multiple pictureframes:

```html
<!-- file mywall.html -->
<html>
    <head>
        <script>
            // import the picture frame as the co element <co-pictureframe>:
            this.import({name:'pictureframe.html',type:'page'},'co-pictureframe');
        </script>
    </head>
    <body>
        <div class="wall-outer">
            <co-pictureframe> <!-- first frame -->
                <img src="lion.jpg" plughole="image"></img>
            </co-pictureframe>
            <co-pictureframe> <!-- another frame -->
                <img src="tiger.jpg" plughole="image"></img>
            </co-pictureframe>
            <co-pictureframe> <!-- third frame -->
                <img src="elephant.jpg" plughole="image"></img>
            </co-pictureframe>
        </div>
    </body>
</html>
```

`Templates` are html files that contain elements that are declared as 'holes'. A hole is a placeholder element that is replaced when another importing coml page declares inner content that identifies the hole to 'plug' using the `plughole` attribute.

In the above example, the pictureframe is used three times, and a different image is used to plug the hole called 'image' inside it.

### Embedded templates

Suppose you wanted to put a pictureframe inside another pictureframe like this:

```html
<co-pictureframe> <!-- outer frame -->

    <co-pictureframe> <!-- inner frame -->
        <img src="tiger.jpg" plughole="image"></img>
    </co-pictureframe>

    <img src="lion.jpg" plughole="image"></img>
</co-pictureframe>
```

Which image will get injected to the outer and inner frames? Both have the same plughole name, so it is likely the wrong image will be injected into one or the other frames.

To solve this problem, we can use an `sid` (Source ID) to differentiate the two:

```html
<co-pictureframe sid="outer"> <!-- outer frame -->

    <co-pictureframe> <!-- inner frame -->
        <img src="tiger.jpg" plughole="image"></img>
    </co-pictureframe>

    <img src="lion.jpg" plughole="outer.image"></img>
</co-pictureframe>
```

The `sid` can be used as a prefix to the plughole, solving the problem. If an `sid` is specified, COML treats the names of all holes in that template instance as being preceded by the sid and a '.' before matching up plugging elements to them. 

## Finding elements

In HTML you can use `document.querySelector(selector)` to fetch the element or node you want to manipulate. This works in COML as well, but there is one important difference.

COML generates elements in the target document on demand. If you make a change to the source document it will automatically regenerate the target document's elements  affected. Also, changes in internal state of a component can trigger a regeneration (through the 'invalidate' call).

So in general although `document.querySelector()` will work, you should not store the element reference for later use, as this element may get discarded due to regeneration.

It is recommended that you use the `this.$(selector)` call to access elements. This is similar to `document.querySelector()` but ensures that only elements generated by your source document are found.

## Handling events

HTML lets you define event handlers on an element either by declaring them as an attribute in the element, or by using javascript
to link events to a javacript function. Example: to handle the mouse `click` event, you can do `<div id="mydiv" onclick="myClickHandler(event)"></div>"` or `document.querySelector("#mydiv").addEventListener('click',myClickHandler)`.

You can use both ways in COML, but with the following dfferences:

1. To call event handling functions in your `This` object, use `this`, e.g. `<div id="mydiv" onclick="this.myClickHandler(event)"></div>"`

2. To use javascript, use `this.$("#mydiv",'addinglisteners',(elem)=> {elem.addEventListener("click",this.myClickHandler);})`

As explained before, COML will regenerate the document elements on demand (e.g. when `invalidate()` is called). Both ways above ensure that event handlers are not 'lost' because an element was regerenated after an event handler was added.

### Custom events

Javascript Custom events (also known as 'Synthetic Events', see https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events) are very useful for components to communicate higher level events to their using elements.

For example a COML Component that splits the screen via a draggable element may want to send a custom 'splitchanged' event to its user.

Handlers on custom elements can be easily added using the `co-on<eventname>` or `on<eventname` attribute, where `<eventname>` is te name of the element. For custom events use the `co-on<eventname>` for standard events, use the other. Both will work for either case, but the `co-on<eventname>` form makes it obvious which ones are custom events.

To handle the onsplit change, this is how the using code will attach this event handler:

```html
<html>

<head>
    <script>
        this.import({name:'split.html',type:'page'},'co-split');

        this.mySplitChanged =(e)=>{
            console.log('Called with event:');
            console.log(e);
        }
    </script>
</head>

<body>
    <div>
        <co-split split-type="updown" co-onsplitchange="this.mySplitChanged(event)">
            <div plughole="split1">
                Top
            </div>
            <div plughole="split2">
                Bottom
            </div>
        </co-split>

        
    </div>
</body>

</html>
```

To fire a custom event, use the `this.dispatchEvent(eventname)` function. The `split.html` component uses the following code to send the split ratio to any interested parties:

```javascript
 this.dispatchEvent('splitchange',{ratio:this.ratio});
```



