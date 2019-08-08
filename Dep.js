class Dep {
    constructor() {
        this.subs = new Set(); //为了保证不重复添加
    }
    bind() {
        //注册当前活跃的用户为订阅者,并让对方添加自己
        this.subs.add(Dep.target)
        Dep.target.addDep(this)
    }
    notify() {
        //通知所有订阅者执行更新函数
        this.subs.forEach(item => {
            item.update()
        })
    }
}

