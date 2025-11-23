/**
 * 手机号工具函数
 */

/**
 * 归一化手机号：去除空格、短横线、全角数字、+86/0086 前缀
 * @param {string} phone - 原始手机号
 * @returns {string} 归一化后的手机号
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  
  // 去除前后空格
  let normalized = phone.trim();
  
  // 去除空格、短横线
  normalized = normalized.replace(/[\s\-]/g, '');
  
  // 全角数字转半角
  normalized = normalized.replace(/[０-９]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - '０'.charCodeAt(0) + '0'.charCodeAt(0));
  });
  
  // 去除 +86 或 0086 前缀
  normalized = normalized.replace(/^(\+?86|0086)/, '');
  
  // 仅保留数字
  normalized = normalized.replace(/\D/g, '');
  
  // 如果超过 11 位，取最后 11 位
  if (normalized.length > 11) {
    normalized = normalized.slice(-11);
  }
  
  return normalized;
}

/**
 * 校验手机号格式（中国大陆）
 * @param {string} phone - 手机号
 * @returns {boolean} 是否合法
 */
export function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  // 1 开头，第二位 3-9，共 11 位
  return /^1[3-9]\d{9}$/.test(normalized);
}
