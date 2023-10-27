## Context Module Functions #2020-10-14

This is the practice of creating helper functions to deal with the different kinds of dispatch, to take that work out of the component and leaving it nested with the rest of the context logic.

In this following example, the `increment` and `decrement` function would be the Context Module Functions.

```javascript
const CounterContext = React.createContext()

function CounterProvider({step = 1, initialCount = 0, ...props}) {
  const value = React.useReducer(
  	(state, action) {
    	const change = state.step ?? step
    	switch (action.type) {
    		case 'increment':
    			return {...state, count: state.count + change}
    		case 'decrement':
    			return {...state, count: state.count - change}
    		default:
    			throw new Error('Something went wrong.')
  		}
    },
      {count: initialCount}
  )

  return (
  	<CounterContext.Provider value={value} {...props} />
  )
}

function useCounter() {
  const context = React.useContext(CounterContext)
  if(!context) {
    throw new Error('useCounter hook must be used within a context provider')
  }
  return context
}

const increment = dispatch => dispatch({type: 'increment'})
const decrement = dispatch => dispatch({type: 'decrement'})
```

This is the practice of creating helper functions to deal with the different kinds of dispatch, to take that work out of the component and leaving it nested with the rest of the context logic.

In this following example, the `increment` and `decrement` function would be the Context Module Functions.

```javascript
const CounterContext = React.createContext()

function CounterProvider({step = 1, initialCount = 0, ...props}) {
  const value = React.useReducer(
  	(state, action) {
    	const change = state.step ?? step
    	switch (action.type) {
    		case 'increment':
    			return {...state, count: state.count + change}
    		case 'decrement':
    			return {...state, count: state.count - change}
    		default:
    			throw new Error('Something went wrong.')
  		}
    },
      {count: initialCount}
  )

  return (
  	<CounterContext.Provider value={value} {...props} />
  )
}

function useCounter() {
  const context = React.useContext(CounterContext)
  if(!context) {
    throw new Error('useCounter hook must be used within a context provider')
  }
  return context
}

const increment = dispatch => dispatch({type: 'increment'})
const decrement = dispatch => dispatch({type: 'decrement'})
```

## Compound Components #2020-10-15

We want to make a component that can share state with it's children, and abstract that responsibility so the user of the component doesn't have to worry about it

```javascript
import Switch

function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {on, toggle})
  })
}

const ToggleOn = ({on, children}) => on && children
const ToggleOff = ({on, children}) => !on && children
const ToggleButton = ({on, toggle}) => <Switch {...{on, toggle}} />
```

```javascript
function App() {
  return (
    <Toggle>
      <ToggleOn>The button is on</ToggleOn>
      <ToggleOff>The button is off</ToggleOff>
      <ToggleButton />
    </Toggle>
  );
}
```

Only allow props to be passed to React components

```javascript
function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, (child) => {
    if(typeoff child.type === 'string')) return child
    return React.cloneElement(child, {on, toggle})
  })
}
```

Only allow props to be passed to the components types you specify

```javascript
function Toggle({ children }) {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);

  return React.Children.map(children, (child) => {
    if (allowTypes.includes(child.type)) {
      return React.cloneElement(child, { on, toggle });
    }
    return child;
  });
}

const allowedTypes = [ToggleOn, ToggleOff, ToggleButton];

const ToggleOn = ({ on, children }) => on && children;
const ToggleOff = ({ on, children }) => !on && children;
const ToggleButton = ({ on, toggle }) => <Switch {...{ on, toggle }} />;
```

We want to make a component that can share state with it's children, and abstract that responsibility so the user of the component doesn't have to worry about it

```javascript
import Switch

function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {on, toggle})
  })
}

const ToggleOn = ({on, children}) => on && children
const ToggleOff = ({on, children}) => !on && children
const ToggleButton = ({on, toggle}) => <Switch {...{on, toggle}} />
```

```javascript
function App() {
  return (
    <Toggle>
      <ToggleOn>The button is on</ToggleOn>
      <ToggleOff>The button is off</ToggleOff>
      <ToggleButton />
    </Toggle>
  );
}
```

Only allow props to be passed to React components

