module.exports = {
    test() {
        return '123'
    },
    test2() {
        const a = {
            b: 1
        }
        return {
            ...a,
            c: 2
        }
    }
}
