# Getting started

**Install**

```
bun i
```

**Run**

```
bun dev -- --open
````

**add localhost https for Webauthn to work**

```
brew install mkcert

mkcert -install

mkcert localhost
```

**important add to gitignore:**

```
localhost.pem

localhost-key.pem
```