```javascript
function Toggle({children}) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return React.Children.map(children, (child) => {
    if(typeoff child.type === 'string')) return child
    return React.cloneElement(child, {on, toggle})
  })
}
```

Only allow props to be passed to the components types you specify

```javascript
function Toggle({ children }) {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);

  return React.Children.map(children, (child) => {
    if (allowTypes.includes(child.type)) {
      return React.cloneElement(child, { on, toggle });
    }
    return child;
  });
}

const allowedTypes = [ToggleOn, ToggleOff, ToggleButton];

const ToggleOn = ({ on, children }) => on && children;
const ToggleOff = ({ on, children }) => !on && children;
const ToggleButton = ({ on, toggle }) => <Switch {...{ on, toggle }} />;
```

[[Kent C Dodds]] goes through the reasons for needing compound components using his [[Accordion]] component as an example https://www.youtube.com/watch?v=5io81WLgXtg&list=PLV5CVI1eNcJgNqzNwcs4UKrlJdhfDjshf&index=2 #[[December 5th, 2020]]

By using custom compound components we can abstract the state management. #[[December 5th, 2020]]

In a simple [[Modal]] compound component we abstract the **opening** and **closing** of that modal by creating a wrapper `Modal` component that holds the state in context, and individual `ModalOpenButton`, `ModalCloseButton` and `ModalContents`components that consume that context and manipulate it. #[[December 5th, 2020]]

```javascript
const ModalContext = React.createContext();
const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn?.(...args));

function Modal(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const value = { isOpen, setIsOpen };

  return <ModalContext.Provider value={value} {...props} />;
}

function useModalContext() {
  const context = React.useContext(ModalContext);
  if (!context)
    throw new Error(`This component must be placed inside a Modal component`);

  return context;
}

function ModalCloseButton({ children: child, onClick }) {
  const { setIsOpen } = useModalContext();
  const handleClick = callAll(() => setIsOpen(false), onClick);

  return React.cloneElement(child, { onClick: handleClick });
}

function ModalOpenButton({ children: child, onClick }) {
  const { setIsOpen } = useModalContext();
  const handleClick = callAll(() => setIsOpen(true), onClick);

  return React.cloneElement(child, { onClick: handleClick });
}

function ModalContentsBase(props) {
  const { isOpen, setIsOpen } = useModalContext();

  const onDismiss = () => setIsOpen(false);

  return <Dialog {...props} isOpen={isOpen} onDismiss={onDismiss} />;
}
```

Using the component looks like this

```jsx
<Modal>
  <ModalOpenButton>
    <Button variant="primary">Login</Button>
  </ModalOpenButton>
  <ModalContents title="Login" aria-label="login form">
    <div css={{ display: "flex", justifyContent: "flex-end" }}>
      <ModalCloseButton onClick={() => console.log("hello")}>
        <CircleButton>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>×</span>
        </CircleButton>
      </ModalCloseButton>
    </div>
    <h3 css={{ textAlign: "center", fontSize: "2em" }}>{title}</h3>
  </ModalContents>
</Modal>
```

## Flexible Compound Components #[[November 15th, 2020]]

The problem with the regular compound component we just made is that it will only pass props to the children, meaning that if the user of the component nests one of the children in a `<div>` those props will be passed to the `<div>` and not to the component that needs them.

To fix this we need to use [[React.useContext]]

```javascript
const ToggleContext = React.createContext()
ToggleContext.displayName = 'ToggleContext' // for DevTools

function Toggle(props) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return <ToggleContext.Provider value={{on, toggle} {...props} />
}

function useToggle() {
  const context = React.useContext(ToggleContext)
  if (!context) {
    throw new Error(
      'ToggleOn, ToggleOff and ToggleButton components must be used within the Toggle wrapper component',
    )
  }
  return context
}
```

```javascript
function ToggleOn({ children }) {
  const { on } = useToggle();
  return on ? children : null;
}
function ToggleOff({ children }) {
  const { on } = useToggle();
  return on ? null : children;
}
function ToggleButton({ ...props }) {
  const { on, toggle } = useToggle();
  return <Switch on={on} onClick={toggle} {...props} />;
}
```

