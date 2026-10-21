/* qrcode.js - a tiny, dependency-free QR code generator for the Golden Triangle demo. Supports text up to ~100 characters (QR versions 1-5, error correction level L). Usage: GTQR.svg("some text", 200) -> an SVG string you can put in the page. */
(function (root) {
  "use strict";

  // ---- Reed-Solomon maths (GF(256), polynomial 0x11d) ----
  var EXP = [],
    LOG = [];
  (function () {
    var x = 1,
      i;
    for (i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function gmul(a, b) {
    return a && b ? EXP[LOG[a] + LOG[b]] : 0;
  }
  function rsGenerator(n) {
    var g = [1],
      i,
      j;
    for (i = 0; i < n; i++) {
      var ng = [];
      for (j = 0; j <= g.length; j++) ng.push(0);
      for (j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= gmul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }
  function rsRemainder(data, n) {
    var g = rsGenerator(n),
      res = [],
      i;
    for (i = 0; i < n; i++) res.push(0);
    data.forEach(function (b) {
      var f = b ^ res.shift();
      res.push(0);
      for (i = 0; i < n; i++) res[i] ^= gmul(g[i + 1], f);
    });
    return res;
  }

  // version: [data codewords, error-correction codewords, alignment pattern positions] (level L)
  var VERSIONS = {
    1: [19, 7, []],
    2: [34, 10, [6, 18]],
    3: [55, 15, [6, 22]],
    4: [80, 20, [6, 26]],
    5: [108, 26, [6, 30]],
  };

  function utf8(text) {
    var s = unescape(encodeURIComponent(text)),
      out = [],
      i;
    for (i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function makeMatrix(text) {
    var bytes = utf8(text),
      ver = 0,
      v;
    for (v = 1; v <= 5; v++) {
      if (4 + 8 + bytes.length * 8 <= VERSIONS[v][0] * 8) {
        ver = v;
        break;
      }
    }
    if (!ver) throw new Error("Text too long for this QR generator");
    var dataCw = VERSIONS[ver][0],
      ecCw = VERSIONS[ver][1],
      align = VERSIONS[ver][2];
    var size = 17 + 4 * ver;

    // ---- 1. build the data bits ----
    var bits = [];
    function push(val, len) {
      for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }
    push(4, 4); // byte mode
    push(bytes.length, 8); // character count
    bytes.forEach(function (b) {
      push(b, 8);
    });
    var cap = dataCw * 8;
    push(0, Math.min(4, cap - bits.length));
    while (bits.length % 8) bits.push(0);
    for (var pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) push(pad, 8);

    var data = [],
      i,
      j;
    for (i = 0; i < bits.length; i += 8) {
      var byte = 0;
      for (j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      data.push(byte);
    }
    var all = data.concat(rsRemainder(data, ecCw));
    var stream = [];
    all.forEach(function (b) {
      for (var k = 7; k >= 0; k--) stream.push((b >>> k) & 1);
    });
    if (ver > 1) for (i = 0; i < 7; i++) stream.push(0); // remainder bits

    // ---- 2. draw the fixed patterns ----
    var m = [],
      fn = [];
    for (i = 0; i < size; i++) {
      m.push([]);
      fn.push([]);
      for (j = 0; j < size; j++) {
        m[i].push(false);
        fn[i].push(false);
      }
    }
    function sf(x, y, dark) {
      m[y][x] = !!dark;
      fn[y][x] = true;
    }

    for (i = 0; i < size; i++) {
      sf(6, i, i % 2 === 0);
      sf(i, 6, i % 2 === 0);
    } // timing
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++)
        for (var dx = -4; dx <= 4; dx++) {
          var x = cx + dx,
            y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) {
            var d = Math.max(Math.abs(dx), Math.abs(dy));
            sf(x, y, d !== 2 && d !== 4);
          }
        }
    }
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);
    align.forEach(function (ax, a) {
      align.forEach(function (ay, b) {
        var last = align.length - 1;
        if (
          (a === 0 && b === 0) ||
          (a === 0 && b === last) ||
          (a === last && b === 0)
        )
          return;
        for (var dy = -2; dy <= 2; dy++)
          for (var dx = -2; dx <= 2; dx++) {
            sf(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
      });
    });

    function drawFormat(mask) {
      var d = (1 << 3) | mask; // error correction level L = 01
      var rem = d,
        k;
      for (k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var f = ((d << 10) | rem) ^ 0x5412;
      function bit(n) {
        return ((f >>> n) & 1) !== 0;
      }
      for (k = 0; k <= 5; k++) sf(8, k, bit(k));
      sf(8, 7, bit(6));
      sf(8, 8, bit(7));
      sf(7, 8, bit(8));
      for (k = 9; k < 15; k++) sf(14 - k, 8, bit(k));
      for (k = 0; k < 8; k++) sf(size - 1 - k, 8, bit(k));
      for (k = 8; k < 15; k++) sf(8, size - 15 + k, bit(k));
      sf(8, size - 8, true); // always-dark module
    }
    drawFormat(0);

    // ---- 3. place the data ----
    var idx = 0,
      right,
      vert,
      x,
      y,
      up;
    for (right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (vert = 0; vert < size; vert++) {
        for (j = 0; j < 2; j++) {
          x = right - j;
          up = ((right + 1) & 2) === 0;
          y = up ? size - 1 - vert : vert;
          if (!fn[y][x] && idx < stream.length) {
            m[y][x] = stream[idx] === 1;
            idx++;
          }
        }
      }
    }

    // ---- 4. choose the best mask ----
    function inMask(mask, x, y) {
      switch (mask) {
        case 0:
          return (x + y) % 2 === 0;
        case 1:
          return y % 2 === 0;
        case 2:
          return x % 3 === 0;
        case 3:
          return (x + y) % 3 === 0;
        case 4:
          return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        case 5:
          return ((x * y) % 2) + ((x * y) % 3) === 0;
        case 6:
          return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
        default:
          return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
      }
    }
    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++)
        for (var xx = 0; xx < size; xx++)
          if (!fn[yy][xx] && inMask(mask, xx, yy)) m[yy][xx] = !m[yy][xx];
    }
    function penalty() {
      var p = 0,
        a,
        b,
        run,
        dark = 0;
      for (a = 0; a < size; a++) {
        // rule 1: runs of 5+ same colour
        for (var dir = 0; dir < 2; dir++) {
          run = 1;
          for (b = 1; b < size; b++) {
            var cur = dir ? m[b][a] : m[a][b],
              prev = dir ? m[b - 1][a] : m[a][b - 1];
            if (cur === prev) {
              run++;
              if (run === 5) p += 3;
              else if (run > 5) p++;
            } else run = 1;
          }
        }
      }
      for (a = 0; a < size - 1; a++)
        for (
          b = 0;
          b < size - 1;
          b++ // rule 2: 2x2 blocks
        )
          if (
            m[a][b] === m[a][b + 1] &&
            m[a][b] === m[a + 1][b] &&
            m[a][b] === m[a + 1][b + 1]
          )
            p += 3;
      var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
        pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1]; // rule 3: finder-like
      for (a = 0; a < size; a++)
        for (b = 0; b <= size - 11; b++) {
          var h1 = true,
            h2 = true,
            v1 = true,
            v2 = true;
          for (var k = 0; k < 11; k++) {
            var hv = m[a][b + k] ? 1 : 0,
              vv = m[b + k][a] ? 1 : 0;
            if (hv !== pat1[k]) h1 = false;
            if (hv !== pat2[k]) h2 = false;
            if (vv !== pat1[k]) v1 = false;
            if (vv !== pat2[k]) v2 = false;
          }
          p += 40 * ((h1 ? 1 : 0) + (h2 ? 1 : 0) + (v1 ? 1 : 0) + (v2 ? 1 : 0));
        }
      for (a = 0; a < size; a++) for (b = 0; b < size; b++) if (m[a][b]) dark++; // rule 4: balance
      p +=
        Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return p;
    }
    var best = 0,
      bestScore = Infinity,
      mask;
    for (mask = 0; mask < 8; mask++) {
      applyMask(mask);
      drawFormat(mask);
      var score = penalty();
      if (score < bestScore) {
        bestScore = score;
        best = mask;
      }
      applyMask(mask); // undo
    }
    applyMask(best);
    drawFormat(best);
    return m;
  }

  function svg(text, px) {
    var m = makeMatrix(text),
      n = m.length,
      q = 4,
      total = n + q * 2,
      d = "",
      x,
      y;
    for (y = 0; y < n; y++)
      for (x = 0; x < n; x++)
        if (m[y][x]) d += "M" + (x + q) + " " + (y + q) + "h1v1h-1z";
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      total +
      " " +
      total +
      '" width="' +
      (px || 200) +
      '" height="' +
      (px || 200) +
      '" shape-rendering="crispEdges" role="img" aria-label="QR code">' +
      '<rect width="100%" height="100%" fill="#fff"/><path d="' +
      d +
      '" fill="#10302b"/></svg>'
    );
  }

  var api = { svg: svg, matrix: makeMatrix };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.GTQR = api;
})(typeof window !== "undefined" ? window : globalThis);
