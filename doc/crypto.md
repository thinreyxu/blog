在Node.js中加密字符串
====================

Node.js有个内置的加密模块crypto。可以创建多种对象，例如 Credentials，Hash，Hmac，Cipher，Decipher，Sign，Verify，DiffieHellman。


使用Hash对象加密的步骤
---------------------

1. 首先载入 crypto 模块；
2. 使用`crypto.createHash(algorithms)`创建散列对象（hash object），这个对象用于生成散列摘要（hash digests）；散列对象是一种流（stream），可以多次写入要加密的数据，待写入完成，读取加密结果即可。
3. 使用`hashObject.update(data, [input_encoding])`写入要加密的数据；其中`input_encoding`可以是utf-8，ascii，binary。此方法可以被调用多次。亦可用`write()`方法。
4. 使用`hashObject.digest([encoding]`获取散列摘要；`encoding`可以为 hex，binary，base64。亦可用`read()`方法。


Hash对象支持的各种加密算法
-------------------------

加密算法的支持，取决于平台上的OpenSSL的版本，可以使用`$ openssl list-message-digest-algorithms`命令罗列，也可以使用`crypto.getHashes()`方法罗列。常用的有 sha1，md5，sha256，sha512。


使用Hash对象进行密码加密
-----------------------

```javascript
var crypto = require('crypto')
  , password, shasum, encrypted;

algorithms = 'sha256';
password = '123456';
shasum = crypto.createHash(algorithms).update(password);
encrypted = shaxum.digest('hex');
```


- - -

### 参考
1. ["Node.js APIs - Crypto"][1]



[1]: http://nodejs.org/api/crypto.html#crypto_crypto_createcredentials_details "Node.js APIs - Crypto"