The problem with the regular compound component we just made is that it will only pass props to the children, meaning that if the user of the component nests one of the children in a `<div>` those props will be passed to the `<div>` and not to the component that needs them.

To fix this we need to use [[React.useContext]]

```javascript
const ToggleContext = React.createContext()
ToggleContext.displayName = 'ToggleContext' // for DevTools

function Toggle(props) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return <ToggleContext.Provider value={{on, toggle} {...props} />
}

function useToggle() {
  const context = React.useContext(ToggleContext)
  if (!context) {
    throw new Error(
      'ToggleOn, ToggleOff and ToggleButton components must be used within the Toggle wrapper component',
    )
  }
  return context
}
```

```javascript
function ToggleOn({ children }) {
  const { on } = useToggle();
  return on ? children : null;
}
function ToggleOff({ children }) {
  const { on } = useToggle();
  return on ? null : children;
}
function ToggleButton({ ...props }) {
  const { on, toggle } = useToggle();
  return <Switch on={on} onClick={toggle} {...props} />;
}
```

## Prop Collections and Getters #[[November 16th, 2020]]

We don't want the users of our components to have to write all the common use-case props every time they use the component. Like `aria-pressed`

```javascript
function useToggle() {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);

  return {
    on,
    toggle,
    togglerProps: {
      "aria-pressed": on,
      onClick: toggle,
    },
  };
}

function App() {
  const { on, togglerProps } = useToggle();
  return (
    <div>
      <Switch on={on} {...togglerProps} />
      <button aria-label="custom-button" {...togglerProps}>
        {on ? "on" : "off"}
      </button>
    </div>
  );
}
```

Even better is if we provide a getter function that allows our users to extend the props, like if they wanted to add functionality to the `onClick` prop without overriding it.

```javascript
const callAll(...fns) => (...arg) => fns.forEach(fn => fn?.(...arg))

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  const getTogglerProps = ({onClick, ...props}) => {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props
    }
  }
  return {
    on,
    toggle,
    getTogglerProps
  }
}

function App() {
  const {on, getTogglerProps} = useToggle()
  return (
  	<div>
    	<Switch {...getTogglerProps({on})} />
		<button {...getTogglerProps({
          'aria-label': 'cutom-button',
          onClick: () => console.log('click')
        })}>
          {on ? 'on' : 'off'}
		</button>
    </div>
  )
}
```

We don't want the users of our components to have to write all the common use-case props every time they use the component. Like `aria-pressed`

```javascript
function useToggle() {
  const [on, setOn] = React.useState(false);
  const toggle = () => setOn(!on);

  return {
    on,
    toggle,
    togglerProps: {
      "aria-pressed": on,
      onClick: toggle,
    },
  };
}

function App() {
  const { on, togglerProps } = useToggle();
  return (
    <div>
      <Switch on={on} {...togglerProps} />
      <button aria-label="custom-button" {...togglerProps}>
        {on ? "on" : "off"}
      </button>
    </div>
  );
}
```

Even better is if we provide a getter function that allows our users to extend the props, like if they wanted to add functionality to the `onClick` prop without overriding it.

```javascript
const callAll(...fns) => (...arg) => fns.forEach(fn => fn?.(...arg))

function useToggle() {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  const getTogglerProps = ({onClick, ...props}) => {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props
    }
  }
  return {
    on,
    toggle,
    getTogglerProps
  }
}

function App() {
  const {on, getTogglerProps} = useToggle()
  return (
  	<div>
    	<Switch {...getTogglerProps({on})} />
		<button {...getTogglerProps({
          'aria-label': 'cutom-button',
          onClick: () => console.log('click')
        })}>
          {on ? 'on' : 'off'}
		</button>
    </div>
  )
}
```

## State Reducer #[[November 16th, 2020]]

https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks

We want to make the reducer function customizable to the user of the component.

toggleReducer

```javascript
const actionTypes = {
  toggle: "toggle",
  reset: "reset",
};

function toggleReducer(state, { type, initialState }) {
  switch (type) {
    case actionTypes.toggle:
      return { on: !state.on };
    case actionTypes.reset:
      return initialState;
    default:
      throw new Error("Something went wrong!");
  }
}
```

[[useToggle]] hook

