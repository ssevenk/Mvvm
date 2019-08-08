class Compiler {
    constructor(vm, el) {
        this.$vm = vm
        this.$el = this.isElement(el) ? el : document.querySelector(el)
        if (this.$el) {
            this.$fragment = this.node2fragemt(this.$el)
            this.compile(this.$fragment)
            this.$el.appendChild(this.$fragment)
        }
    }

    //是否是节点
    isElement(node) {
        return node.nodeType == 1;
    }
    //是否是指令
    isDirective(node) {
        return node.substring(0, 2) === 'v-';
    }

    isEventDirevtive(dir) {
        return dir.indexOf('on') === 0;
    }
    //是否是文本节点
    isTextElement(node) {
        return node.nodeType == 3
    }

    //将实际的dom转移到fragment中，方便操作
    node2fragemt(el) {
        var fragment = document.createDocumentFragment()
        var child
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment
    }

    //分类解析节点
    compile(el) {
        var nodes = el.childNodes
        Array.from(nodes).forEach(node => {
            if (this.isElement(node)) {
                this.compileNode(node);
            }
            else if (this.isTextElement(node)) {
                var exps = node.textContent.match(/\{\{.*?\}\}/g) //先进行拆分，比如{{qwe}},{{dre}}就拆分成{{qwe}}和{{dre}}
                if (!exps) return;
                Array.from(exps).forEach(item => {
                    item.match(/\{\{(.*?)\}\}/g)
                    this.compileText(node, item, RegExp.$1.trim()) //通过正则的括号进行捕获，trim()用来去除空格
                })
            }
            //先进行上面的解析，如果发现node还有子节点，就递归地进行子节点的解析
            if (node.childNodes && node.childNodes.length)
                this.compile(node)
        })
    }

    //解析指令
    compileNode(node) {
        var attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            if (!this.isDirective(attr.name)) return; //如果不是以v-开头的指令，直接返回不处理
            var exp = attr.value.trim() //是string类型,所以还要去除一下两边的空格
            var dir = attr.name //例如v-text
            if (this.isEventDirevtive(dir)) {
                //如果是事件处理函数
            } else {
                //普通指令
                updateFn[dir] && updateFn[dir](node, this.getVal(exp), this.$vm, exp)
                new Watcher(this.$vm, exp, (value) => {
                    updateFn[dir] && updateFn[dir](node, value, this.$vm, exp);
                });
            }
        })
    }

    //替换文本内容
    //网上代码是直接调用了v-text的那个方法，但其实{{}}有一个很大的区别是，括号之外的文字是会保留的，之替换大括号这一部分，所以要另外写个方法
    compileText(node, exp, content) {
        var val = this.getVal(content)
        if (val === undefined) val = "";
        var text = node.textContent //保留一份原来的格式以供更新
        node.textContent = node.textContent.replace(exp, val)
        new Watcher(this.$vm, content, (value) => {
            if (value === undefined) value = "";
            node.textContent = text.replace(exp, value)
        });
    }

    //获取vm上的数据值
    getVal(exp) {
        var val = this.$vm
        var exps = exp.split('.')
        exps.forEach(key => {
            val = val[key] //只是在改变val的指针指向，不会影响到$vm数据
        })
        return val;
    }
}

//指令函数
var updateFn = {
    "v-text": function (node, val) {
        node.textContent = val === undefined ? '' : val
    },
    "v-html": function (node, val) {
        node.innerHTML = val === undefined ? '' : val
    },
    "v-model": function (node, val, vm, exps) {
        node.value = val === undefined ? '' : val
        node.addEventListener('input', e => {
            exp = exps.split('.')
            var len = exp.length
            if (len == 1) {
                return vm[exp] = e.target.value
            }
            var data = vm
            for (let i = 0; i < len - 1; i++) {
                data = data[exp[i]]
                console.log(exp[i])
            }
            data[exp[len - 1]] = e.target.value
        })
    }
}
