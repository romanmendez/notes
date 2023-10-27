When our app has authentication we want the user to be able to store and retrieve their data seamlessly while using the app. To avoid having to ask that user for their username and password on every fetch, or storing their credencials in an unsafe cache, we use [[token]]

The token is added the header of the [[HTTP]] request. It's useful to create a wrapper for our fetch requests that will include this in every header.

```javascript
const apiURL = process.env.API_URL;

function client(
  endpoint,
  { data, token, headers: customHeaders, ...customConfig } = {}
) {
  const { token, data } = user;
  const config = {
    method: data ? "POST" : "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": data ? "application/json" : undefined,
      ...customHeaders,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...customConfig,
  };

  return window
    .fetch(`${apiURL}/${endpoint}`, config)
    .then(async (response) => {
      if (response.status === 401) {
        // logout user
        window.location.assign(window.location); // full page refresh to clear all cached data
        return Promise.reject({ message: "Please login again" });
      }

      const data = await response.json();
      if (response.ok) return data;
      else return Promise.reject(data);
    });
}

export { client };
```

A token can be any unique identifier, but it's common practice to use a JSON Web Token https://jwt.io

[[Authentication]] services recommended by #kentcdodds:
Auth0 (https://auth0.com/)
Netlify Identity (https://docs.netlify.com/visitor-access/identity/#enable-identity-in-the-ui)
Firebase Authentication (https://firebase.google.com/products/auth)

The authentication process with tokens is:

1. Call an API to check if there is a token for the user and retrieve it if there is.
2. Send that token along with the data request.

```javascript
const token = await authProvider.getToken();
const headers = {
  Authorization: toekn ? `Bearer ${token}` : undefined,
};
window.fetch("www.example.com/profile", { headers });
```