```javascript
const callAll =
  (...fns) =>
  (...arg) =>
    fns.forEach((fun) => fun?.(...args));

function useToggle({
  reducer: customReducer,
  initialState = { on: false },
} = {}) {
  const { current: initialState } = React.useRef(initialState);
  const reducer = customReducer || toggleReducer;

  const [{ on }, dispatch] = React.useReducer(reducer, initialState);

  const toggle = () => dispatch({ type: actionTypes.toggle });
  const reset = () => dispatch({ type: actionTypes.reset });

  function getTogglerProps({ onClick, ...props }) {
    return {
      on: on,
      "aria-pressed": on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    toggle,
    reset,
    getTogglerProps,
    getResetterProps,
  };
}
```

Toggle App

```javascript
import Switch
import {useToggle, toggleReducer, actionTypes}

function App() {
  const [clicks, setClicks] = React.useState(0)
  const tooManyClicks = times > 3

  const reducer = (state, action) => {
    if(action.type === actionTypes.toggle && tooManyClicks) {
      return {on: true}
    }
    return toggleReducer(state, action)
  }
  const {on, getTogglerProps, getResetterProps} = useToggle({recuder})

  return (
  	<div>
    	<Switch {...getTogglerProps({
    	  disabled: tooManyClicks,
    	  onClick: () => setClicks(count => count + 1)
    	})} />
		</button>
		<button className="reset-button" {...getResetterProps({
          onClick: () => setClicks(0)
        })}>
          reset
		</button>
    </div>
  )
}
```

https://kentcdodds.com/blog/the-state-reducer-pattern-with-react-hooks

We want to make the reducer function customizable to the user of the component.

toggleReducer

```javascript
const actionTypes = {
  toggle: "toggle",
  reset: "reset",
};

function toggleReducer(state, { type, initialState }) {
  switch (type) {
    case actionTypes.toggle:
      return { on: !state.on };
    case actionTypes.reset:
      return initialState;
    default:
      throw new Error("Something went wrong!");
  }
}
```

[[useToggle]] hook

```javascript
const callAll =
  (...fns) =>
  (...arg) =>
    fns.forEach((fun) => fun?.(...args));

function useToggle({
  reducer: customReducer,
  initialState = { on: false },
} = {}) {
  const { current: initialState } = React.useRef(initialState);
  const reducer = customReducer || toggleReducer;

  const [{ on }, dispatch] = React.useReducer(reducer, initialState);

  const toggle = () => dispatch({ type: actionTypes.toggle });
  const reset = () => dispatch({ type: actionTypes.reset });

  function getTogglerProps({ onClick, ...props }) {
    return {
      on: on,
      "aria-pressed": on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    toggle,
    reset,
    getTogglerProps,
    getResetterProps,
  };
}
```

Toggle App

```javascript
import Switch
import {useToggle, toggleReducer, actionTypes}

function App() {
  const [clicks, setClicks] = React.useState(0)
  const tooManyClicks = times > 3

  const reducer = (state, action) => {
    if(action.type === actionTypes.toggle && tooManyClicks) {
      return {on: true}
    }
    return toggleReducer(state, action)
  }
  const {on, getTogglerProps, getResetterProps} = useToggle({recuder})

  return (
  	<div>
    	<Switch {...getTogglerProps({
    	  disabled: tooManyClicks,
    	  onClick: () => setClicks(count => count + 1)
    	})} />
		</button>
		<button className="reset-button" {...getResetterProps({
          onClick: () => setClicks(0)
        })}>
          reset
		</button>
    </div>
  )
}
```

## Control Props #[[November 16th, 2020]]

React automatically controls the state of DOM components like `<input>` when you type in them. This is what is called an uncontrolled input.

If we want to change this `<input>` to be controlled we would add the `value` prop to it and pass that prop the value we want the component to have. This also means we have to control the changes to that component with the `onChange` prop.

The `onChange` prop receives an object from React with the proposed change `event.target.value`

```javascript
const CapitalizedInput() {
  const [capitalizedValue, setCapitalizedValue] = React.useState('')
  const handleChange(event) {
    setValue(event.target.value.toUpperCase())
  }
  return <input value={capitalizedValue} onChange={handleChange} />
}
```

