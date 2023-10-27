The basic [[Jest]] functionality #[[December 11th, 2020]]

```javascript
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`${actual} is not equal to ${expected}`);
      }
    },
  };
}
```

Simple test with [[ReactDOM]] without using [[Testing Library]] [[React]] #[[December 10th, 2020]]

Here we create a [[DOM]] that is provided by the [[Jest]] testing environment (I think) and render the element we want to test on to there.

```javascript
test("simple counter element", () => {
  const div = document.createElement("div");
  document.body.append(div);
  ReactDOM.render(<Counter />, div);
});
```

Now we need to grab the elements that `<Counter />` renders

```javascript
const [decrement, increment] = div.querySelectorAll("button");
const message = div.firstChild.querySelector("div");
```

Once we have this we can start to create interactions and make assertions from the results of those interactions

```javascript
expect(message.textContent).toBe("Current count: 0");
increment.click();
expect(message.textContent).tobe("Current count: 1");
decrement.click();
expect(message.textContent).toBe("Current count: 0");
```

And finally we need to remove the div from the document body to make sure it doesn't linger and effect other tests

```javascript
div.remove();
```

The problem with this approach to cleaning up our test is that if the test fails it will never reach the `div.remove()` line, which is at the end of the test, so the document won't be cleaned up.

A better solution is to clean the `document.body` before each tests runs

```javascript
beforeEach(() => (document.body.innerHTML = ""));
```

Instead of using `button.click()` we can use a more versatile function `button.dispatchEvent()` and pass that function an event handler

```javascript
const click = new MouseEvent("click", {
  bubbles: true,
  cancelable: true,
  button: 0,
});

increment.dispatchEvent(click);
```

**bubble** is required because [[React]] uses event delegation, which requires bubbling

**button : 0** makes the button event a left click event.

## [[Testing Library]] [[React]] #2020-12-10

The library takes care of the boilerplate code needed to create a `div` that we then append to the `document.body`, render with `ReactDOM.render` and finally have to cleanup.

It also takes care of handling React's `act` function, which Kent explains here [Fix the "not wrapped in act(...)" warning](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning).

All of this turns the test from our previous exercise into this:

```javascript
text("simple counter element", () => {
  const { container } = render(<Counter />);

  const [decrement, increment] = container.querySelectorAll("button");
  const message = container.firstChild.querySelector("div");

  expect(message.textContent).toBe("Current count: 0");

  fireEvent.click(increment);
  expect(message.textContent).toBe("Current count: 1");

  fireEvent.click(decrement);
  expect(message.textContent).toBe("Current count: 0");
});
```

[[Testing Library]] also has a package that adds more specific assertions for the [[DOM]] using [[Jest]] `@testing-library/jest-dom` that allow us to do things like `expect(message).toHaveTextContent(...)`

To make this work we need to add this library to our Jest configuration:

```javascript
{
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"];
}
```

And in [[create-react-app]] we need to create a `setupTests.js` file and import the library in that file with a regular ESM import statement.

Avoid implementation details #[[December 10th, 2020]]

"Implementation details" refers to the way you write your code, the abstractions you use to accomplish a result. For example, the difference between looping through a list with a `for` loop or a `forEach` is an implementation detail. The result should be the same and the end-user shouldn't care how you got there. Our tests shouldn't care either.

