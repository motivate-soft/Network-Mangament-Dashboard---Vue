const ipNumber1 = '(?:0{0,2}[1-9]|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])';
const ipNumber2 = '(?:0{0,2}[0-9]|0?[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])';
const mask = '(?:0?[1-9]|[1-2][0-9]|3[0-2])';

export default {
  data() {
    return {
      rules:
        {
          required: value => !!value || "Required value",
          hostname: value => {
            const patternIP = new RegExp('^' + ipNumber1 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '$');
            const pattern = /^([a-z\d]([a-z\d-]{0,61}[a-z\d])?\.){2,}[a-z\d]([a-z\d-]{0,61}[a-z\d])+$/i;
            if (value && value.length > 255) return 'Too long hostname';
            return value ? (pattern.test(value) ? (patternIP.test(value) ? 'Invalid hostname' : true) : "Invalid hostname") : true;
          },
          ip: value => {
            const pattern = new RegExp('^' + ipNumber1 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '$');
            return value ? pattern.test(value) || "Invalid IP address" : true;
          },
          ipmask: value => {
            if(value === '0.0.0.0/0' || !value) return true;
            const patternIP = new RegExp('^' + ipNumber1 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '\\.' + ipNumber2 + '$');
            const patternMask = new RegExp('^' + mask + '$');
            const parts = (value || '').split('/');
            if (!patternIP.test(parts[0].trim())) return 'Invalid IP address';
            if (parts.length !==2 || parts[1].length === 0) return 'Missing subnet mask';
            if (!patternMask.test(parts[1].trim())) return 'Invalid subnet mask';
            // const octets = parts[0].split('.');
            // if ((1 * octets[3] + 256 * (octets[2] + 256 * (octets[1] + 256 * octets[0]))) % Math.pow(2, 32 - parts[1])) return 'This is a host address - not a network';
            return true;
          },
          iphost: (value) => {
            const isIP = this.rules.ip(value);
            const isHost = this.rules.hostname(value);
            if(isIP === true || isHost === true) return true;
            return 'Neither hostname or IP';
          },
          port: value => {
            if (isNaN(Math.round(value))) return 'Not a number';
            if (Math.abs(Math.round(value || 0) - value) > 0) return 'Must be integer';
            if (value < 1 || value > 65535) return 'Invalid port (1 - 65535)';
            return true;
          },
          anyport: value => {
            if (isNaN(Math.round(value))) return 'Not a number';
            if (Math.abs(Math.round(value || 0) - value) > 0) return 'Must be integer';
            if (value < 0 || value > 65535) return 'Invalid port (1 - 65535)';
            return true;
          },
          arrayPortRanges: value => {
            // we allow either a single range, or a comma-delimited list of scalar values
            if (!value) return true; // we allow ANY
            if (value[value.length - 1] === ',') return 'Dangling comma';
            // first check for a range
            const list = value.split('-');
            if (list.length > 2) return 'Range contains more than 2 values - check for missing comma';
            else if (list.length === 2) {
              // this is a range
              const numStart = list[0].trim() || 0;
              if (isNaN(numStart)) return 'Not a number (' + list[0] + ')';
              if (Math.abs(Math.round(numStart) - numStart) > 0) return 'Range start port is not integer (' + list[0] + ')';
              if (numStart < 0 || numStart > 65535) return 'Range start must be between 1 and 65535 (' + list[0] + ')';
              const numEnd = list[1].trim() || 0;
              if (isNaN(numEnd)) return 'Not a number (' + list[1] + ')';
              if (Math.abs(Math.round(numEnd) - numEnd) > 0) return 'Range end port is not integer (' + list[1] + ')';
              if (numEnd < 0 || numEnd > 65535) return 'Range end must be between 1 and 65535 (' + list[1] + ')';
              if (numStart >= numEnd) return 'Range start port must be lower than end port (' + list[0] + ' < ' + list[1] + ')';
            } else {
              // check for list of values
              const ranges = value.split(',');
              let msg = '';
              const valid = ranges.every(item => {
                const numStart = item.trim() || 0;
                if (isNaN(numStart)) return 'Not a number (' + item + ')';
                if (Math.abs(Math.round(numStart) - numStart) > 0) {
                  msg = 'Port must be integer (' + item + ')';
                  return false;
                }
                if (numStart < 0 || numStart > 65535) {
                  msg = 'Port must be between 1 and 65535 (' + item + ')';
                  return false;
                }
                return true;
              });
              return valid || msg;
            }
            return true;
          },
          email: value => {
            const pattern = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return !value || pattern.test(value) || "Invalid email.";
          },
          phone: (value) => {
            const pattern = /^(\+(\([0-9]{2,4}\))?|\(\+?[0-9]{2,4}\))?[0-9]{5,12}$/;
            return !value || pattern.test(value.replace(/[ .-]/g, '')) || "Invalid phone.";
          },
        }
    }
  }
}