Let's make our [[useToggle]] hook controlled

To do this, first we have to receive a `onChange` in our `useToggle` function and run that function when `toggle` is called.

```javascript
function useToggle({
  reducer: customReducer,
  initialOn = false,
  onChange,
} = {}) {
  // useToggle logic
}
```

Since `toggle` is running `dispatch` we will create a wrapper function that will call both `dispatch` and `onChange` when `toggle` is called.

`onChange` will need to receive the new state, and since `dispatch` will not return a new state until the component re-render, we need to manually call the `reducer` to get that state and pass it to `onChange`

```javascript
const [state, dispatch] = React.useReducer(reducer, { on: false });

function distpatchWithOnChange(action) {
  dispatch(action);
  const newState = reducer(state, action);
  onChange(newState);
}

const toggle = () => dispatchWithOnChange({ type: "toggle" });
```

We don't want to call the `dispatch` function if the component is being controlled because `dispatch` will re-render the `useToggle` component and update a state that we aren't even using. So we want to first take the state that is being used by the controlled component and pass that to `useToggle`.

We also want to make sure we pass the `on` argument to the `reducer` in `onChange` because that's the state we are managing when using the controlled option, not the `state` from the hook.

In this case we can just pass `{on}` as the state, but if we had other properties in state that we weren't controlling we would have to make sure to pass those as well with `{...state, on}`

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const isControlled = controlledOn !== null;

  function dispatchWithOnChange(action) {
    if (!isControlled) dispatch(action);
    onChange(reducer({ on }, action));
  }
}
```

The whole thing looks like this

```javascript
const callAll =
  (...fns) =>
  (...arg) =>
    fns.forEach((fun) => fun?.(...args));

