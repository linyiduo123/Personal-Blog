const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
const { window } = jsdom;
global.window = window;
global.document = window.document;
global.navigator = {
    userAgent:'node.js',
};
const JSEncrypt = require('jsencrypt');

//加密函数
const PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDOqrDYTROS7Qfnl8wbQqdNNbJe35TlPXm4hTlJA/7iXPA5rysXO0iVeu4iC1TmFeG3+nFolNBi/dx5nMI+FJLr/2eDZj5TO96M4qsy2VKfFydvCarcpxl2GZ18b22n/DFTp4vlIClzt6Hb6pj3h4MUEEEbbhNfYN5thLXpj57newIDAQAB'
function encrypt(data) {
  let encryptor = new JSEncrypt.JSEncrypt();  // 新建JSEncrypt对象
  encryptor.setPublicKey(PUBLIC_KEY); // 设置公钥
  const rsaDta = encryptor.encrypt(data); // 进行加密
  return rsaDta
}

//解密函数
const PRIVATE_KEY = 'MIICXAIBAAKBgQDOqrDYTROS7Qfnl8wbQqdNNbJe35TlPXm4hTlJA/7iXPA5rysXO0iVeu4iC1TmFeG3+nFolNBi/dx5nMI+FJLr/2eDZj5TO96M4qsy2VKfFydvCarcpxl2GZ18b22n/DFTp4vlIClzt6Hb6pj3h4MUEEEbbhNfYN5thLXpj57newIDAQABAoGAMTmi6cJiGSrwKQ+VBCE6LD/P/p0OoBOmfHbvEB8thMlSRsscXmo2fbRMKDu+uxcXLnUushRQFmQVMbpO4e6Ql8wWeAJbYThwuRADT1NF0fqyt9V0ZPP49hsuKC2eaFhFlrI4dMWq8wpz/q6Ox99ploS0FiRCXsifZcYDakTEh2ECQQDugLdm4apjND+ftBosutNIMtZrZU1KF5TbeTT2ZgcvSVlYsN2RvQMSquJNVsm4aOcoCTBr3NmywDdPVt7fFLT5AkEA3dQRF60oC7PBltw2LyYgGDfTjlw3v/b9N+fOtW/VK4ilhkSP3nV7JmhHVwsqycwt60qqWu1cuugm1c6OLgSBEwJASOpJJ8buFI4wtV6Wcf5cAcKpEwRRcMls1PxlWL8wiyBdlGPeGWQzwE1GCmbyHNLVeMP2bcODOsbRIgxo7sKh4QJAeJDeiWPPtCyLN5eQy6eJIiCVl3Z/xpJTpqMTMoIJ9pNag9OX7m0j9ggPXjvvkaar/oqidLE2CVBMa0DM/i3siQJBAJzJsl4y/aJh6E3ed5ch8QD0I21cwdfIlT96v0emXHPoWhYXYy7x28VsPka27iAEWSp1FWekSUlHTOPs3Zvezto='
function decrypt(rsaDta) {
  let decryptor = new JSEncrypt.JSEncrypt();  // 新建JSEncrypt对象
  decryptor.setPrivateKey(PRIVATE_KEY); // 设置私钥
  const data = decryptor.decrypt(rsaDta); // 进行解密
  return data
}


module.exports = {
    encrypt,
    decrypt,
}