class Mvvm {
    constructor(options = {}) {
        //将所有属性挂载到$options
        this.$options = options;
        // 将data数据取出来赋给$data
        this.$data = this.$options.data;

        // 数据劫持
        this.observe(this.$data);

        //数据代理 省略vm._data.a为vm.a
        this.proxyData(this.$data)

        //编译页面
        this.$compiler = new Compiler(this, this.$options.el || document.body) //如果没传，就用body
    }
    observe(data) {
        if (!data || typeof data !== 'object') return;
        // 取出所有属性遍历
        Object.keys(data).forEach(key => {
            this.defineValue(data, key, data[key]);
        });
    }
    defineValue(data, key, val) {
        var dep = new Dep()
        var _this = this
        _this.observe(val); // 监听子属性
        Object.defineProperty(data, key, {
            writable: true,
            enumerable: true, // 可枚举
            configurable: false, // 不能再define
            get: function () {
                if (Dep.target) {
                    dep.bind()
                }
                return val;
            },
            set: function (newVal) {
                if (newVal === val) return;
                console.log('监听到值变化了: ', val, '==>', newVal);
                val = newVal;
                _this.observe(val) //对新值进行监听，因为它可能是个对象
                dep.notify()
            }
        });
        var app = new Vue({
            el: '#app',
            data: {
                a: 1,
                b: 2,
                c: 3,
                d: {
                    e: 4
                }
            }
        })
    }
    proxyData(data) {
        //因为只是为了省略$data，所以只需要遍历第一层，不用深度遍历
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: function () {
                    return this.$data[key]
                },
                set: function (newVal) {
                    this.$data[key] = newVal
                }
            }
            )
        })
    }
}