function useToggle({
  reducer: customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const { current: initialState } = React.useRef({ on: initialOn });
  const reducer = customReducer || toggleReducer;
  const isControlled = controlledOn !== null;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const on = onIsControlled ? controlledOn : state.on;

  function dispatchWithOnChange(action) {
    if (!isControlled) return dispatch(action);
    onChange(reducer({ ...state, on }, action));
  }

  const toggle = () => dispatchWithOnChange({ type: actionTypes.toggle });
  const reset = () => dispatchWithOnChange({ type: actionTypes.reset });

  function getTogglerProps({ onClick, ...props }) {
    return {
      on: on,
      "aria-pressed": on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    toggle,
    reset,
    getTogglerProps,
    getResetterProps,
  };
}
```

```javascript
function Toggle({ on: controlledOn, onChange }) {
  const { getTogglerProps, on } = useToggle({ on: controlledOn, onChange });
  const props = getTogglerProps({ on });
  return <Switch {...props} />;
}
```

```javascript
function App() {
  const [on, setOn] = React.useState(false)
  const [clicked, setClicked] = React.useState(0)
  const tooManyClicks = clicked > 3

  const handleToggleChange(state) {
    if(tooManyClicks) return
    setOn(state.on)
    setClicked(count => count + 1)
  }

  const handleReset() {
    setOn(false)
    setClicked(0)
  }

  return (
  	<div>
      <Toggle on={on} onChange={handleToggleChange} />
      <Toggle on={on} onChange={handleToggleChange} />
      <button aria-label="reset" onClick={handleReset}>Reset</button>
    </div>
  )
}
```

Adding warnings for `readOnly`

We want to warn the user that if they provide a value without an `onChange` they need to set the component to `readOnly`.

We put the warning in as an effect

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
  readOnly = false,
} = {}) {
  const isControlled = controlledOn != null;
  const hasOnChange = Boolean(onChange);

  React.useEffect(() => {
    if (isControlled && !hasOnChange && !readOnly) {
      console.error("Warning message");
    }
  }, [isControlled, hasOnChange]);
}
```

Adding warning for changing from controlled to uncontrolled

We track that change with a ref

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const isControlled = controlledOn != null;
  const { current: wasControlled } = React.useRef(isControlled);

  React.useEffect(() => {
    if ((isControlled && !wasControlled) || (!isControlled && wasControlled)) {
      console.error("Warning message");
    }
  }, [isControlled, wasControlled]);
}
```

React automatically controls the state of DOM components like `<input>` when you type in them. This is what is called an uncontrolled input.

If we want to change this `<input>` to be controlled we would add the `value` prop to it and pass that prop the value we want the component to have. This also means we have to control the changes to that component with the `onChange` prop.

The `onChange` prop receives an object from React with the proposed change `event.target.value`

```javascript
const CapitalizedInput() {
  const [capitalizedValue, setCapitalizedValue] = React.useState('')
  const handleChange(event) {
    setValue(event.target.value.toUpperCase())
  }
  return <input value={capitalizedValue} onChange={handleChange} />
}
```

Let's make our [[useToggle]] hook controlled

To do this, first we have to receive a `onChange` in our `useToggle` function and run that function when `toggle` is called.

```javascript
function useToggle({
  reducer: customReducer,
  initialOn = false,
  onChange,
} = {}) {
  // useToggle logic
}
```

Since `toggle` is running `dispatch` we will create a wrapper function that will call both `dispatch` and `onChange` when `toggle` is called.

`onChange` will need to receive the new state, and since `dispatch` will not return a new state until the component re-render, we need to manually call the `reducer` to get that state and pass it to `onChange`

```javascript
const [state, dispatch] = React.useReducer(reducer, { on: false });

function distpatchWithOnChange(action) {
  dispatch(action);
  const newState = reducer(state, action);
  onChange(newState);
}

const toggle = () => dispatchWithOnChange({ type: "toggle" });
```

We don't want to call the `dispatch` function if the component is being controlled because `dispatch` will re-render the `useToggle` component and update a state that we aren't even using. So we want to first take the state that is being used by the controlled component and pass that to `useToggle`.

We also want to make sure we pass the `on` argument to the `reducer` in `onChange` because that's the state we are managing when using the controlled option, not the `state` from the hook.

In this case we can just pass `{on}` as the state, but if we had other properties in state that we weren't controlling we would have to make sure to pass those as well with `{...state, on}`

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const isControlled = controlledOn !== null;

  function dispatchWithOnChange(action) {
    if (!isControlled) dispatch(action);
    onChange(reducer({ on }, action));
  }
}
```

The whole thing looks like this

```javascript
const callAll =
  (...fns) =>
  (...arg) =>
    fns.forEach((fun) => fun?.(...args));

function useToggle({
  reducer: customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const { current: initialState } = React.useRef({ on: initialOn });
  const reducer = customReducer || toggleReducer;
  const isControlled = controlledOn !== null;
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const on = onIsControlled ? controlledOn : state.on;

  function dispatchWithOnChange(action) {
    if (!isControlled) return dispatch(action);
    onChange(reducer({ ...state, on }, action));
  }

  const toggle = () => dispatchWithOnChange({ type: actionTypes.toggle });
  const reset = () => dispatchWithOnChange({ type: actionTypes.reset });

  function getTogglerProps({ onClick, ...props }) {
    return {
      on: on,
      "aria-pressed": on,
      onClick: callAll(onClick, toggle),
      ...props,
    };
  }

  function getResetterProps({ onClick, ...props }) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    };
  }

  return {
    on,
    toggle,
    reset,
    getTogglerProps,
    getResetterProps,
  };
}
```

```javascript
function Toggle({ on: controlledOn, onChange }) {
  const { getTogglerProps, on } = useToggle({ on: controlledOn, onChange });
  const props = getTogglerProps({ on });
  return <Switch {...props} />;
}
```

```javascript
function App() {
  const [on, setOn] = React.useState(false)
  const [clicked, setClicked] = React.useState(0)
  const tooManyClicks = clicked > 3

  const handleToggleChange(state) {
    if(tooManyClicks) return
    setOn(state.on)
    setClicked(count => count + 1)
  }

  const handleReset() {
    setOn(false)
    setClicked(0)
  }

  return (
  	<div>
      <Toggle on={on} onChange={handleToggleChange} />
      <Toggle on={on} onChange={handleToggleChange} />
      <button aria-label="reset" onClick={handleReset}>Reset</button>
    </div>
  )
}
```

Adding warnings for `readOnly`

We want to warn the user that if they provide a value without an `onChange` they need to set the component to `readOnly`.

We put the warning in as an effect

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
  readOnly = false,
} = {}) {
  const isControlled = controlledOn != null;
  const hasOnChange = Boolean(onChange);

  React.useEffect(() => {
    if (isControlled && !hasOnChange && !readOnly) {
      console.error("Warning message");
    }
  }, [isControlled, hasOnChange]);
}
```

Adding warning for changing from controlled to uncontrolled

We track that change with a ref

```javascript
function useToggle({
  reducer = customReducer,
  initialOn = false,
  onChange,
  on: controlledOn,
} = {}) {
  const isControlled = controlledOn != null;
  const { current: wasControlled } = React.useRef(isControlled);

  React.useEffect(() => {
    if ((isControlled && !wasControlled) || (!isControlled && wasControlled)) {
      console.error("Warning message");
    }
  }, [isControlled, wasControlled]);
}
```

## [[React Query]]

In application [[State Management]] we must differentiate between two types of state: #[[November 21st, 2020]]

**UI State**: visual aspects like if a modal is open, a link highlighted or a sidebar visible.

**Serve cache**: server data that we need to interact with and manipulate.

It's important to keep these two states separate and handle them as different things. The **server cache** we would usually like to have available globally in our app, where as the **UI state** is general more localized to what is being painted at the moment. #[[November 21st, 2020]]

The instructions for this part of the app are not very helpful. #[[November 22nd, 2020]]

We are suppose to the React Query hooks to retrieve book lists from the server but there is no documentation explaining how that data is returned.

[[useQuery]] #[[November 22nd, 2020]]

takes a queryKey and queryFn, which is an async function that React Query handles.

returns and object with `data` and various boolean values like `isSuccess`

```javascript
const { data, isSuccess } = useQuery(
  "list-items",
  client("list-items", { token: user.token })
);
```

[[useMutation]] #[[November 25th, 2020]]

takes a async function that will mutate our server data in some way and returns a function to use in our handlers

```javascript
const [mutate] = useMutation((data) => client("endpoint", data));
```

if the change in server data is going to affect our cached data we need to invalidate that cache so React Query re-fetches it.

```javascript
const [mutate] = useMutation((data) => client("endpoint", data), {
  onSettled: () => queryCache.invalidateQueries("query-name"),
});
```

using `ErrorBoundary` with React Query, we have to wrap our whole app with a `ReactQueryConfigProvider` #[[November 28th, 2020]]

```javascript
import { ReactQueryConfigProvider } from "react-query";