[[Testing Library]] [[React]] has a [screen](https://testing-library.com/docs/dom-testing-library/api-queries/#screen) object we can use to target the things that are on the screen, allowing us to test for what is actually being painted and seen by the user.

```javascript
test("simple counter component", () => {
  render(<Counter />);

  const decrement = screen.getByRole("button", { name: /decrement/i });
  const increment = screen.getByRole("button", { name: /increment/i });
  const message = screen.getByText(/current count/i);
});
```

[Testing Playground](https://testing-playground.com/) is a great resource to decide which query you should use to target the HTML elements you user is seeing.

The `userEvent` function from `@testing-library/user-event`allows us to implement events in a way that resembles more closely the events that the end user will actually trigger. When clicking on a button, for example, a lot of different events are triggered, like `mousedown` or `mouseup`

## Form testing #2020-12-10

[[Jest]] [Mock Function](https://jestjs.io/docs/en/mock-function-api) allow us to forget about the implementation of a function and just worry about what it is called with and what it returns, or how many times it's called.

```javascript
const handleSubmit = jest.fn();
render(<Login onSubmit={handleSubmit} />);

// ...and then
expect(handleSudmit).toHaveBeenCalledWith({ username, password });
expect(handleSudmit).toHaveBeenCalledTimes(1);
```

And [[object mother]] or [[test object factory function]] is a data object we create for testing

```javascript
const buildLogin = (overrides) => {
  return {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    ...overrides,
  };
};
const { username, password } = buildLogin({ username: "roman" });
```

[Test Data Bot](https://www.npmjs.com/package/@jackfranklin/test-data-bot) is a library to build [[object mother]] or [[test object factory function]]

```javascript
import { build, fake } from "@jackfranklin/test-data-bot";
const loginBuilder = build({
  fields: {
    username: fake((f) => f.internet.userName()),
    password: fake((f) => f.internet.password()),
  },
});
```

## Mocking HTTP requests #2020-12-11

[[jsdom]] is a pure-[[JavaScript]] implementation of many web standards, notable [WHATWG](https://dom.spec.whatwg.org/) [[DOM]] and [[HTML]] standards, for use with [[NodeJS]]. The goal of the project is the emulate enough of the browser to be useful for testing.

A [[polyfill]] is a piece of code that provides a feature for a browser that does not support that feature.

`window.fetch` is not supported in [[jsdom]], so we need to use the `whatwg-fetch` module to polyfill fetch in our tests.

[[MSW]] is a request interceptor which creates a mock server that allows us to make requests without having to use a port.

```javascript
import {rest} from 'msw'
import {setupServer} from 'msw/node'

const server = setupServer(
  rest.get('/greeting', (req, res, ctx) => {
    return res(ctx.json({greeting: 'Hello, world!'}))
  })
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('testing call to greeting', () => {
  render(<Fetch url="/greeting" />)

  userEvent.click(screen.getByText('Load Greeting'))

  await waitForElementToBeRemoved(() => screen.getByText('Loading...'))

  expect(screen.getByRole('heading')).toHaveTextContent('hello there')
  expect(screen.getByRole('button')).toHaveAttribute('disabled')
})
```

`server.use` allows us to add a server handler to our server after it's started running. `server.resetHandlers()` will reset our handlers.

```javascript
server.use(
  rest.post("/greeting", (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: "server error" }));
  })
);
```

## Mocking [[Browser API]]s #2020-12-14

Some browser APIs are not supported in [[jsdom]] so we need to mock them using [[Jest]]. An example of this would be the geolocation API

```javascript
window.navigator.geolocation = {
  getCurrentPosition: jest.fn(),
};
const fakePosition = {
  coords: {
    latitude: 25,
    longitude: 120,
  },
};

window.navigator.geolocation.getCurrentPosition.mockImplementation(
  (success, failure, options) => {
    success(fakePosition);
  }
);
```

In this example, since we want `getCurrentPosition` to be async, we will create a promise to wrap it in

```javascript
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}
const {promise, resolve} = deferred()

window.navigator.geolocation.getCurrentLocation.mockImplementation(
  (success, failure, options) => {
    promise.then(() => success(fakePosition))
  }
)

await act(() => {
  resolve()
  return promise
}
```

[[Kent C Dodds]] explains why we need `act` in our tests and how to use it https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning

Use [[Jest]] to mock a [[module]]

```javascript
import {useCurrentPosition} from 'react-use-geolocation'

jest.mock('react-use-geolocation')

test('location', () => {
  const fakeLocation = {
    coords: {
      latitude: 23,
      longitude: 132
    }
  }
  let setLocation
  function useMockCurrentLocation() {
    const state = React.useState([])
    setLocation = state[1]
    return state[0]
  }
  useCurrentLocation.mockImplementation(useMockCurrentLocation)

  render(<Location />)
  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()

  act(() => setLocation([fakeLocation]))

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument()
  expect(screen.getByText(/latitude/i)).toHaveTextContent(`Latitude: ${fakeLocation.coords.latitude)`)
  expect(screen.getByText(/longitude/i)).toHaveTextContent(`Longitude: ${fakeLocation.coords.longitude)`)
})
```

If you are passing an argument to the a function we want to also test for that

```javascript
expect(useCurrentLocation).toHaveBeenCalledWith("whatever");
```

Test for a [[Promise]] rejection

```javascript
test("return the current location of the user", async () => {
  const message = "there was an error retreiving the users position";
  const positionError = new Error({ message });

  const { promise, reject } = deferred();
  window.navigator.geolocation.getCurrentPosition.mockImplementation(
    (success, failure) => promise.catch(() => failure(positionError))
  );

  render(<Location />);
  expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();

  await act(async () => {
    reject();
  });

  expect(screen.queryByLabelText(/loading/i)).not.toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(positionError.message);
});
```

## Testing with context and custom render methods #2020-12-14

Create a custom render method

```javascript
function AllProviders({children}) {
  <ThemeProvider theme={theme}>
    <AuthProvider>
      {children}
  	</AuthProvider>
  </ThemeProvider>
}
const customRender(ui, options){
  return render(ui, {wrapper: AllProviders, ...options})
}
// re-export react-testing-library
export * from 'react-testing-library'

// override render export
export {customRender as render}
```

## Testing custom hooks #2020-12-15

The best way to test a custom hook is to use it in a component and that that component

```javascript
function UseCounterTestComponent() {
  const {count, increment, decrement} = useCounter()
  return (
  	<div>
      <div>Current count: {count}</div>
	  <button onClick={increment}>Increment</div>
	  <button onClick={decrement}>Decrement</div>
    </div>
  )
}

test('useCount custom hook', () => {
  render(<UseCounterTestComponent />)
  const message = screen.getByText(/current count/i)
  const increment = screen.getByRole('button', {name: /increment/i})
  const decrement = screen.getByRole('button', {name: /decrement/i})

  expect(message).toHaveTextContent('Current count: 0')
  userEvent.click(increment)
  expect(message).toHaveTextContent('Current count: 1')
  userEvent.click(decrement)
  expect(message).toHaveTextContent('Current count: 0')
})
```

This works great if the custom hook is simple, but if it requires a more complex component to test the functionality you could make a fake component. We would need to put this logic inside the test.

In this case we don't have a UI to render so we make assertions on the state directly and use `act` to re-render the component.

```javascript
test("useCounter with FakeTestComponent", () => {
  let result;
  function FakeTestComponent() {
    result = useCounter();
    return null;
  }
  render(<FakeTestComponent />);
  expect(result.count).toBe(0);
  act(() => result.increment());
  expect(result.count).toBe(1);
});
```

If we are writing several test for the hook we might want to make a `setup` function that holds the `FakeTestComponent` logic and gives us the hook state.

```javascript
function setup() {
  let result
  function FakeTestComponent() {
    result = useCounter()
    return null
  }
  return result
}

test('with setup function', () => {
  const result = setup()
  ...
})
```

The problem with this is the rendering of the component will cause `result` to be assigned to a new object each time it renders, but the test function only runs once, so the object assigned to the `result` variable doesn't change throughout the test.

To solve this we need to make sure `result` is always pointing to the same object reference and we just need to change the properties of that object.

```javascript
function setup() {
  const result = {};
  function FakeTestComponent() {
    result.current = useConter();
    // or
    Object.assign(result, useCounter());
  }
}
```

Or we can just use `@testing-library/react-hooks`

```javascript
import { renderHook, act } from "@testing-library/react-hooks";
// and then...
const { result } = renderHook(useCounter);
// and ...
const { result } = renderHook(useCounter, {
  initialProps: { initialCount: 1 },
});
```

Which also gives us the ability to use a `rerender` function

```javascript
const { result, rerender } = renderHook(useCounter, {
  initialProps: { step: 1 },
});
expect(result.count).toBe(0);
act(() => result.increment());
expect(result.count).toBe(1);
rerender({ step: 2 });
act(() => result.increment());
expect(result.count).toBe(3);
```

Styles

Maintainable CSS in React
https://www.youtube.com/watch?v=3-4KsXPO2Q4&list=PLV5CVI1eNcJgNqzNwcs4UKrlJdhfDjshf

"a well-designed system makes it easy to do the right things and annoying (but not impossible) to do the wrong things" #quote
https://blog.codinghorror.com/falling-into-the-pit-of-success/
