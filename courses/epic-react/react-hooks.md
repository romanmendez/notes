## [[React.useEffect]]: HTTP Request

When you make an asynchronous data request you want to be able to keep track of the status of that request to be able to render the appropriate information for the user.

```javascript
setStatus("resolved");
```

You also have to store the data you are fetching.

```javascript
fetch(something).then((response) => setData(response));
```

When keeping these two things in seperate states you run the risk of placing `setStatus` before `setData` causing the component to update with a `resolved` status before the data is set.

The solution to this is putting both things in a single state object. This way the component will only re-render once.

```javascript
setState({ status: "resolved", data: response });
```

## [[React.useReducer]]

useReducer takes two arguments: a reducer function and an initial value.

```javascript
useReducer(reducerFn, initialValue);
```

If you'd like to lazy initialize useReducer you can pass it a third argument, which would be a function that takes the second argument of useReducer as its argument and returns the initial value.

```js
useReducer(reducerFn, props, initialState);
```

useReducer returns a current state value and a dispatch function. The dispatch function is used to pass an action to the reducer function, which takes that action as its second argument and the current state as its first.

```javascript
const [state, dispatch] = useReducer(reducerFn, initialValue);
```

Full example:

```javascript
function countReducer(state, action) {
  const { count } = state;
  const { type, step } = action;
  if (type === "INCREMENT") return { count: count + step };
  if (type === "DECREMENT") return { count: count - step };
}

function Counter({ initialCount = 0, step = 1 }) {
  const [state, dispatch] = useReducer(countReducer, { count: initialCount });

  const { count } = state;
  const action = (type) => dispatch({ type: type, step });
  return (
    <>
      <button onClick={() => action("DECREMENT")}>-</button>
      <div>{count}</div>
      <button onClick={() => action("INCREMENT")}>+</button>
    </>
  );
}
```

## [[React.useCallback]]

Assuming this code appears in a React function component, how many function allocations are happening with this code on each render?
`const a = () => {}`
And how many are happening with this code?
`const a = useCallback(() => {}, [])`

This hooks allows us to pass React a function with a dependency list and always get the same function back unless the dependancies change.

This is useful when using a function as a dependency in a [[React.useEffect]] hook. When declaring a function in a component and then using that function as a dependency in a useEffect hook for that same component, we are triggering that useEffect hook everytime because the function gets declared everytime.

With useCallback we get the same function we declared the first time for every render, unless it's dependencies change.

How does this hook know not to return `unsafeDispatch` when `isMounted` changes, if the changes to `isMounted` are not causing a render of the component and it's not on the dependency list either

```javascript
const dispatch = React.useCallback((...args) => {
  if (isMounted) unsafeDispatch(...args);
});
```

## [[Custom Hook]]

**useSafeDistpach** custom hooks

```javascript
function useSafeDispatch(dispatch) {
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  return React.useCallback(
    (...args) => {
      if (isMounted) return dispatch(...args);
    },
    [setState]
  );
}

const defaultInitialState = { status: "idle", data: null, error: null };
function useAsync(customInitialState) {
  const initialState = React.useRef({
    ...defaultInitialState,
    ...customInitialState,
  });

  const [{ status, data, error }, dispatch] = React.useReducer(
    (s, a) => ({ ...s, ...a }),
    initialState.current
  );

  const safeDispatch = useSafeDispatch(dispatch);

  const setData = React.useCallback(
    (data) => safeDispatch({ status: "resolved", data }),
    [safeDispatch]
  );
  const setError = React.useCallback(
    (error) => safeDispatch({ status: "rejected", error }),
    [safeDispatch]
  );
  const reset = React.useCallback(
    () => safeDispatch({ ...defaultInitialState, ...customInitialState }),
    [safeDispatch]
  );

  const run = React.useCallback(
    (promise) => {
      if (!promise || !promise.then) {
        throw new Error(
          "The argument passed to useAsync().run must be a promise."
        );
      }
      safeDispatch({ status: "fetching" });
      return promise.then(
        (response) => {
          setData(data);
          return data;
        },
        (error) => {
          setError(error);
          return Promise.reject(error);
        }
      );
    },
    [safeDispatch, setData, setError]
  );

  return {
    isIdle: status === "idle",
    isLoading: status === "fetching",
    isSuccess: status === "resolved",
    isError: status === "rejected",
    setData,
    setError,
    reset,
    data,
    status,
    error,
    run,
  };
}
```

