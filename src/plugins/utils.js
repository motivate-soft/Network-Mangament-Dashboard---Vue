export function dateWeek(d) {
  if(!d) return 0;
  let onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil( (((d - onejan) / 86400000) + onejan.getDay() + 1) / 7 );
}

export function clone(obj) {
  var copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function merge () {
  let dst = arguments[0], src, p, args = [].splice.call(arguments, 0);

  while (args.length > 0) {
    src = args.splice(0, 1)[0];
    if (src.constructor === Object) {
      for (p in src) {
        if (src.hasOwnProperty(p)) {
          if (src[p] instanceof Date) {
            // handle Date
            dst[p] = new Date();
            dst[p].setTime(src[p].getTime());
          } else if (src[p] && Object.prototype.toString.call(src[p]) === '[object Array]') {
            // handle Array
            dst[p] = src[p].slice();
          } else if (src[p] && src[p].constructor === Object) {
            // handle Object
            dst[p] = merge(dst[p] || {}, src[p]);
          } else {
            // anything else
            dst[p] = src[p];
          }
        }
      }
    }
  }

  return dst;
}
