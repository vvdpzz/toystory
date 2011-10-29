(function (a) {
    function b(r, y, v, z) {
        z = {
            data: z || (y ? y.data : {}),
            _wrap: y ? y._wrap : null,
            tmpl: null,
            parent: y || null,
            nodes: [],
            calls: t,
            nest: o,
            wrap: w,
            html: c,
            update: x
        };
        r && a.extend(z, r, {
            nodes: [],
            parent: y
        });
        if (v) {
            z.tmpl = v;
            z._ctnt = z._ctnt || z.tmpl(a, z);
            z.key = ++F;
            (K.length ? n : l)[F] = z
        }
        return z
    }
    function e(r, y, v) {
        var z;
        v = v ? a.map(v, function (I) {
            return typeof I === "string" ? r.key ? I.replace(/(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + k + '="' + r.key + '" $2') : I : e(I, r, I._ctnt)
        }) : r;
        if (y) return v;
        v = v.join("");
        v.replace(/^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function (I, M, P, T) {
            z = a(P).get();
            p(z);
            if (M) z = h(M).concat(z);
            if (T) z = z.concat(h(T))
        });
        return z ? z : h(v)
    }
    function h(r) {
        var y = document.createElement("div");
        y.innerHTML = r;
        return a.makeArray(y.childNodes)
    }
    function f(r) {
        return new Function("jQuery", "$item", "var $=jQuery,call,_=[],$data=$item.data;with($data){_.push('" + a.trim(r).replace(/([\\'])/g, "\\$1").replace(/[\r\t\n]/g, " ").replace(/\$\{([^\}]*)\}/g, "{{= $1}}").replace(/\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g, function (y, v, z, I, M, P, T) {
            y = a.tmpl.tag[z];
            if (!y) throw "Template command not found: " + z;
            z = y._default || [];
            if (P && !/\w$/.test(M)) {
                M += P;
                P = ""
            }
            if (M) {
                M = m(M);
                T = T ? "," + m(T) + ")" : P ? ")" : "";
                T = P ? M.indexOf(".") > -1 ? M + P : "(" + M + ").call($item" + T : M;
                P = P ? T : "(typeof(" + M + ")==='function'?(" + M + ").call($item):(" + M + "))"
            } else P = T = z.$1 || "null";
            I = m(I);
            return "');" + y[v ? "close" : "open"].split("$notnull_1").join(M ? "typeof(" + M + ")!=='undefined' && (" + M + ")!=null" : "true").split("$1a").join(P).split("$1").join(T).split("$2").join(I ? I.replace(/\s*([^\(]+)\s*(\((.*?)\))?/g, function (B, E, N, R) {
                return (R = R ? "," + R + ")" : N ? ")" : "") ? "(" + E + ").call($item" + R : B
            }) : z.$2 || "") + "_.push('"
        }) + "');}return _;")
    }
    function g(r, y) {
        r._wrap = e(r, true, a.isArray(y) ? y : [j.test(y) ? y : a(y).html()]).join("")
    }
    function m(r) {
        return r ? r.replace(/\\'/g, "'").replace(/\\\\/g, "\\") : null
    }
    function p(r) {
        function y(E) {
            function N(aa) {
                aa += v;
                S = M[aa] = M[aa] || b(S, l[S.parent.key + v] || S.parent, null, true)
            }
            var R, W = E,
                S, X;
            if (X = E.getAttribute(k)) {
                for (; W.parentNode && (W = W.parentNode).nodeType === 1 && !(R = W.getAttribute(k)););
                if (R !== X) {
                    W = W.parentNode ? W.nodeType === 11 ? 0 : W.getAttribute(k) || 0 : 0;
                    if (!(S = l[X])) {
                        S = n[X];
                        S = b(S, l[W] || n[W], null, true);
                        S.key = ++F;
                        l[F] = S
                    }
                    L && N(X)
                }
                E.removeAttribute(k)
            } else if (L && (S = a.data(E, "tmplItem"))) {
                N(S.key);
                l[S.key] = S;
                W = (W = a.data(E.parentNode, "tmplItem")) ? W.key : 0
            }
            if (S) {
                for (R = S; R && R.key != W;) {
                    R.nodes.push(E);
                    R = R.parent
                }
                delete S._ctnt;
                delete S._wrap;
                a.data(E, "tmplItem", S)
            }
        }
        var v = "_" + L,
            z, I, M = {},
            P, T, B;
        P = 0;
        for (T = r.length; P < T; P++) if ((z = r[P]).nodeType === 1) {
            I = z.getElementsByTagName("*");
            for (B = I.length - 1; B >= 0; B--) y(I[B]);
            y(z)
        }
    }
    function t(r, y, v, z) {
        if (!r) return K.pop();
        K.push({
            _: r,
            tmpl: y,
            item: this,
            data: v,
            options: z
        })
    }
    function o(r, y, v) {
        return a.tmpl(a.template(r), y, v, this)
    }
    function w(r, y) {
        var v = r.options || {};
        v.wrapped = y;
        return a.tmpl(a.template(r.tmpl), r.data, v, r.item)
    }
    function c(r, y) {
        var v = this._wrap;
        return a.map(a(a.isArray(v) ? v.join("") : v).filter(r || "*"), function (z) {
            if (y) z = z.innerText || z.textContent;
            else {
                var I;
                if (!(I = z.outerHTML)) {
                    I = document.createElement("div");
                    I.appendChild(z.cloneNode(true));
                    I = I.innerHTML
                }
                z = I
            }
            return z
        })
    }

    function x() {
        var r = this.nodes;
        a.tmpl(null, null, null, this).insertBefore(r[0]);
        a(r).remove()
    }
    var D = a.fn.domManip,
        k = "_tmplitem",
        j = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
        l = {},
        n = {},
        s, A = {
            key: 0,
            data: {}
        },
        F = 0,
        L = 0,
        K = [];
    a.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function (r, y) {
        a.fn[r] = function (v) {
            var z = [];
            v = a(v);
            var I, M, P;
            I = this.length === 1 && this[0].parentNode;
            s = l || {};
            if (I && I.nodeType === 11 && I.childNodes.length === 1 && v.length === 1) {
                v[y](this[0]);
                z = this
            } else {
                M = 0;
                for (P = v.length; M < P; M++) {
                    L = M;
                    I = (M > 0 ? this.clone(true) : this).get();
                    a.fn[y].apply(a(v[M]), I);
                    z = z.concat(I)
                }
                L = 0;
                z = this.pushStack(z, r, v.selector)
            }
            v = s;
            s = null;
            a.tmpl.complete(v);
            return z
        }
    });
    a.fn.extend({
        tmpl: function (r, y, v) {
            return a.tmpl(this[0], r, y, v)
        },
        tmplItem: function () {
            return a.tmplItem(this[0])
        },
        template: function (r) {
            return a.template(r, this[0])
        },
        domManip: function (r, y, v) {
            if (r[0] && r[0].nodeType) {
                for (var z = a.makeArray(arguments), I = r.length, M = 0, P; M < I && !(P = a.data(r[M++], "tmplItem")););
                if (I > 1) z[0] = [a.makeArray(r)];
                if (P && L) z[2] = function (T) {
                    a.tmpl.afterManip(this, T, v)
                };
                D.apply(this, z)
            } else D.apply(this, arguments);
            L = 0;
            s || a.tmpl.complete(l);
            return this
        }
    });
    a.extend({
        tmpl: function (r, y, v, z) {
            var I = !z;
            if (I) {
                z = A;
                r = a.template[r] || a.template(null, r);
                n = {}
            } else if (!r) {
                r = z.tmpl;
                l[z.key] = z;
                z.nodes = [];
                z.wrapped && g(z, z.wrapped);
                return a(e(z, null, z.tmpl(a, z)))
            }
            if (!r) return [];
            if (typeof y === "function") y = y.call(z || {});
            v && v.wrapped && g(v, v.wrapped);
            y = a.isArray(y) ? a.map(y, function (M) {
                return M ? b(v, z, r, M) : null
            }) : [b(v, z, r, y)];
            return I ? a(e(z, null, y)) : y
        },
        tmplItem: function (r) {
            var y;
            if (r instanceof a) r = r[0];
            for (; r && r.nodeType === 1 && !(y = a.data(r, "tmplItem")) && (r = r.parentNode););
            return y || A
        },
        template: function (r, y) {
            if (y) {
                if (typeof y === "string") y = f(y);
                else if (y instanceof a) y = y[0] || {};
                if (y.nodeType) y = a.data(y, "tmpl") || a.data(y, "tmpl", f(y.innerHTML));
                return typeof r === "string" ? a.template[r] = y : y
            }
            return r ? typeof r !== "string" ? a.template(null, r) : a.template[r] || a.template(null, j.test(r) ? r : a(r)) : null
        },
        encode: function (r) {
            return ("" + r).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;")
        }
    });
    a.extend(a.tmpl, {
        tag: {
            tmpl: {
                _default: {
                    $2: "null"
                },
                open: "if($notnull_1){_=_.concat($item.nest($1,$2));}"
            },
            wrap: {
                _default: {
                    $2: "null"
                },
                open: "$item.calls(_,$1,$2);_=[];",
                close: "call=$item.calls();_=call._.concat($item.wrap(call,_));"
            },
            each: {
                _default: {
                    $2: "$index, $value"
                },
                open: "if($notnull_1){$.each($1a,function($2){with(this){",
                close: "}});}"
            },
            "if": {
                open: "if(($notnull_1) && $1a){",
                close: "}"
            },
            "else": {
                _default: {
                    $1: "true"
                },
                open: "}else if(($notnull_1) && $1a){"
            },
            html: {
                open: "if($notnull_1){_.push($1a);}"
            },
            "=": {
                _default: {
                    $1: "$data"
                },
                open: "if($notnull_1){_.push($.encode($1a));}"
            },
            "!": {
                open: ""
            }
        },
        complete: function () {
            l = {}
        },
        afterManip: function (r, y, v) {
            var z = y.nodeType === 11 ? a.makeArray(y.childNodes) : y.nodeType === 1 ? [y] : [];
            v.call(r, y);
            p(z);
            L++
        }
    })
})(jQuery);