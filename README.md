*Install*

bun i

*Run*

bun dev -- --open

*mkcert (localhost https)*

brew install mkcert
mkcert -install
mkcert localhost

*important add to gitignore:*
localhost.pem
localhost-key.pem