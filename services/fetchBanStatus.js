const axios = require('axios');

/**
 * Garena Official Anti-Hack Period Mapping
 * Period 1: 7 Days (1 Week)
 * Period 2: 30 Days (1 Month)
 * Period 3: 90 Days (3 Months)
 * Period 4: 180 Days (6 Months)
 * Period 5: 365 Days (1 Year)
 * Period 6 / Other: Permanent Ban
 */
const BAN_PERIOD_MAP = {
  1: {
    duration: '7 Days',
    duration_days: 7,
    ban_type: 'Temporary Ban',
    status: 'BANNED (7 Days)',
    message: 'We have confirmed that this account has used hack(s) and is suspended for 7 days.'
  },
  2: {
    duration: '30 Days',
    duration_days: 30,
    ban_type: 'Temporary Ban',
    status: 'BANNED (30 Days)',
    message: 'We have confirmed that this account has used hack(s) and is suspended for 30 days.'
  },
  3: {
    duration: '90 Days',
    duration_days: 90,
    ban_type: 'Temporary Ban',
    status: 'BANNED (90 Days)',
    message: 'We have confirmed that this account has used hack(s) and is suspended for 90 days.'
  },
  4: {
    duration: '180 Days',
    duration_days: 180,
    ban_type: 'Temporary Ban',
    status: 'BANNED (180 Days)',
    message: 'We have confirmed that this account has used hack(s) and is suspended for 180 days.'
  },
  5: {
    duration: '365 Days',
    duration_days: 365,
    ban_type: 'Temporary Ban',
    status: 'BANNED (365 Days)',
    message: 'We have confirmed that this account has used hack(s) and is suspended for 365 days (1 Year).'
  },
  6: {
    duration: 'Permanent',
    duration_days: 'Permanent',
    ban_type: 'Permanent Ban',
    status: 'PERMANENTLY BANNED',
    message: 'We have confirmed that this account has used hack(s) and has been banned permanently.'
  }
};

/**
 * Checks ban status directly from Garena Official Anti-Hack system.
 * URL: https://ff.garena.com/api/antihack/check_banned?lang=en&uid=${uid}
 */
async function fetchBanStatus(uid) {
  const url = `https://ff.garena.com/api/antihack/check_banned?lang=en&uid=${encodeURIComponent(uid)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'authority': 'ff.garena.com',
        'referer': 'https://ff.garena.com/en/support/',
        'x-requested-with': 'B6FksShzIgjfrYImLpTsadjS86sddhFH'
      },
      timeout: 8000
    });

    const resData = response.data;
    if (resData && resData.status === 'success' && resData.data) {
      const data = resData.data;
      const isBanned = data.is_banned === 1;
      const periodCode = Number(data.period) || 0;

      if (!isBanned) {
        return {
          is_banned: false,
          ban_status: 'Clean account',
          ban_type: 'None',
          ban_duration: null,
          duration_days: null,
          period_code: 0,
          message: 'There is currently not enough evidence to prove that this account is using hacks.'
        };
      }

      const banInfo = BAN_PERIOD_MAP[periodCode] || {
        duration: periodCode > 0 ? `${periodCode * 30} Days` : 'Permanent',
        duration_days: periodCode > 0 ? periodCode * 30 : 'Permanent',
        ban_type: periodCode > 0 ? 'Temporary Ban' : 'Permanent Ban',
        status: periodCode > 0 ? `BANNED (${periodCode * 30} Days)` : 'PERMANENTLY BANNED',
        message: 'We have confirmed that this account has used hack(s) and has been banned.'
      };

      return {
        is_banned: true,
        ban_status: banInfo.status,
        ban_type: banInfo.ban_type,
        ban_duration: banInfo.duration,
        duration_days: banInfo.duration_days,
        period_code: periodCode,
        message: banInfo.message
      };
    } else if (resData && resData.status === 'error') {
      return {
        is_banned: false,
        ban_status: 'ID NOT FOUND',
        ban_type: 'None',
        ban_duration: null,
        duration_days: null,
        period_code: 0,
        message: 'No matched account found on Garena Free Fire servers.',
        error: resData.msg || 'Invalid request'
      };
    }

    return {
      is_banned: false,
      ban_status: 'Clean account',
      ban_type: 'None',
      ban_duration: null,
      duration_days: null,
      period_code: 0,
      message: 'There is currently not enough evidence to prove that this account is using hacks.'
    };
  } catch (error) {
    return {
      is_banned: false,
      ban_status: 'Unknown',
      ban_type: 'Unknown',
      ban_duration: null,
      duration_days: null,
      period_code: 0,
      message: 'Network error checking Garena Anti-Hack API: ' + error.message,
      error: error.message
    };
  }
}

module.exports = { fetchBanStatus };
