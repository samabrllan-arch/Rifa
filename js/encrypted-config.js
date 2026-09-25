/**
 * ============================================================================
 * CONFIGURACIÓN SEGURA ENCRIPTADA EN AES-256-GCM
 * Protegido criptográficamente para publicación segura en GitHub.
 * ============================================================================
 */
window.__ENCRYPTED_CONFIG__ = {
  salt: "ce38c36c36b9b2712bdc93cd77822048",
  iv: "60c63ad1bcaf7c5489026fa4",
  tag: "3401f5b31301bf0ee0356fb18f919e4a",
  ciphertext: "eccc07556930978320a497e637082ccc55fadb5d5a8beaeceaa216ab99d8a915ad8c9aecd00740f5f47400d6b6155bf363434bfafeaa9bf4f544302d843b993e1cc9871990fa161e9047298b1cddd1c6bae8e1b1ecdfb52e70be682d4f1d7213ce06805e9883130c949c98fd3d5f4e76adeb302177893aab60bf6e2cb46fc3959bdd1fd74beb04cc75f9287836464019389f5a69678005b34c98229438ccd4f871a380ceb2ad0c34ba459a5488b4",
  algorithm: "AES-256-GCM",
  iterations: 100000
};

/**
 * Desencripta la configuración en el cliente usando Web Crypto API nativa.
 * @param {string} password Clave maestra
 * @returns {Promise<Object|null>} Configuración desencriptada o null si falla la clave
 */
window.decryptRaffleConfig = async function(password) {
  if (!window.__ENCRYPTED_CONFIG__) return null;
  try {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const saltBytes = new Uint8Array(window.__ENCRYPTED_CONFIG__.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const ivBytes = new Uint8Array(window.__ENCRYPTED_CONFIG__.iv.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const tagBytes = new Uint8Array(window.__ENCRYPTED_CONFIG__.tag.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const cipherBytes = new Uint8Array(window.__ENCRYPTED_CONFIG__.ciphertext.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    // Unir ciphertext + authTag para Web Crypto AES-GCM
    const encryptedData = new Uint8Array(cipherBytes.length + tagBytes.length);
    encryptedData.set(cipherBytes, 0);
    encryptedData.set(tagBytes, cipherBytes.length);

    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: window.__ENCRYPTED_CONFIG__.iterations || 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes, tagLength: 128 },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (err) {
    return null;
  }
};