const queryConfig = {
  queries: {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      if (error.status === 404) return false;
      else if (failureCount < 2) return true;
    },
  },
};
```

To update several query keys with the same query fetch function we can use `queryCache.setQueryData` #[[November 29th, 2020]]

```javascript
const query = useQuery({
  queryKey: "list-items",
  queryFn: () => client("list-items", { token: user.token }),
  config: {
    onSuccess: (listItems) =>
      listItems.forEach((listItem) => {
        queryCache.setQueryData(
          ["book", { bookId: listItem.book.id }],
          listItem.book
        );
      }),
  },
});
```

When setting the `queryKey` we can add subcategories. So the `book` queryKey holds a list of all individual books, so to access an individual one we need to provide an id when creating the cache #[[November 29th, 2020]]

```javascript
const bookId = 12345;

const bookQuery = useQuery({
  queryLey: ["book", { bookId }],
  queryFn: () => client(`books/${bookId}`, { token: user.token }),
});
```

The `book` queryKey is an array with all books queries, by providing a second argument with an object that had a key of `bookId` and a value identifying the specific book by number, we can access a specific element of that queryKey array.

We can make an [[Optimistic UI]] with React Query by using the `onMutate` option in the `config` of our `useMutation` hook #[[November 29th, 2020]]

```javascript
const [mutate] = useMutation(
  ({ method, data, item, user }) => {
    return client(`list-items/${item.id}`, { method, data, token: user.token });
  },
  {
    onMutate: ({ data }) => {
      queryCache.setQueryData("list-items", (oldItems) => {
        return oldItems.map((i) => (i.id === data.id ? { ...i, ...data } : i));
      });
    },
  }
);
```

The `onMutate` function receives the same arguments as the `mutate` function.
