## [[Code Splitting]] #2020-12-05

Code splitting is loading only the code that the user needs at for any give interaction.

React provides use with some [[React.lazy]] function to lazily import code and a [[React.Suspense]] component to render that code

```javascript
// The 'globe' module must have a React component as a default export for this to work
const Globe = React.lazy(() => import("globe"));

function App() {
  const [showGlobe, setShowGlobe] = React.useState(false);
  return (
    <div>
      <input
        type="checkbox"
        checked={showGlobe}
        onClick={() => setShowGlobe(e.target.checked)}
      />
      <React.Suspense fallback={<div>Loading...</div>}>
        {showGlobe && <Globe />}
      </React.Suspense>
    </div>
  );
}
```

We can also eagerly load the `Globe` component by setting the import to a function that is called when the user performs an action that indicates they are about to request that data, like mousing over or focusing on the checkbox

```javascript
const loadGlobe = () => import('globe')

// and then in the app:
 <input ...props onMouseOver={loadGlobe} onFocus{loadGlobe} />
```

Putting those two things together looks like this

```javascript
const loadGlobe = () => import("globe");
const Globe = React.lazy(loadGlobe);
```

And if we know for sure the user if going to need that data at some point during their interaction with our app we can prefetch it with [[Webpack]] [[Magic Comments]] or by just running the `loadGlobe` function when the file is loaded

```javascript
const loadGlobe = () => import("globe");
const Globe = React.lazy(loadGlobe);
loadGlobe();
// or
const Globe = React.lazy(() => import(/* webpackPrefetch: true */ "globe"));
```

Docs on how to check coverage on Chrome DevTolls https://developers.google.com/web/tools/chrome-devtools/coverage

To deliver a smooth visual experience we need to render content a 60fps, meaning that our code has to run in 16ms (1000ms/60fps) #[[December 6th, 2020]]

[[React.useMemo]] for expensive calculations #[[December 6th, 2020]]

The difference between [[React.useMemo]] and [[React.useCallback]] is that `useMemo` memoizes the returned value, so if the dependencies change the `useMemo` will be called again to return the new value. With `useCallback` React memoizes the function definition, so if the dependencies change React will return a new function, but it would execute it.

[[Kent C Dodds]] blog post on when to use [[React.useMemo]] and [[React.useCallback]] https://kentcdodds.com/blog/usememo-and-usecallback

We can also [[workerize]] our expensive calculations by offloading them to a separate thread. https://github.com/developit/workerize

## [[React.memo]] #2020-12-07

The life of a [[React]] app:

**render** phase: create React elements with `React.createElement`, (the Virtual DOM)

**reconciliation** phase: compare the previous elements with the new ones.

**commit** phase: update the [[DOM]] (if needed) with all new elements at once.

Updating the [[DOM]] is the slowest part, so React exists to optimize for this, allowing for most of the activity to happen without updating the DOM and only making updates when needed.

A [[React]] component will update only if at least one of these things has happened:

props change

internal state changes

consuming context change

parent re-render

[[React.PureComponent]] for class components and [[React.memo]] for function components allow us to prevent children re-renders caused by parent re-render.

In this example both `Counter` and `NameInput` will re-render when the counter button is clicked, even though nothing has changed for `NameInput`

```javascript
function Counter({ count, onClick }) {
  return <button value={count} onClick={onClick} />;
}

function NameInput({ name, onNameChange }) {
  return (
    <label>
      Name: <input value={name} onChange={() => onNameChange(e.target.value)} />
    </label>
  );
}

function App() {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState("");
  const increase = () => setCount((c) => c + 1);

  return (
    <div>
      <Counter count={count} onClick={setCount} />
      <NameInput name={name} onNameChange={setName} />
    </div>
  );
}
```

To avoid this we would use [[React.memo]]

```javascript
function Counter({ count, onClick }) {
  return <button value={count} onClick={onClick} />;
}
Counter = React.memo(Counter);

function NameInput({ name, onNameChange }) {
  return (
    <label>
      Name: <input value={name} onChange={() => onNameChange(e.target.value)} />
    </label>
  );
}
NameInput = React.memo(NameInput);

// no other changes needed
```

[[Jake Archibald]] from [[Google]] talks about how browsers render pages https://www.youtube.com/watch?v=3bc71-xzoWA

Avoid rending every element in a large list by only passing primitive values as props and performing calculations higher up in the tree

```javascript
function ListBox({items, highlightedIndex, selectedItem}) {
  return (
  	<ul>
    	{items.map((item, index) => {
    		const isSelected = item.id === selectedItem.id
            const isHighlighted = index === hightlightedIndex
            return (
            	<ListItem
              		key={item.id}
  					item={item}
  					index={index}
  					isSelected={isSelected}
  					isHighlighted={isHighlighted}
  				>
                    {item.name}
  				</ListItem>
            )
  		})}
    </ul>
  )
}
ListBox = React.memo(ListBox)

function ListItem({item, index, isSelected, isHightlighted, children}) {
  return (
  	<li
    	style: {{ fontWeight: isSelected ? 'bold : 'normal'}}
    	children={children}
    />
  )
}
ListItem = React.memo(ListItem)
```

## windowing #2020-12-07

Lazily just-in-time rendering of what the user can see.

If you have a list of 100,000 items but the user can only see 20 at a time, you can window those 20 and maybe a few for to account for fast scrolling, and lazy loud the rest as needed on screen.

We can do this in [[React]] with [[useVirtual]] from [[react-virtual]]

