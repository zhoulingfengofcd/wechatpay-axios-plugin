const { createHash, createHmac, timingSafeEqual } = require('crypto');

const Formatter = require('./formatter');

/**
 * Crypto hash functions utils.
 * [Specification]{@link https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=4_3}
 */
class Hash {
  /**
   * Calculate the input string with an optional secret `key` in MD5,
   * when the `key` is Falsey, this method works as normal `MD5`.
   *
   * - [agency] is available {@since v0.4.3}, [spec]{@link https://work.weixin.qq.com/api/doc/90000/90135/90281}
   *
   * @param {string|buffer} thing - The input string.
   * @param {string} [key] - The secret key string.
   * @param {boolean|number|string} [agency = false] - The secret **key** is from wework, placed with `true` or better of the `AgentId` value.
   *
   * @return {string} - data signature
   */
  static md5(thing, key = '', agency = false) {
    return createHash('md5').update(thing).update(`${key ? `&${agency ? 'secret' : 'key'}=${key}` : ''}`).digest('hex');
  }

  /**
   * Calculate the input string with a secret `key` as of `algorithm` string which is one of the 'sha256', 'sha512' etc.
   * @param {string|buffer} thing - The input string.
   * @param {string} key - The secret key string.
   * @param {string} [algorithm = sha256] - The algorithm string, default is `sha256`.
   * @return {string} - data signature
   */
  static hmac(thing, key, algorithm = 'sha256') {
    return createHmac(algorithm, key).update(thing).update(`&key=${key}`).digest('hex');
  }

  /**
   * @deprecated {@since v0.5.5}, instead of by `hmac`
   *
   * Calculate the input string with a secret `key` in HMAC-SHA256
   * @param {string|buffer} thing - The input string.
   * @param {string} key - The secret key string.
   * @return {string} - data signature
   */
  static hmacSha256(thing, key) {
    return this.hmac(thing, key, 'sha256');
  }

  /**
   * Calculate the input in SHA1.
   * @param {string|buffer} thing - The input.
   * @return {string} - data signature
   */
  static sha1(thing) {
    return createHash('sha1').update(thing).digest('hex');
  }

  /**
   * Calculate the input in SHA256.
   * @param {string|buffer} thing - The input.
   * @return {string} - data signature
   */
  static sha256(thing) {
    return createHash('sha256').update(thing).digest('hex');
  }

  /**
   * Wrapping the builtins `crypto.timingSafeEqual` function.
   * @param {string} known - The string of known length to compare against.
   * @param {string?} [user] - The user-supplied string.
   * @return {boolean} - Returns true when the two are equal, false otherwise.
   */
  static equals(known, user) {
    const a = Buffer.from(known);
    const b = (user === undefined || user === null) ? undefined : Buffer.from(user);
    return undefined !== b && a.length === b.length && timingSafeEqual(a, b);
  }

  /**
   * Utils of the data signature calculation.
   * @param {string} type - The sign type, one of the MD5 or HMAC-SHA256.
   * @param {object} data - The input data.
   * @param {string} key - The secret key string.
   * @return {string} - The data signature.
   */
  static sign(type, data, key) {
    const alias = {
      MD5: this.md5,
      'HMAC-SHA256': this.hmac,
    };

    return alias[type](Formatter.queryStringLike(Formatter.ksort(data)), key).toUpperCase();
  }
}

module.exports = Hash;
module.exports.default = Hash;