## [[React.useContext]]

We use this hook when we want to have a variable that we can access from anywhere in our React tree without having to worry about prop drilling.

This is the how you use the hook:

```javascript
import React from "react";

const FooContext = React.createContext();

function FooDisplay() {
  const foo = React.useContext(FooContext);
  return <div>Foo is: {foo}</div>;
}

ReactDOM.render(
  <FooContext.Provider value="fighter">
    <FooDisplay />
  </FooContext.Provider>,
  document.getElementById("root")
);
```

Usually we'll be using context along with state, therefor it's good practice to wrap both things in a component that we can use as a provider of that state:

```javascript
import React from "react";

const FooContext = React.createContext();

function FooContextProvider(props) {
  const [foo, setFoo] = useState();
  const value = [foo, setFoo];
  return <FooContext.Provider value={value} {...props} />;
}
```

It's useful to put the `useContext` hook in a custom hook to check for the provider and throw a useful error if it hasn't been provided:

```javascript
function useFooContext() {
  const context = React.useContext(FooContext);
  if (!context) {
    throw new Error("useFooContext must be used inside of a context provider");
  }
  return context;
}

function FooDisplay() {
  const foo = useFooContext();
  return <div>Foo is: {foo}</div>;
}
```

## [[React.useLayoutEffect]]

The difference between this hook and [[React.useEffect]] is very subtle. We will almost always want to useEffect, but for cases where we want our side-effect to manipulate the DOM before it is painted, we would useLayoutEffect.

## [[React.useImperativeHandle]]

This hooks is used when we want to pass some imperative logic from one component to a parent component, usually with a ref.

```javascript
const MyInput = React.forwardRef(function MyInput(props, ref) {
  const inputRef = React.useRef();
  React.useImperativeHandle(ref, () => {
    return {
      focus: () => inputRef.current.focus(),
    };
  });
  return <input ref={inputRef} />;
});
```

This is useful when it's hard to deal with something declaratively and you need to pass some imperative methods to someone who is passing a ref.

Before using this hook make sure there is no other way of doing this, because [[declarative code]] is not easy to follow.
https://tylermcginnis.com/imperative-vs-declarative-programming/

## [[React.useDebugValue]]

This hook is used for debugging. It takes a single argument and will compute the values in that argument for every instance of the hook.

```javascript
function useMedia(query, initialState = false) {
  const [state, setState] = React.useState(initialState);
  React.useDebugValue(`useMedia:(\`${query}\`) => ${state}`);

  React.useEffect(() => {
    let mounted = true;
    const mql = window.matchMedia(query);
    function onChange() {
      if (!mounted) {
        return;
      }
      setState(Boolean(mql.matches));
    }

    mql.addListener(onChange);
    setState(mql.matches);

    return () => {
      mounted = false;
      mql.removeListener(onChange);
    };
  }, [query]);

  return state;
}

function Box() {
  const isBig = useMedia("(min-width: 1000px)");
  const isMedium = useMedia("(max-width: 999px) and (min-width: 700px)");
  const isSmall = useMedia("(max-width: 699px)");
  const color = isBig ? "green" : isMedium ? "yellow" : isSmall ? "red" : null;

  return <div style={{ width: 200, height: 200, backgroundColor: color }} />;
}
```

This hook will not work inside a component, it will only work inside a custom hook.

There is a optional 2 argument we can pass this hook with the formating is computational expensive and we don't want it to compute unless the DevTools are open. In this case we pass an object with the values we need as a first argument, and a function with takes those values and computes an output as a second argument.

````javascript
function formatDebugValue = ({query, state}) => `useMedia:(\`${query}\`) => ${state}`
React.useDebugValue({query, state}, formatDebugValue)```
````
