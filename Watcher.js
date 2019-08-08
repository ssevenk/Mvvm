class Watcher {
    constructor(vm, exp, cb) {
        this.$vm = vm
        this.$cb = cb
        this.$deps = new Set()

        //获取到初始值，并将自己添加到Dep的订阅者数组上
        if (typeof exp === 'function') {
            this.getter = exp
        }
        else {
            this.getter = this.createGetter(exp)
        }
        this.$value = this.runGetter()
    }

    //将dep添加进来，并通知dep把自己也加到它那边去，$deps的作用只是为了防止同一个dep重复添加自己
    addDep(dep) {
        this.$deps.add(dep)
    }
    update() {
        var oldVal = this.$value
        var newVal = this.runGetter()
        if (newVal === oldVal) return;
        this.$value = newVal
        this.$cb.call(this.$vm, newVal, oldVal)
    }
    runGetter() {
        if (!this.getter) return;
        Dep.target = this
        var value = this.getter.call(this.$vm, this.$vm);
        Dep.target = null
        return value;
    }
    createGetter(exp) {
        var exps = exp.split('.')
        return function (vm) {
            var val = vm
            exps.forEach(key => {
                val = val[key]
            });
            return val;
        }
    }
}