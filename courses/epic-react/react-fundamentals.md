## Basic [[JavaScript]]

When we open an HTML document in a browser, it reads that code and turns it into the [[DOM]].

That [[DOM]] is what we manipulate with our [[JavaScript]] code.

[[JavaScript]] frameworks will create a virtual [[DOM]] and pass that to the browser.

This gives us a much more declarative API.

This will allow the abstraction of having to deal with event handlers, attribute manipulation and manual DOM updating.

```javascript
const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.append(root);
const element = document.createElement("div");
element.textContent = "Hello World!";
element.className = "container";
root.append(element);
```

## Basic [[React]]

React supports multiple platform, so we need to modules to write React for the web

`React` which creates the React elements

`ReactDOM` which renders the React elements into a DOM.

````javascript
const root = document.getElementById('root')
const element = React.createElement('div', {
  className: 'container',
  children: 'Hello World'
})

ReactDOM.render(element, root)```

```javascript
const root = document.getElementById('root')
const element = React.createElement('div', {
  className: 'container',
  children: [
    React.createElement('span', 'Hello'),
    React.createElement('span', 'World!')
  ]
})

ReactDOM.render(element, root)
````

## JSX

JSX is easier to read and write than creating nested `React.createElement` functions.
Since JSX is not [[JavaScript]] we need a compiler like [[Babel]] to translate it.

This is how Babel translates JSX
https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=usage&spec=false&loose=false&code_lz=MYewdgzgLgBArgSxgXhgHgCYIG4D40QAOAhmLgBICmANtSGgPRGm7rNkDqIATtRo-3wMseAFBA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=true&targets=&version=7.12.3&externalPlugins=

We can use functions that return something that React can render to make our app more powerful

```javascript
function message({ children }) {
  return <div className="message">{children}</div>;
}
const element = <div className="container">{message("Hello World!")}</div>;

ReactDOM.render(element, document.getElementById("root"));
```

```javascript
function message({children}) {
  return <div className="message">{children}</div>
}
const element = (
  <div className="container">
  	React.createElement(message, {children: 'Hello World!'})
  </div>
)

ReactDOM.render(element, document.getElementById('root'))
```

```javascript
function Message({ children }) {
  return <div className="message">{children}</div>;
}
const element = (
  <div className="container">
    <Message>Hello World!</Message>
  </div>
);

ReactDOM.render(element, document.getElementById("root"));
```

## [[PropTypes]]

We want to make sure out components receive the props they need to be rendered properly, so we add functions that will check the props.

```javascript
const PropTypes = {
  string(props, propName, componentName) {
    if(!)
    if(typeof props[propName] !== 'string') {
      throw new Error(`The ${componentName} prop ${propName} must be of type String. It was pass a ${typeof props[propName]}`)
    }
  }
}
function Message({subject, greeting}) {
  return <div className="message">{greeting}, {subject}</div>
}
Message.propTypes = {
  subject: PropTypes.string,
  greeting: PropTypes.string.isRequired
}
```

A DOM component is `<div>` or `<button>`
A composite component is a custom React component like `<App />` or `<Route />`