```javascript
function MyLargeList({items}) {
  const listRef = React.useRef()
  const rowVitualizer = useVirtual({
    size: items.length,
    parentRef = listRef,
    estimateSize: React.useCallback(() => 20, []),
    overscan: 10
  })

  return (
  	<ul ref={listRef}>
    // this 'height' style ensures the scroll bar is calculated
    // based on the actual length of the list
      <li style={{height: rowVitualizer.totalSize}} />
	  {rowVitualizer.virtualItems.map(({index, size, start}) {
		const item = items[index]
		return (
          <li
		    index={item}
			// set the height of the visiable data
			// and tranform that as user scrolls
			style={{height: size, tranform: `translateY(${start}px)`}}
	  	  >
    		{item.name}
      	  </li>
		)
	  })}
    </ul>
  )
}
```

## Optimize Context #2020-12-08

[[Kent C Dodds]] article on this https://github.com/kentcdodds/kentcdodds.com/blob/319db97260078ea4c263e75166f05e2cea21ccd1/content/blog/how-to-optimize-your-context-value/index.md

If we memoized a context consumer component with [[React.memo]], that component will not re-render with it's parent component unless it's props change or the context it's consuming changes. If the context it's consuming is not a primitive value, every time the provider component is re-rendered the context value will be considered a new value and therefor cause a re-render of our memoized component, even if the value hasn't changed.

```javascript
const CountContext = React.createContext();

function CountProvider(props) {
  const [count, setCount] = React.useState(0);
  const value = { count, setCount };

  return <CountContext.Provider value={value} {...props} />;
}
function CountDisplay() {
  const { count } = React.useContext(CountContext);
  return <div>The current count it: {count}</div>;
}
CountDisplay = React.memo(CountDisplay);

function Counter() {
  const { setCount } = React.useContext(CountContext);
  const increase = () => setCount((c) => c + 1);

  return <button onClick={increase}>Increase count</button>;
}
Counter = React.memo(Counter);

function App() {
  return (
    <CountProvider>
      <CountDisplay />
      <Counter />
    </CountProvider>
  );
}
```

To solve this we can memoize the context value with [[React.useMemo]].

Another solution is to separate the context value and the updater function into two separate provider. This way each provider holds a single value, in this example a primitive value and the stable function that `useState` returns. The other advantage to this approach is that when increasing the `count` only the `CountDisplay` component and it's provider will re-render, and the `Counter` will not cause it depends on a different provider that hasn't changed.

```javascript
const CountGetContext = React.createContext();
const CountSetContext = React.createContext();

function CountProvider({ children }) {
  const [count, setCount] = React.useState(0);

  return (
    <CountGetContext.Provider value={count}>
      <CountSetContext.Provider value={setCount}>
        {children}
      </CountSetContext.Provider>
    </CountGetContext.Provider>
  );
}

function useGetCount() {
  const count = React.useContext(CountGetContext);
  if (!count) throw new Error();
  return count;
}
function useSetCount() {
  const setCount = React.useContext(CountSetContext);
  if (!count) throw new Error();
  return setCount;
}
```

https://codesandbox.io/s/ynn88nx9x?view=editor&file=/src/count-context.js

## Performance Death By A Thousand Cuts #[[December 8th, 2020]]

When the performance problems come not from a single source that has an expensive computation, but from the rendering of lots of small components, the solution is to collocate the context they are consuming so that it is as close as possible to the components that actually need it.

[[Kent C Dodds]] blog post of state colocation https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster

The problem with using too much [[React.memo]] and [[React.useCallback]]:

increases code complexity

management of dependencies

React has to work to sort out all of those dependencies

Putting a middle-man component to handle the state of the grid component allows us to have a global state for the grid but only re-render the one that changes

```javascript
function Cell({ row, column }) {
  const state = useGridState();
  const cell = state.grid[row][column];

  return <CellImp cell={cell} row={row} column={column} />;
}

function CellImp({ cell, row, column }) {
  const dispatch = useAppDispatch();
  const handleClick = () => dispatch({ type: "UPDATE_GRID_CELL", row, column });

  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? "white" : "black",
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  );
}
CellImp = React.memo(CellImp);
```

Since we memoize `CellImp` it will only update when `cell` changes and not when the rest of the grip context changes.

In a form that has a field with a large list, we could use a similar method.

```javascript
function Form() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
  })
  const handleChange() {
    const key = e.target.id
    const value = e.target.value
    setForm({...form, [key]: value})
  }
  return (
  	<Name name={form.name} onChange={handleChange} />
    <Email email={form.email} onChange={handleChange}/>
  )
}

function Name({name, onChange}) {
  return <input id="name" value={name} onChange={onChange} />
}
function Email({email, onChange}) {
  return <input id="email" value={email} onChange={onChange} />
}
```

A more generic way of doing this is by creating a [[HOC]], this is what [[Redux]]'s `connect` HOC does.

```javascript
function withStateSlice(Comp, slice) {
  const MemoComp = React.memo(Comp);

  function Wrapper(props, ref) {
    const state = useAppState();
    const slicedState = slice(state, props);
    return <MemoComp ref={ref} state={slicedState} {...props} />;
  }
  Wrapper.displayName = `withStateSlice(${Comp.displayName || Comp.name})`;
  return React.memo(React.forwardRef(Wrapper));
}
```

## Production performance monitoring #[[December 8th, 2020]]

[[React.Profiler]] allows us to wrap areas of our tree in a profiler that will collect data on the performance of our app.

```javascript
<React.Profiler id="identifier" onRender={onRenderCallback}

function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions, // the Set of interactions belonging to this update
) {
  // Aggregate or log render timings...
}
```

Instructions on how to setup your project for production profiling https://kentcdodds.com/blog/profile-a-react-app-for-performance
