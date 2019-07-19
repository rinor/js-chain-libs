# Js chain libs

WebAssembly library with Javascript bindings to the new chain libraries 

## Building 

### Requirements

Install [rustup](https://rustup.rs/)
Run rustup install stable
Install [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

Make sure to update the submodule:

```sh
git submodule update
```

Build with:

``` sh
wasm-pack build
```

Creating an npm module:

```sh
wasm-pack pack
```

## Examples

### Create transaction

The following example uses Webpack to bundle the library and run the code in the browser.

Try it yourself.

1. Create a npm package of this repository:
```sh
wasm-pack pack
```
2. Copy the `pkg/js-chain-libs-0.1.0.tgz` file to a new directory. e.g: `make-transaction`
3. Create the following files in that directory.
4. run `npm install` and `npm install js-chain-libs-0.1.0.tgz` in that directory.
5. run `npm run serve` and open a browser in `http://localhost:8080/`. The generated transaction should be logged in the console.

#### package.json

```json
{
  "scripts": {
    "build": "webpack",
    "serve": "webpack-dev-server"
  },
  "devDependencies": {
    "text-encoding": "^0.7.0",
    "html-webpack-plugin": "^3.2.0",
    "webpack": "^4.29.4",
    "webpack-cli": "^3.1.1",
    "webpack-dev-server": "^3.1.0"
  },
  "dependencies": {
    "js-chain-libs": "file:js-chain-libs-0.1.0.tgz"
  }
}
```

#### webpack.config.js

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  plugins: [
    new HtmlWebpackPlugin(),
    // Have this example work in Edge which doesn't ship `TextEncoder` or
    // `TextDecoder` at this time.
    new webpack.ProvidePlugin({
      TextDecoder: ['text-encoding', 'TextDecoder'],
      TextEncoder: ['text-encoding', 'TextEncoder']
    })
  ],
  mode: 'development'
};

```

#### index.js

```js
/* eslint-disable promise/always-return */
/* eslint-disable no-console */
/* eslint-disable promise/catch-or-return */
const rust = import('js-chain-libs');

rust.then(mod => {
  const {
    OutputPolicy,
    TransactionBuilder,
    Address,
    Input,
    Value,
    Fee,
    TransactionFinalizer,
    Fragment,
    PrivateKey,
    Witness,
    SpendingCounter,
    Hash,
    Account,
    // eslint-disable-next-line camelcase
    uint8array_to_hex
  } = mod;

  const txbuilder = new TransactionBuilder();

  const accountInputAddress = Address.from_string(
    'ca1qh9u0nxmnfg7af8ycuygx57p5xgzmnmgtaeer9xun7hly6mlgt3pj2xk344'
  );
  const account = Account.from_address(accountInputAddress);

  const input = Input.from_account(account, Value.from_u64(BigInt(1000)));

  txbuilder.add_input(input);

  txbuilder.add_output(
    Address.from_string(
      'ca1q5nr5pvt9e5p009strshxndrsx5etcentslp2rwj6csm8sfk24a2w3swacn'
    ),
    Value.from_u64(BigInt(500))
  );

  const feeAlgorithm = Fee.linear_fee(
    // constant fee
    BigInt(20),
    // coefficient
    BigInt(5),
    // certificate cost
    BigInt(0)
  );

  const finalizedTx = txbuilder.finalize(
    feeAlgorithm,
    OutputPolicy.one(accountInputAddress)
  );

  const finalizer = new TransactionFinalizer(finalizedTx);

  // Sign the transaction
  // We need the genesis hash, the transaction id and the input account private key
  const genesisHash =
    '6a702a181151b772ca0acbdc4d2870ed80c09b626b29fffc2e47abf2330ad0cd';
  const txid = finalizer.get_txid();
  const privateKey = PrivateKey.from_bech32(
    'ed25519e_sk1gz0ff4w444nwejap5shxrllypz5euswq6wn04fffzes02atw99xkd4jn838v3vrfg9eqt7f4sxjlsy0tdcmj0d2dqvwc8ztwgyfnwyszvjg32'
  );

  const witness = Witness.for_account(
    Hash.from_hex(genesisHash),
    txid,
    privateKey,
    SpendingCounter.zero()
  );

  finalizer.set_witness(0, witness);

  const signedTx = finalizer.build();

  const readyToSendTx = Fragment.from_generated_transaction(signedTx);

  console.log(uint8array_to_hex(readyToSendTx.as_bytes()));
});
```

## Testing

Run the tests with

```sh
wasm-pack test --headless --chrome
```