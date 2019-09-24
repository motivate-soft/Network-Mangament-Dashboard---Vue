import Vue from "vue"

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const factorMegabytes = 1024;
const factorMegabits = 1024;

Vue.filter("bandwidth", function(value) {
  if (!isNumber(value)) return "";
  if (typeof value !== "number") {
    value = Number(value);
  }
  if (value === 0) {
    return "0";
  }
  if (value < factorMegabits) return value + " bps";
  else value = value / factorMegabits;
  if (value < factorMegabits) return value.toFixed(2) + " Kbps";
  else value = value / factorMegabits;
  if (value < factorMegabits) return value.toFixed(2) + " Mbps";
  else value = value / factorMegabits;
  if (value < factorMegabits) return value.toFixed(2) + " Gbps";
  else return (value / factorMegabits).toFixed(2) + " Tbps";
});

Vue.filter("traffic", function(value) {
  if (!isNumber(value)) return "";
  if (typeof value !== "number") {
    value = Number(value);
  }
  if (value === 0) {
    return "0";
  }
  if (value < factorMegabytes) return value + " Bytes";
  else value = value / factorMegabytes;
  if (value < factorMegabytes) return value.toFixed(2) + " KB";
  else value = value / factorMegabytes;
  if (value < factorMegabytes) return value.toFixed(2) + " MB";
  else value = value / factorMegabytes;
  if (value < factorMegabytes) return value.toFixed(2) + " GB";
  else return (value / factorMegabytes).toFixed(2) + " TB";
});

Vue.filter("gigabyte", function(value) {
  return Math.round(100 * value / factorMegabytes / factorMegabytes / factorMegabytes) / 100;
});

Vue.filter("megabyte", function(value) {
  return Math.round(100 * value / factorMegabytes / factorMegabytes) / 100;
});

Vue.filter("kilobyte", function(value) {
  return Math.round(100 * value / factorMegabytes) / 100;
});

Vue.filter("thousand", function(value) {
  return String(value).replace(/([^-])(?=(\d{3})+(\.\d\d)?$)/g,'$1,');
});

Vue.filter("round", function(value) {
  return Math.round(value);
});

Vue.filter("maxDecimalPoints", function(value, maxDigits) {
  maxDigits = maxDigits || 2;
  let pow = Math.pow(10, maxDigits);
  return Math.floor(value * pow) / pow;
});

Vue.filter("secondsTime", function(seconds) {
  const sec = seconds % 60;
  const min = ((seconds - sec) / 60) % 60;
  const hour = Math.floor(seconds/3600);
  return hour + ':' + (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + Math.floor(sec);
});

Vue.filter("stampLocale", function(d) {
  if (!d) return '\u00A0';
  if (typeof d === 'string') d = new Date(d);
  return (d ? d.toLocaleString(undefined, {
    year: 'numeric',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }) : '\u00A0');
});

Vue.filter("dateLocale", function(d) {
  if (!d) return '\u00A0';
  if (typeof d === 'string') d = new Date(d);
  return (d ? d.toLocaleString(undefined, {
    year: 'numeric',
    day: 'numeric',
    month: 'short',
  }) : '\u00A0');
});

// value must be a Date instance
Vue.filter("daysRemain", function(d) {
  if (!d) return '';
  if (typeof d === 'string') d = new Date(d);
  const today = (new Date()).getTime();
  return (d ? Math.floor((d.getTime() - today) / 86400000) : '');
});

// value must be in minutes
Vue.filter("uptime", function(d) {
  if (typeof d !== 'number') return '';
  if(d < 60) return '00:' + (d < 10 ? '0' + d : d);
  const minutes = d % 60;
  d = (d - minutes) / 60;
  if(d < 24) return (d < 10 ? '0' + d : d) + ':' + (minutes < 10 ? '0' + minutes : minutes);
  const hours = d % 24;
  d = (d - hours) / 24;
  return d + ' days, ' + (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
});
