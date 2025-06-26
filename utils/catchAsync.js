//basically we return a function that accepts a function and then it executes a function, but it catches any error and passes it to next if there is an error so we can now use this to wrap our async function
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}